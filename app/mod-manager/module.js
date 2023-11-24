const path = require('path')
const fs = require('fs')
const url = require('url')
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
        } else {
            this.versions = []
        }
    }

    getVersion(versionNum) {
        return this.versions.find(x => x.element.info?.version === versionNum)
    }

    addVersion(versionNum, versionInfo) {
        const newVersion = new ModuleVersion(this.sourceName, this.moduleName, versionNum)
        newVersion.element.putInfo(versionInfo)
        this.versions.unshift(newVersion)
    }

    deleteVersion(versionNum) {
        const targetVersionIndex = this.versions.findIndex(x => x.version === versionNum)
        if (targetVersionIndex !== -1) {
            this.versions[targetVersionIndex].element.delete()
            this.versions.splice(targetVersionIndex, 1)
        }

        if (this.element.info.recommendedVersion && this.element.info.recommendedVersion === versionNum) {
            const newRecommendedVersion = this.versions.find(x => x.element.info?.downloadLinks?.length)
            if (newRecommendedVersion) {
                this.element.updateInfo({
                    recommendedVersion: newRecommendedVersion.element.info.version ?? ''
                })
            }
        }
    }

    update(moduleInfoPatch) {
        this.element.updateInfo(moduleInfoPatch)
        if (moduleInfoPatch.name && moduleInfoPatch.name !== this.moduleName) {
            this.element.rename(moduleInfoPatch.name)
            this.moduleName = moduleInfoPatch.name
            this.init()
        }
    }
}

module.exports = { Module }