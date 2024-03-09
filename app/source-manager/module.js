const path = require('path')
const fs = require('fs')
const url = require('url')
const archiver = require('archiver')
const { DirectoryJsonElement } = require('./directory-json-element')
const { ModuleVersion } = require('./version')
const compareVersions = require('../common/compare-versions')
const findFileAndGetUri = require('../common/find-file-and-get-uri')
const { Octokit } = require('@octokit/rest')
const axios = require('axios')
const { shell, app } = require('electron')

class Module {
    constructor(sourceName, moduleName, sourcesDir) {
        this.sourcesDir = sourcesDir
        this.sourceName = sourceName
        this.moduleName = moduleName
        this.init()
    }

    init() {
        this.dirname = path.join(this.sourcesDir, this.sourceName, 'modules', this.moduleName)
        this.element = new DirectoryJsonElement(this.dirname, 'mod.json')
        this.refreshIconAndBanner()
        this.refreshVersions()
    }

    getData() {
        return {
            ...this.element.info,
            name: this.moduleName,
            icon: this.icon,
            banner: this.banner
        }
    }

    refreshIconAndBanner() {
        this.icon = findFileAndGetUri(this.dirname, /^icon\.(?:webp|png|jfif|pjpeg|jpeg|pjp|jpg|gif)$/)
        this.banner = findFileAndGetUri(this.dirname, /^banner\.(?:webp|png|jfif|pjpeg|jpeg|pjp|jpg|gif)$/)
    }

    copyAndReplaceImage(fileUrl, imageName) {
        if (this[imageName] === fileUrl) return

        if (this[imageName]) {
            fs.rmSync(url.fileURLToPath(this[imageName]))
        }

        if (fileUrl) {
            const filePath = url.fileURLToPath(fileUrl)
            const fileExt = path.extname(filePath)
            fs.cpSync(filePath, path.resolve(this.dirname, imageName + fileExt), { recursive: true, force: true })
        }
        this.refreshIconAndBanner()
    }

    refreshVersions() {
        const versionsDir = path.join(this.dirname, 'versions')
        if (fs.existsSync(versionsDir)) {
            const dirContents = fs.readdirSync(versionsDir, { encoding: 'utf-8' })
            this.versions = dirContents
                .map(dirContent => {
                    const stat = fs.statSync(path.join(versionsDir, dirContent))
                    if (stat.isDirectory()) {
                        return new ModuleVersion(this.sourceName, this.moduleName, dirContent, this.sourcesDir)
                    }
                    return null
                })
                .filter(x => x && x.element.info)
                .sort((a, b) => compareVersions(b.version, a.version))

            this.updateVersionNumbers()
        } else {
            this.versions = []
        }
    }

    updateVersionNumbers() {
        const moduleVersionNumbers = this.versions.map(x => x.version)

        const oldVersionNumbersJson = JSON.stringify(this.element.info?.versionNumbers ?? '[]')
        if (oldVersionNumbersJson !== JSON.stringify(moduleVersionNumbers)) {
            this.element.updateInfo({
                versionNumbers: moduleVersionNumbers
            })
        }
    }

    getVersion(versionNum) {
        return this.versions.find(x => x.element.info?.version === versionNum)
    }

    addVersion(versionNum, versionInfo) {
        const newVersion = new ModuleVersion(this.sourceName, this.moduleName, versionNum, this.sourcesDir)
        newVersion.element.putInfo(versionInfo)
        this.versions.unshift(newVersion)
        this.updateVersionNumbers()
    }

    deleteVersion(versionNum) {
        const targetVersionIndex = this.versions.findIndex(x => x.version === versionNum)
        if (targetVersionIndex !== -1) {
            this.versions[targetVersionIndex].element.delete()
            this.versions.splice(targetVersionIndex, 1)
        }

        if (this.element.info.recommendedVersionNumber && this.element.info.recommendedVersionNumber === versionNum) {
            const newRecommendedVersionNumber = this.versions.find(x => x.element.info?.downloadLinks?.length)
            if (newRecommendedVersionNumber) {
                this.element.updateInfo({
                    recommendedVersionNumber: newRecommendedVersionNumber.element.info.version ?? ''
                })
            }
        }
        this.updateVersionNumbers()
    }

