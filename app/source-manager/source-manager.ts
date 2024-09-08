import fs from 'fs'
import path from 'path'
import { default as simpleGit } from 'simple-git'
import { Source } from './source'
import { ensureDirectoryExistence } from '../utils/ensure-directory-existence'
import os from 'os'

export class SourceManager {

    sourcesDir: string
    sources?: Source[]

    constructor() {
        this.sourcesDir = path.join(os.homedir(), 'soku-source-manager', 'sources')
        ensureDirectoryExistence(this.sourcesDir)

        this.refreshSources()
    }

    refreshSources() {
        const dirContents = fs.readdirSync(this.sourcesDir, { encoding: 'utf-8' })
        this.sources = dirContents
            .map(dirContent => {
                const stat = fs.statSync(path.join(this.sourcesDir, dirContent))
                if (stat.isDirectory()) {
                    return new Source(dirContent, this.sourcesDir)
                }
                return null
            })
            .filter(x => x && x.element?.info)
            .sort((a, b) => (a?.element?.modifiedAt ?? 0) - (b?.element?.modifiedAt ?? 0)) as Source[]
    }

    getSource(sourceName: string) {
        return this.sources?.find(x => x.sourceName === sourceName)
    }

    async addSource(url: string, sourceName: string) {
        const git = simpleGit(this.sourcesDir)
        if (sourceName) {
            await git.clone(url, path.resolve(this.sourcesDir, sourceName))
        } else {
            await git.clone(url)
        }
        this.refreshSources()
    }

    async deleteSource(sourceName: string) {
        const targetSourceIndex = this.sources?.findIndex(x => x.sourceName === sourceName)
        if (targetSourceIndex && targetSourceIndex !== -1) {
            await this.sources?.[targetSourceIndex].stopWatching()
            this.sources?.[targetSourceIndex].element?.delete()
            this.sources?.splice(targetSourceIndex, 1)
        }
    }
}