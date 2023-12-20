const path = require('path')
const fs = require('fs')
const url = require('url')
const archiver = require('archiver')
const { DirectoryJsonElement } = require('./directory-json-element')
const { ModuleVersion } = require('./version')
const compareVersions = require('../common/compare-versions')
const findFileAndGetUri = require('../common/find-file-and-get-uri')

class Module {
    constructor(sourceName, moduleName) {
        this.sourceName = sourceName
        this.moduleName = moduleName
        this.init()
    }

    init() {
        this.dirname = path.resolve(process.cwd(), 'sources', this.sourceName, 'modules', this.moduleName)
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
                        return new ModuleVersion(this.sourceName, this.moduleName, dirContent)
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
        const newVersion = new ModuleVersion(this.sourceName, this.moduleName, versionNum)
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
        const lowercaseModuleName = this.moduleName.toLowerCase()

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

        archive.append(JSON.stringify({
            name: modJson.name,
            description: modJson.description,
            descriptionI18n: modJson.descriptionI18n,
            notes: versionJson.notes,
            notesI18n: versionJson.notesI18n,
            version: versionJson.version,
            fileName: versionJson.main,
            configFiles: versionJson.configFiles,
            updateWorkingDir: `./${lowercaseModuleName}`,
            fromLocalArchive: true,
            compressed: true
        }), { name: 'version.json' })

        archive.append(JSON.stringify({
            ...modJson,
            icon: modJson.icon ? path.basename(url.fileURLToPath(modJson.icon)) : null,
            banner: modJson.banner ? path.basename(url.fileURLToPath(modJson.banner)) : null,
            version: versionJson.version,
            main: versionJson.main,
            configFiles: versionJson.configFiles
        }), { name: `${lowercaseModuleName}/mod.json` })

        // Add module_data files to the moduleName directory in the ZIP file
        const moduleDataDir = path.join(version.dirname, 'module_data')

        if (fs.existsSync(moduleDataDir)) {
            archive.directory(moduleDataDir, `/${lowercaseModuleName}`)
        }

        // Add icon and banner files to the moduleName directory in the ZIP file
        if (this.icon) {
            const iconPath = url.fileURLToPath(this.icon)
            archive.file(iconPath, { name: `/${lowercaseModuleName}/${path.basename(iconPath)}` })
        }
        if (this.banner) {
            const bannerPath = url.fileURLToPath(this.banner)
            archive.file(bannerPath, { name: `/${lowercaseModuleName}/${path.basename(bannerPath)}` })
        }

        await archive.finalize()
    }
}

module.exports = { Module }