import fs from 'fs'
import path from 'path'
import { ensureDirectoryExistence } from '../utils/ensure-directory-existence'

export class DirectoryJsonElement<T extends Record<string, any> = Record<string, any>> {
    dirname: string
    fileName: string
    modifiedAt?: number
    info: T | null = null
    
    constructor(dirname: string, fileName: string) {
        this.dirname = dirname
        this.fileName = fileName

        ensureDirectoryExistence(this.dirname)
        this.refreshInfo()
        this.refreshModifiedAt()
    }

    refreshModifiedAt() {
        const dirStat = fs.statSync(this.dirname)
        this.modifiedAt = dirStat.mtimeMs
    }

    refreshInfo() {
        const jsonInfoFilename = path.resolve(this.dirname, this.fileName)
        if (fs.existsSync(jsonInfoFilename)) {
            try {
                const jsonString = fs.readFileSync(jsonInfoFilename, { encoding: 'utf-8' })
                const info = JSON.parse(jsonString)
                this.info = info
            }
            catch { }
        } else {
            this.info = null
        }
    }

    putInfo(newInfo: T | null) {
        this.info = newInfo
        this.saveInfo()
    }

    updateInfo(patch: Partial<T>) {
        this.info = Object.assign(this.info ?? {} as T, patch)
        this.saveInfo()
    }

    saveInfo() {
        fs.writeFileSync(path.resolve(this.dirname, this.fileName), JSON.stringify(this.info), { encoding: 'utf-8' })
        this.refreshModifiedAt()
    }

    delete() {
        if (fs.existsSync(this.dirname)) {
            fs.rmSync(this.dirname, { recursive: true, force: true })
        }
    }

    rename(newDirName: string) {
        const parentDir = path.join(this.dirname, '..')
        const newDirPath = path.join(parentDir, newDirName)
        fs.renameSync(this.dirname, newDirPath)
        this.dirname = newDirPath
        this.refreshModifiedAt()
    }
}