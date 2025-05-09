import fs from 'fs'
import path from 'path'
import { Module } from './module'
import { SimpleGit, default as simpleGit, StatusResult } from 'simple-git'
import { DirectoryJsonElement } from './directory-json-element'
import chokidar from 'chokidar'
import { ModuleInfo } from './types/module-info'
import { SourceInfo } from './types/source-info'

export class Source {
    sourceName: string
    sourcesDir: string
    pendingChanges: any[]
    
    dirname?: string
    element?: DirectoryJsonElement<SourceInfo>
    watcher?: chokidar.FSWatcher
    commitTimeout: string | number | NodeJS.Timeout | undefined
    git?: SimpleGit 
    modules?: Module[]
    status?: StatusResult

    constructor(sourceName: string, sourcesDir: string) {
        this.sourceName = sourceName
        this.sourcesDir = sourcesDir
        this.pendingChanges = []
        this.init()
        this.watch()
    }

    async watch() {
        await this.stopWatching()
        this.watcher = chokidar.watch(path.join(this.dirname!, 'modules'), {
            ignored: /[\/\\]\./,
            persistent: true,
            ignoreInitial: true
        })

        this.watcher.on('all', (event, path) => {
            if (['add', 'change', 'unlink'].includes(event)) {
                this.pendingChanges.push({ event, path })
            }
            clearTimeout(this.commitTimeout)
            this.commitTimeout = setTimeout(async () => {
                const addAndChangeFiles = this.pendingChanges.filter(x => x.event === 'add' || x.event === 'change')
                const removeFiles = this.pendingChanges.filter(x => x.event === 'unlink')
                if (addAndChangeFiles?.length > 0) {
                    for (const addAndChangeFile of addAndChangeFiles) {
                        try {
                            await this.git?.add(addAndChangeFile.path)
                        } catch (ex) {
                            // console.log(ex)
                        }
                    }
                }

                if (removeFiles?.length > 0) {
                    for (const removeFile of removeFiles) {
                        try {
                            await this.git?.add(removeFile.path)
                        } catch (ex) {
                            // console.log(ex)
                        }
                    }
                }

                await this.git?.commit(this.pendingChanges.map(x => `${x.event} ${x.path.replace(this.dirname, '')}`).join(', '))
                this.pendingChanges = []
            }, 1000)
        })
    }

    async stopWatching() {
        if (this.watcher) {
            await this.watcher.close()
        }
    }

    __destroy() {
        this.stopWatching()
    }

    init() {
        this.dirname = path.join(this.sourcesDir, this.sourceName)
        this.git = simpleGit(this.dirname)
        this.element = new DirectoryJsonElement(this.dirname, 'soku-mod-source.json')
        this.refreshModules()
    }

    getData() {
        return {
            name: this.sourceName,
            isSource: !!this.element?.info,
            info: this.element?.info
        }
    }

    async checkAndUpdateModulesJson() {
        const modulesJsonString = JSON.stringify(
            this.modules?.map(x => ({
                name: x.moduleName,
                icon: x.icon && path.basename(x.icon),
                banner: x.banner && path.basename(x.banner)
            }))
        )

        const modulesJsonFilename = path.join(this.dirname!, 'modules.json')
        let oldJsonString = ''
        if (fs.existsSync(modulesJsonFilename)) {
            oldJsonString = fs.readFileSync(modulesJsonFilename, { encoding: 'utf-8' })
        }
        if (modulesJsonString != oldJsonString) {
            fs.writeFileSync(modulesJsonFilename, modulesJsonString, { encoding: 'utf-8' })
            await this.git?.add(modulesJsonFilename)
            await this.git?.commit('Update modules.json')
        }
    }

