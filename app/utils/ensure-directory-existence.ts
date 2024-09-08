import fs from 'node:fs'
import path from 'node:path'

export const ensureDirectoryExistence = (dirname: string) => {
    const directories = dirname.split(path.sep)

    if (!directories[0].endsWith(':')) {
        directories.unshift('/')
    }

    let currentPath = directories.shift() ?? ''
    for (const directory of directories) {
        currentPath = path.join(currentPath, directory)

        if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath)
        }
    }
}