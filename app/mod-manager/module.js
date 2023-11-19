const path = require('path')
const fs = require('fs')
const { DirectoryJsonElement } = require('./directory-json-element')
const { ModuleVersion } = require('./version')
const compareVersions = require('../common/compare-versions')
const findFileAndGetUri = require('../common/find-file-and-get-uri')

class Module {
    constructor(sourceName, moduleName, git) {
        this.git = git
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
        this.icon = findFileAndGetUri(this.dirname, /^icon\.(?:png|jpg|jpge|gif|ico)$/)
        this.banner = findFileAndGetUri(this.dirname, /^banner\.(?:png|jpg|jpge|gif|ico)$/)
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

    async addVersion(versionNum, versionInfo) {
        const newVersion = new ModuleVersion(this.sourceName, this.moduleName, versionNum)
        newVersion.element.putInfo(versionInfo)
        this.versions.unshift(newVersion)
        await this.git.add([path.resolve(newVersion.dirname, 'version.json')])
        await this.git.commit(`New version of ${this.moduleName}: ${versionNum}`)
    }

    async deleteVersion(versionNum) {
        const targetVersionIndex = this.versions.findIndex(x => x.version === versionNum)
        if (targetVersionIndex !== -1) {
            this.versions[targetVersionIndex].element.delete()
            await this.git.rm([path.resolve(this.versions[targetVersionIndex].dirname), '-r'])
            await this.git.commit(`Delete version of ${this.moduleName}: ${this.versions[targetVersionIndex].version}`)
            this.versions.splice(targetVersionIndex, 1)
        }

        if (this.element.info.recommendedVersion && this.element.info.recommendedVersion === versionNum) {
            const newRecommendedVersion = this.versions.find(x => x.element.info?.downloadLink?.length)
            if (newRecommendedVersion) {
                this.element.updateInfo({
                    recommendedVersion: newRecommendedVersion.element.info.version ?? ''
                })
            }
        }
    }

    async update(moduleInfoPatch) {
        this.element.updateInfo(moduleInfoPatch)
        if (moduleInfoPatch.name && moduleInfoPatch.name !== this.moduleName) {
            this.element.rename(moduleInfoPatch.name)
            this.moduleName = moduleInfoPatch.name
            this.init()
        }
        await this.git.add('.')
        await this.git.commit('Update module: ' + this.moduleName)
    }
}

module.exports = { Module }