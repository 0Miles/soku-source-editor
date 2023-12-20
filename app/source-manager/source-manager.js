const fs = require('fs')
const path = require('path')
const { default: simpleGit } = require('simple-git')
const { Source } = require('./source')

class SourceManager {
    constructor() {
        this.sourcesDir = path.resolve(process.cwd(), 'sources')
        if (!fs.existsSync(this.sourcesDir)) {
            fs.mkdirSync(this.sourcesDir)
        }
        this.refreshSources()
    }

    refreshSources() {
        const dirContents = fs.readdirSync(this.sourcesDir, { encoding: 'utf-8' })
        this.sources = dirContents
            .map(dirContent => {
                const stat = fs.statSync(path.join(this.sourcesDir, dirContent))
                if (stat.isDirectory()) {
                    return new Source(dirContent)
                }
                return null
            })
            .filter(x => x && x.element.info)
            .sort((a, b) => a.element.modifiedAt - b.element.modifiedAt)
    }

    getSource(sourceName) {
        return this.sources.find(x => x.sourceName === sourceName)
    }

    async addSource(url, sourceName) {
        const git = simpleGit(this.sourcesDir)
        await git.clone(url, sourceName ? path.resolve(this.sourcesDir, sourceName) : undefined)
        this.refreshSources()
    }

    async deleteSource(sourceName) {
        const targetSourceIndex = this.sources.findIndex(x => x.sourceName === sourceName)
        if (targetSourceIndex !== -1) {
            await this.sources[targetSourceIndex].stopWatching()
            this.sources[targetSourceIndex].element.delete()
            this.sources.splice(targetSourceIndex, 1)
        }
    }
}

module.exports = { SourceManager }