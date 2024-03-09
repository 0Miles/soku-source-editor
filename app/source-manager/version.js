const path = require('path')
const fs = require('fs')
const { DirectoryJsonElement } = require('./directory-json-element')
const url = require('url')
const getFilesTree = require('../common/get-files-tree')
const { app } = require('electron')

class ModuleVersion {
    constructor(sourceName, moduleName, version, sourcesDir) {
        this.sourceName = sourceName
        this.moduleName = moduleName
        this.sourcesDir = sourcesDir
        this.version = version

        this.dirname = path.join(this.sourcesDir, sourceName, 'modules', moduleName, 'versions', version)
        this.element = new DirectoryJsonElement(this.dirname, 'version.json')
        this.refreshModVersionFiles()
    }

    getData() {
        return {
            ...this.element.info,
            moduleFiles: this.moduleFiles
        }
    }

    refreshModVersionFiles() {
        const moduleDataPath = path.resolve(this.dirname, 'module_data')
        if (fs.existsSync(moduleDataPath)) {
            this.moduleFiles = getFilesTree([moduleDataPath]).find(_ => true)
        }
    }

    update(versionInfoPatch) {
        this.element.updateInfo(versionInfoPatch)
    }

    copyModVersionFiles(files) {
        const versionModuleDataDir = path.resolve(this.dirname, 'module_data')
        if (fs.existsSync(versionModuleDataDir)) {
            fs.rmSync(versionModuleDataDir, { recursive: true, force: true })
        }
        fs.mkdirSync(versionModuleDataDir)

        for (const file of files) {
            fs.cpSync(url.fileURLToPath(file.url), path.resolve(versionModuleDataDir, file.name), { recursive: true, force: true })
        }
        this.refreshModVersionFiles()
    }
}

module.exports = { ModuleVersion }