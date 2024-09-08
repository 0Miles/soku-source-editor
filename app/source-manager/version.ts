import path from 'path'
import fs from 'fs'
import { DirectoryJsonElement } from './directory-json-element'
import url from 'url'
import { getFileTree } from '../utils/get-file-tree'
import { ModuleVersionInfo } from './types/module-version-info'

export class ModuleVersion {
    
    sourceName: string
    moduleName: string
    sourcesDir: string
    version: string
    dirname: string
    element: DirectoryJsonElement<ModuleVersionInfo>
    moduleFiles?: { type: string; name: string; url: string }

    constructor(sourceName: string, moduleName: string, version: string, sourcesDir: string) {
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
            this.moduleFiles = getFileTree([moduleDataPath]).find(_ => true)
        }
    }

    update(versionInfoPatch: Partial<ModuleVersionInfo>) {
        this.element.updateInfo(versionInfoPatch)
    }

    copyModVersionFiles(files: any) {
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