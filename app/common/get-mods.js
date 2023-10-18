const fs = require('fs')
const path = require('path')
const url = require('url')

const getJsonInfo = (dirname, filename) => {
    const jsonInfoFilename = path.resolve(dirname, filename)

    if (fs.existsSync(jsonInfoFilename)) {
        try {
            const jsonString = fs.readFileSync(jsonInfoFilename)
            const info = JSON.parse(jsonString)
            if (info) {
                info.dirname = dirname
            }
            return info
        }
        catch
        {
            return null
        }
    }
    return null
}

const getSubdirJsonInfos = (dirname, filename) => {
    const data = []
    const elements = fs.readdirSync(dirname, { encoding: 'utf-8'})
    for (const element of elements) {
        const elementFullPath = path.join(dirname, element)
        const elementInfo = fs.statSync(elementFullPath)
        if (elementInfo.isDirectory()) {
            const jsonInfo = getJsonInfo(elementFullPath, filename)
            if (jsonInfo) {
                data.push(jsonInfo)
            }
        }
    }
    return data
}

const findFileAndGetUri = (dirname, regex) => {
    const fileNames = fs.readdirSync(dirname)
    let fileName = fileNames.find(x => regex.test(x))
    if (fileName) {
        fileName = url.pathToFileURL(path.join(dirname, fileName)).href
    }
    return fileName
}

module.exports = (dirname) => {
    if (!dirname) {
        dirname = process.cwd()
    }
    const modInfos = getSubdirJsonInfos(dirname, 'mod.json')
    
    for (const modInfo of modInfos) {
        modInfo.icon = findFileAndGetUri(modInfo.dirname, /^icon\.(?:png|jpg|jpge|gif|ico)$/)
        modInfo.banner = findFileAndGetUri(modInfo.dirname, /^banner\.(?:png|jpg|jpge|gif|ico)$/)
        modInfo.versions = getSubdirJsonInfos(modInfo.dirname, 'version.json')
    }
    return modInfos
}