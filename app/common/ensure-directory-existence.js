const fs = require('fs')
const path = require('path')

module.exports = ensureDirectoryExistence = (dirname) => {
    const directories = dirname.split(path.sep)

    if (!directories[0].endsWith(':')) {
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