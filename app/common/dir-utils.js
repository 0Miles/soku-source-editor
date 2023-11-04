const fs = require('fs')
const path = require('path')
const url = require('url')

const getJsonInfo = (dirname, filename) => {
    const jsonInfoFilename = path.resolve(dirname, filename)

    if (fs.existsSync(jsonInfoFilename)) {
        try {
            const jsonString = fs.readFileSync(jsonInfoFilename, { encoding: 'utf-8'})
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
    if (fs.existsSync(dirname)) {
        const elements = fs.readdirSync(dirname, { encoding: 'utf-8'})
        for (const element of elements) {
            const elementFullPath = path.join(dirname, element)
            const elementInfo = fs.statSync(elementFullPath)
            if (elementInfo.isDirectory()) {
                const jsonInfo = getJsonInfo(elementFullPath, filename)
                if (jsonInfo) {
                    jsonInfo.createdAt = elementInfo.birthtimeMs
                    data.push(jsonInfo)
                }
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

const getMods = (modsDirname, base = process.cwd()) => {
    
    const dirname = path.resolve(base, modsDirname ?? 'modules')
    
    if (fs.existsSync(dirname)) {
        const modInfos = getSubdirJsonInfos(dirname, 'mod.json').sort((a, b) => a.createdAt - b.createdAt)

        for (const modInfo of modInfos) {
            modInfo.icon = findFileAndGetUri(modInfo.dirname, /^icon\.(?:png|jpg|jpge|gif|ico)$/)
            modInfo.banner = findFileAndGetUri(modInfo.dirname, /^banner\.(?:png|jpg|jpge|gif|ico)$/)
            modInfo.versions = getSubdirJsonInfos(path.resolve(modInfo.dirname, 'versions'), 'version.json')
                .sort((a, b) => compareVersions(b.version, a.version))
        }
        return modInfos
    } else {
        return []
    }
}

const compareVersions = (a, b) => {
    const aParts = a.match(/\d+/g)
    const bParts = b.match(/\d+/g)
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = aParts[i] ?? 0
        const bPart = bParts[i] ?? 0
        if (aPart < bPart) {
            return -1
        } else if (aPart > bPart) {
            return 1
        }
    }
    return 0
}

const checkSourceInfo = (dirname) => {
    const sourceInfoFilename = path.resolve(dirname, 'soku-mod-source.json')
    if (fs.existsSync(sourceInfoFilename)) {
        const jsonString = fs.readFileSync(sourceInfoFilename, { encoding: 'utf-8' })
        return JSON.parse(jsonString)
    } else {
        return null
    }
}

const getSources = async (base = process.cwd()) => {
    
    const dirname = path.resolve(base, 'sources')

    if (fs.existsSync(dirname)) {
        const data = fs.readdirSync(dirname, { encoding: 'utf-8' })
            .map(elementName => {
                const fullPath = path.join(dirname, elementName)
                return {
                    name: elementName,
                    stat: fs.statSync(fullPath),
                    fullPath
                }
            })
            .filter(x => x.stat.isDirectory())
            .sort((a, b) => a.stat.birthtimeMs - b.stat.birthtimeMs)
            .map(element => {
                const sourceInfo = checkSourceInfo(element.fullPath)
                return {
                    name: element.name,
                    isSource: !!sourceInfo,
                    info: sourceInfo
                }
            })
        return data
    } else {
        return []
    }
}

const deleteSource = (sourceName, base = process.cwd()) => {
    const dirname = path.resolve(base, 'sources', sourceName)
    if (fs.existsSync(dirname)) {
        fs.rmSync(dirname, { recursive: true, force: true })
    }
}

module.exports = {
    getMods,
    getSources,
    deleteSource
}