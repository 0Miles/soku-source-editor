import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

export const findFileAndGetUri = (dirname: string, regex: RegExp) => {
    const fileNames = fs.readdirSync(dirname)
    let fileName = fileNames.find(x => regex.test(x))
    if (fileName) {
        fileName = url.pathToFileURL(path.join(dirname, fileName)).href
    }
    return fileName
}