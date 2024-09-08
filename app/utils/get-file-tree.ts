import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

type FileNode = {
    type: 'file'
    name: string
    url: string
}

type DirNode = {
    type: 'directory'
    name: string
    url: string
    children?: FileTree[]
}

type FileTree = FileNode | DirNode

export const getFileTree = (paths: string[]) => {
    let result: FileTree[] = []
    for (const originPath of paths) {
        const absPath = path.resolve(originPath)
        const absPathStat = fs.statSync(absPath)
        if (absPathStat.isDirectory()) {
            const dir: DirNode = {
                type: 'directory',
                name: path.basename(absPath),
                url: url.pathToFileURL(absPath).href
            }
            dir.children = getFileTree(fs.readdirSync(absPath).map(x => path.resolve(absPath, x)))
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