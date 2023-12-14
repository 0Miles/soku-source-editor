const fs = require('fs')
const path = require('path')
const { Module } = require('./module')
const { default: simpleGit } = require('simple-git')
const { DirectoryJsonElement } = require('./directory-json-element')
const chokidar = require('chokidar')

class Source {
    constructor(sourceName) {
        this.sourceName = sourceName
        this.pendingChanges = []
        this.init()
        this.watch()
    }

    async watch() {
        await this.stopWatching()
        this.watcher = chokidar.watch(path.join(this.dirname, 'modules'), {
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
                            await this.git.add(addAndChangeFile.path)
                        } catch (ex) {
                            console.log(ex)
                        }
                    }
                }

                if (removeFiles?.length > 0) {
                    for (const removeFile of removeFiles) {
                        try {
                            await this.git.add(removeFile.path)
                        } catch (ex) {
                            console.log(ex)
                        }
                    }
                }
                
                await this.git.commit(this.pendingChanges.map(x => `${x.event} ${x.path.replace(this.dirname, '')}`).join(', '))
                this.pendingChanges = []
                await this.checkAndUpdateSourceModulesJson()
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
        this.dirname = path.resolve(process.cwd(), 'sources', this.sourceName)
        this.git = simpleGit(this.dirname)
        this.element = new DirectoryJsonElement(this.dirname, 'soku-mod-source.json')
        this.refreshModules()
    }

    getData() {
        return {
            name: this.sourceName,
            isSource: !!this.element.info,
            info: this.element.info
        }
    }

    async checkAndUpdateSourceModulesJson() {
        this.refreshModules()
        const modulesJsonString = JSON.stringify(
            this.modules.map(x => ({
                name: x.moduleName,
                icon: x.icon && path.basename(x.icon),
                banner: x.banner && path.basename(x.banner)
            }))
        )

        const modulesJsonFilename = path.join(this.dirname, 'modules.json')
        let oldJsonString = ''
        if (fs.existsSync(modulesJsonFilename)) {
            oldJsonString = fs.readFileSync(modulesJsonFilename, { encoding: 'utf-8'})
        }
        if (modulesJsonString != oldJsonString) {
            fs.writeFileSync(modulesJsonFilename, modulesJsonString, { encoding: 'utf-8'})
            await this.git.add(modulesJsonFilename)
            await this.git.commit('Update modules.json')
        }
    }

    refreshModules() {
        const modulesDir = path.join(this.dirname, 'modules')
        if (!fs.existsSync(modulesDir)) {
            fs.mkdirSync(modulesDir)
        }

        const dirContents = fs.readdirSync(modulesDir, { encoding: 'utf-8' })
        this.modules = dirContents
            .map(dirContent => {
                const stat = fs.statSync(path.join(modulesDir, dirContent))
                if (stat.isDirectory()) {
                    return new Module(this.sourceName, dirContent)
                }
                return null
            })
            .filter(x => x && x.element.info)
            .sort((a, b) => b.element.modifiedAt - a.element.modifiedAt)
    }

    getModule(moduleName) {
        return this.modules.find(x => x.moduleName === moduleName)
    }

    addModule(moduleName, moduleInfo) {
        const newModule = new Module(this.sourceName, moduleName)
        newModule.element.putInfo(moduleInfo)
        this.modules.unshift(newModule)
    }

    deleteModule(moduleName) {
        const targetModuleIndex = this.modules.findIndex(x => x.moduleName === moduleName)
        if (targetModuleIndex !== -1) {
            this.modules[targetModuleIndex].element.delete()
            this.modules.splice(targetModuleIndex, 1)
        }
    }

    async refreshGitStatus() {
        this.status = await this.git.status()
    }

    async pullAndMerge(branch) {
        if (!branch) {
            await this.refreshGitStatus()
            branch = this.status.current
        }
        await this.git.pull('origin', branch, { '--strategy-option': 'theirs' })
    }

    async sync(branch) {
        if (!branch) {
            await this.refreshGitStatus()
            branch = this.status.current
        }
        await this.git.fetch()
        await this.pullAndMerge(branch)
        await this.git.push('origin', branch)
        await this.refreshGitStatus()
        this.refreshModules()
    }

    async fetchStatus() {
        this.status = await this.git.fetch().status()
    }
}

module.exports = { Source }