    update(moduleInfoPatch) {
        this.element.updateInfo(moduleInfoPatch)
        if (moduleInfoPatch.name && moduleInfoPatch.name !== this.moduleName) {
            this.element.rename(moduleInfoPatch.name)
            this.moduleName = moduleInfoPatch.name
            this.init()
        }
    }

    async exportZip(versionNum, outputDir = null, filename = null) {
        const version = this.getVersion(versionNum)
        const moduleName = this.moduleName

        outputDir = !outputDir ? path.resolve(version.dirname, 'output') : path.resolve(outputDir)
        filename = !filename ? `${this.moduleName}_${versionNum}.zip` : filename

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir)
        }
        // Create a new ZIP file
        const output = fs.createWriteStream(path.join(outputDir, filename))
        const archive = archiver('zip')

        output.on('close', () => {
            console.log('ZIP file created successfully')
        })

        archive.on('error', (err) => {
            throw err
        })

        archive.pipe(output)

        // Add version.json to the root of the ZIP file
        const modJson = this.getData()
        const versionJson = version.getData()

        // Add module_data files to the moduleName directory in the ZIP file
        const moduleDataDir = path.join(version.dirname, 'module_data')
        
        // filter out mod.json
        const filteredFiles = fs.readdirSync(moduleDataDir).filter(file => file !== 'mod.json');

        if (fs.existsSync(moduleDataDir)) {
            archive.directory(moduleDataDir, `/${moduleName}`, filteredFiles)
        }

        // Add mod.json to the moduleName directory in the ZIP file
        archive.append(JSON.stringify({
            name: modJson.name,
            author: modJson.author,
            priority: modJson.priority,
            description: modJson.description,
            descriptionI18n: modJson.descriptionI18n,
            icon: modJson.icon ? path.basename(url.fileURLToPath(modJson.icon)) : null,
            banner: modJson.banner ? path.basename(url.fileURLToPath(modJson.banner)) : null,
            notes: versionJson.notes,
            notesI18n: versionJson.notesI18n,
            version: versionJson.version,
            main: versionJson.main,
            fileName: versionJson.main,
            configFiles: versionJson.configFiles,
            updateWorkingDir: `.`,
            fromLocalArchive: true,
            compressed: true
        }), { name: `mod.json` })

        // Add icon and banner files to the moduleName directory in the ZIP file
        if (this.icon) {
            const iconPath = url.fileURLToPath(this.icon)
            archive.file(iconPath, { name: `/${moduleName}/${path.basename(iconPath)}` })
        }
        if (this.banner) {
            const bannerPath = url.fileURLToPath(this.banner)
            archive.file(bannerPath, { name: `/${moduleName}/${path.basename(bannerPath)}` })
        }

        await archive.finalize()
        await new Promise(resolve => setTimeout(resolve, 1000))
    }

    async exportZipToOutput(versionNum) {
        const outputDir = path.resolve(version.dirname, 'output')
        if (fs.existsSync(outputDir)) {
            fs.deleteSync(outputDir, { recursive: true })
        }
        await exportZip(versionNum)
    }

    async createGithubTagAndRelease(versionNum, repository, githubToken, draft = false, prerelease = false) {
        const version = this.getVersion(versionNum)
        const versionJson = version.getData()

        const octokit = new Octokit({
            auth: githubToken
        })

        const defaultBranchResponse = await octokit.repos.get({
            owner: repository.owner,
            repo: repository.repo,
        })
        const defaultBranch = defaultBranchResponse.data.default_branch

        const headCommitResponse = await octokit.git.getRef({
            owner: repository.owner,
            repo: repository.repo,
            ref: `heads/${repository.branch ?? defaultBranch}`,
        })

        const headCommitSha = headCommitResponse.data.object.sha

        try {
            const tagResponse = await octokit.git.createTag({
                owner: repository.owner,
                repo: repository.repo,
                tag: `v${versionNum}`,
                message: `Release v${versionNum}`,
                object: headCommitSha,
                type: 'commit',
            })

            await octokit.git.createRef({
                owner: repository.owner,
                repo: repository.repo,
                ref: `refs/tags/v${versionNum}`,
                sha: tagResponse.data.sha,
            })
        } catch (ex) {
            console.log(ex)
        }

        let releaseResponse
        try {
            releaseResponse = await octokit.repos.createRelease({
                owner: repository.owner,
                repo: repository.repo,
                tag_name: `v${versionNum}`,
                name: `v${versionNum}`,
                body: versionJson.notes,
                draft,
                prerelease,
            })
        } catch (ex) {
            if (ex.status !== 422) throw ex

            releaseResponse = await octokit.repos.getReleaseByTag({
                owner: repository.owner,
                repo: repository.repo,
                tag: `v${versionNum}`,
            })

            await octokit.repos.updateRelease({
                owner: repository.owner,
                repo: repository.repo,
                release_id: releaseResponse.data.id,
                tag_name: `v${versionNum}`,
                name: `v${versionNum}`,
                body: versionJson.notes,
                draft,
                prerelease,
            })
        }

        const filePath = path.resolve(version.dirname, 'output', `${this.moduleName}_${versionNum}.zip`)
        if (!fs.existsSync(filePath)) {
            await this.exportZip(versionNum)
        }

        const oldAssetResonse = await octokit.repos.listReleaseAssets({
            owner: repository.owner,
            repo: repository.repo,
            release_id: releaseResponse.data.id,
        })

        for (const asset of oldAssetResonse.data) {
            if (asset.name === `${this.moduleName}_${versionNum}.zip`) {
                await octokit.repos.deleteReleaseAsset({
                    owner: repository.owner,
                    repo: repository.repo,
                    asset_id: asset.id,
                })
            }
        }

        const uploadResponse = await octokit.repos.uploadReleaseAsset({
            owner: repository.owner,
            repo: repository.repo,
            release_id: releaseResponse.data.id,
            name: `${this.moduleName}_${versionNum}.zip`,
            data: fs.readFileSync(filePath),
            headers: {
                'Content-Type': 'application/zip',
            }
        })

        return uploadResponse.data.browser_download_url
    }

    async createGiteeTagAndRelease(versionNum, repository, giteeToken, prerelease = false) {
        const version = this.getVersion(versionNum)
        const versionJson = version.getData()

        try {
            const defaultBranchResponse = await axios.get(`https://gitee.com/api/v5/repos/${repository.owner}/${repository.repo}`, {
                headers: { 'Authorization': `token ${giteeToken}` }
            })
            const branch = defaultBranchResponse.data.default_branch

            await axios.post(`https://gitee.com/api/v5/repos/${repository.owner}/${repository.repo}/tags`, {
                tag_name: `v${versionNum}`,
                refs: `${repository.branch ?? branch}`,
                message: `v${versionNum}`,
                prerelease
            }, {
                headers: {
                    'Authorization': `token ${giteeToken}`,
                },
            })
        } catch { }

        let releaseId
        try {
            const releaseResponse = await axios.get(`https://gitee.com/api/v5/repos/${repository.owner}/${repository.repo}/releases/tags/v${versionNum}`, {
                headers: {
                    'Authorization': `token ${giteeToken}`,
                },
            })
            releaseId = releaseResponse.data.id

            await axios.patch(`https://gitee.com/api/v5/repos/${repository.owner}/${repository.repo}/releases/${releaseId}`, {
                tag_name: `v${versionNum}`,
                name: `v${versionNum}`,
                body: versionJson.notes,
                target_commitish: `${repository.branch ?? 'main'}`,
                prerelease
            }, {
                headers: {
                    'Authorization': `token ${giteeToken}`,
                },
            })
        } catch { }

        if (!releaseId) {
            const releaseResponse = await axios.post(`https://gitee.com/api/v5/repos/${repository.owner}/${repository.repo}/releases`, {
                tag_name: `v${versionNum}`,
                name: `v${versionNum}`,
                body: !!versionJson.notes ? versionJson.notes : `v${versionNum}`,
                target_commitish: `${repository.branch ?? 'main'}`,
                prerelease
            }, {
                headers: {
                    'Authorization': `token ${giteeToken}`,
                },
            })
            releaseId = releaseResponse.data.id
        }

        const filePath = path.resolve(version.dirname, 'output', `${this.moduleName}_${versionNum}.zip`)
        if (!fs.existsSync(filePath)) {
            await this.exportZip(versionNum)
        }

        shell.openExternal(`https://gitee.com/${repository.owner}/${repository.repo}/releases/v${versionNum}/edit`)
        shell.showItemInFolder(filePath)

        return `https://gitee.com/${repository.owner}/${repository.repo}/releases/download/v${versionNum}/${this.moduleName}_${versionNum}.zip`
    }
}

module.exports = { Module }