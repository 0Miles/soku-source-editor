const fs = require('fs')
const path = require('path')
const { Module } = require('./module')
const { default: simpleGit } = require('simple-git')
const { DirectoryJsonElement } = require('./directory-json-element')

class Source {
    constructor(sourceName) {
        this.sourceName = sourceName
        this.init()
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

    refreshModules() {
        const modulesDir = path.join(this.dirname, 'modules')
        if (fs.existsSync(modulesDir)) {
            const dirContents = fs.readdirSync(modulesDir, { encoding: 'utf-8' })
            this.modules = dirContents
                .map(dirContent => {
                    const stat = fs.statSync(path.join(modulesDir, dirContent))
                    if (stat.isDirectory()) {
                        return new Module(this.sourceName, dirContent, this.git)
                    }
                    return null
                })
                .filter(x => x && x.element.info)
                .sort((a, b) => b.element.modifiedAt - a.element.modifiedAt)
        } else {
            this.modules = []
        }
    }

    getModule(moduleName) {
        return this.modules.find(x => x.moduleName === moduleName)
    }

    async addModule(moduleName, moduleInfo) {
        const newModule = new Module(this.sourceName, moduleName)
        newModule.element.putInfo(moduleInfo)
        this.modules.unshift(newModule)
        await this.git.add([path.resolve(newModule.dirname, 'mod.json')])
        await this.git.commit('New module: ' + moduleName)
    }

    async deleteModule(moduleName) {
        const targetModuleIndex = this.modules.findIndex(x => x.moduleName === moduleName)
        if (targetModuleIndex !== -1) {
            this.modules[targetModuleIndex].element.delete()
            await this.git.rm([path.resolve(this.modules[targetModuleIndex].dirname), '-r'])
            await this.git.commit(`Delete module: ${this.modules[targetModuleIndex].moduleName}`)
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
    }

    async fetchStatus() {
        this.status = await this.git.fetch().status()
    }
}

module.exports = { Source }