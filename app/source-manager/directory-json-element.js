const fs = require('fs')
const path = require('path')

class DirectoryJsonElement {
    constructor(dirname, fileName) {
        this.dirname = dirname
        this.fileName = fileName

        this.ensureDirectoryExistence()
        this.refreshInfo()
        this.refreshModifiedAt()
    }

    ensureDirectoryExistence() {
        const directories = this.dirname.split(path.sep);

        if (path.sep === '/') {
            directories.unshift('/')
        }

        let currentPath = directories.shift()
        for (const directory of directories) {
            currentPath = path.join(currentPath, directory)
            
            if (!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath)
            }
        }
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

    putInfo(newInfo) {
        this.info = newInfo
        this.saveInfo()
    }

    updateInfo(patch) {
        this.info = Object.assign(this.info, patch)
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

    rename(newDirName) {
        const parentDir = path.join(this.dirname, '..')
        const newDirPath = path.join(parentDir, newDirName)
        fs.renameSync(this.dirname, newDirPath)
        this.dirname = newDirPath
        this.refreshModifiedAt()
    }
}

module.exports = { DirectoryJsonElement }