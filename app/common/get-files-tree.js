const fs = require('fs')
const path = require('path')
const url = require('url')

module.exports = getFilesTree = (paths) => {
    let result = []
    for (const originPath of paths) {
        const absPath = path.resolve(originPath)
        const absPathStat = fs.statSync(absPath)
        if (absPathStat.isDirectory()) {
            const dir = {
                type: 'directory',
                name: path.basename(absPath),
                url: url.pathToFileURL(absPath).href
            }
            dir.children = getFilesTree(fs.readdirSync(absPath).map(x => path.resolve(absPath, x)))
            result.push(dir)
        } else {
            result.push({
                type: 'file',
                name: path.basename(absPath),
                url: url.pathToFileURL(absPath).href
            })
        }
    }
    result.sort((a, b) => {
        if (a.type === b.type) {
            return 0
        } else if (a.type === 'directory') {
            return -1
        } else {
            return 1
        }
    })
    return result
}