    async checkAndUpdateModulesSnapshotJson() {
        const modulesJsonString = JSON.stringify(
            this.modules?.map(x => {
                const info = x.getData()
                const recommendedVersion = x.versions?.find(v => v?.version === info.recommendedVersionNumber)?.getData()
                return {
                    name: info.name,
                    author: info.author,
                    priority: info.priority,
                    repositories: info.repositories,
                    description: info.description,
                    descriptionI18n: info.descriptionI18n,
                    versionNumbers: info.versionNumbers,
                    icon: info.icon && path.basename(info.icon),
                    banner: info.banner && path.basename(info.banner),
                    recommendedVersionNumber: info.recommendedVersionNumber,
                    recommendedVersion: {
                        version: recommendedVersion?.version,
                        notes: recommendedVersion?.notes,
                        notesI18n: recommendedVersion?.notesI18n,
                        main: recommendedVersion?.main,
                        configFiles: recommendedVersion?.configFiles,
                        downloadLinks: recommendedVersion?.downloadLinks,
                    }
                }
            })
        )

        const jsonFilename = path.join(this.dirname!, 'modules-snapshot.json')
        let oldJsonString = ''
        if (fs.existsSync(jsonFilename)) {
            oldJsonString = fs.readFileSync(jsonFilename, { encoding: 'utf-8' })
        }
        if (modulesJsonString != oldJsonString) {
            fs.writeFileSync(jsonFilename, modulesJsonString, { encoding: 'utf-8' })
            await this.git?.add(jsonFilename)
            await this.git?.commit('Update modules-snapshot.json')
        }
    }

    refreshModules() {
        const modulesDir = path.join(this.dirname!, 'modules')
        if (!fs.existsSync(modulesDir)) {
            fs.mkdirSync(modulesDir)
        }

        const dirContents = fs.readdirSync(modulesDir, { encoding: 'utf-8' })
        this.modules = dirContents
            .map(dirContent => {
                const stat = fs.statSync(path.join(modulesDir, dirContent))
                if (stat.isDirectory()) {
                    return new Module(this.sourceName, dirContent, this.sourcesDir)
                }
            })
            .filter(x => !!x && x.element?.info)
            .sort((a, b) => (b?.element?.modifiedAt ?? 0) - (a?.element?.modifiedAt ?? 0)) as Module[]
    }

    getModule(moduleName: string) {
        return this.modules?.find(x => x.moduleName === moduleName)
    }

    addModule(moduleName: string, moduleInfo: ModuleInfo | null) {
        const newModule = new Module(this.sourceName, moduleName, this.sourcesDir)
        newModule.element?.putInfo(moduleInfo)
        this.modules?.unshift(newModule)
    }

    deleteModule(moduleName: string) {
        const targetModuleIndex = this.modules?.findIndex(x => x.moduleName === moduleName)
        if (typeof targetModuleIndex !== 'undefined' && targetModuleIndex !== -1) {
            this.modules?.[targetModuleIndex].element?.delete()
            this.modules?.splice(targetModuleIndex, 1)
        }
    }

    async refreshGitStatus() {
        this.status = await this.git?.status()
    }

    async revertChanges(branch?: string) {

        await this.refreshGitStatus()
        if (!branch) {
            branch = this.status?.current ?? 'main'
        }
        await this.stopWatching()
        await this.git?.raw(['reset', '--hard', `origin/${branch}`])
        await this.refreshGitStatus()
        this.refreshModules()
        await this.watch()
        return this.status
    }

    async pullAndMerge(branch?: string) {
        if (!branch) {
            await this.refreshGitStatus()
            branch = this.status?.current ?? 'main'
        }
        await this.stopWatching()
        await this.git?.pull('origin', branch, { '--strategy-option': 'theirs' })
        await this.watch()
    }

    async commitMissingFiles() {
        const missingFiles = this.status?.files
        if (missingFiles && missingFiles.length > 0) {
            await this.git?.add('.')
            await this.git?.commit(`Add missing files`)
        }
    }

    async sync(branch?: string) {
        if (!branch) {
            await this.refreshGitStatus()
            branch = this.status?.current ?? 'main'
        }

        await this.git?.fetch()
        await this.pullAndMerge(branch)

        this.refreshModules()
        await this.checkAndUpdateModulesJson()
        await this.checkAndUpdateModulesSnapshotJson()
        await this.commitMissingFiles()

        await this.git?.push('origin', branch)
        await this.refreshGitStatus()
        this.refreshModules()
    }

    async fetchStatus() {
        this.status = await this.git?.fetch().status()
    }
}