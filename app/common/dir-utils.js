const fs = require('fs')
const path = require('path')
const url = require('url')
const { getGit } = require('./git-utils')

const getJsonInfo = (dirname, filename) => {
    const jsonInfoFilename = path.resolve(dirname, filename)

    if (fs.existsSync(jsonInfoFilename)) {
        try {
            const jsonString = fs.readFileSync(jsonInfoFilename, { encoding: 'utf-8' })
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

const getDirJsonInfos = (dirname, filename) => {
    const elementInfo = fs.statSync(dirname)
    if (elementInfo.isDirectory()) {
        const jsonInfo = getJsonInfo(dirname, filename)
        if (jsonInfo) {
            jsonInfo.createdAt = elementInfo.birthtimeMs
            return jsonInfo
        }
    }

    return null
}

const getSubdirJsonInfos = (dirname, filename) => {
    const data = []
    if (fs.existsSync(dirname)) {
        const elements = fs.readdirSync(dirname, { encoding: 'utf-8' })
        for (const element of elements) {
            const elementFullPath = path.join(dirname, element)
            const jsonInfo = getDirJsonInfos(elementFullPath, filename)
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

const getMods = (sourceName, base = process.cwd()) => {
    const dirname = path.resolve(base, 'sources', sourceName, 'modules')
    if (fs.existsSync(dirname)) {
        const modInfos = getSubdirJsonInfos(dirname, 'mod.json').sort((a, b) => a.createdAt - b.createdAt)
        for (const modInfo of modInfos) {
            modInfo.icon = findFileAndGetUri(modInfo.dirname, /^icon\.(?:png|jpg|jpge|gif|ico)$/)
            modInfo.banner = findFileAndGetUri(modInfo.dirname, /^banner\.(?:png|jpg|jpge|gif|ico)$/)
        }
        return modInfos
    } else {
        return []
    }
}

const getMod = (sourceName, modName, base = process.cwd()) => {
    const mods = getMods(sourceName, base)
    return mods.find(x => x.name === modName)
}

const getModVersions = (sourceName, modName, base = process.cwd()) => {
    const dirname = path.resolve(base, 'sources', sourceName, 'modules', modName)

    if (fs.existsSync(dirname)) {
        return getSubdirJsonInfos(path.resolve(dirname, 'versions'), 'version.json')
            .sort((a, b) => compareVersions(b.version, a.version))
    }
    return []
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

    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname)
    }

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
}

const deleteSource = (sourceName, base = process.cwd()) => {
    const dirname = path.resolve(base, 'sources', sourceName)
    if (fs.existsSync(dirname)) {
        fs.rmSync(dirname, { recursive: true, force: true })
    }
}

const deleteMod = async (sourceName, modName, base = process.cwd()) => {
    const dirname = getMod(sourceName, modName, base)?.dirname
    if (fs.existsSync(dirname)) {
        fs.rmSync(dirname, { recursive: true, force: true })
        const git = getGit(sourceName)
        await git.rm([path.resolve(dirname), '-r'])
        await git.commit(`Delete module: ${modName}`)
    }
}

const deleteModVersion = async (sourceName, modName, version, base = process.cwd()) => {
    const modDirname = getMod(sourceName, modName, base)?.dirname ?? ''
    const dirname = path.resolve(modDirname, 'versions', version)
    if (fs.existsSync(dirname)) {
        fs.rmSync(dirname, { recursive: true, force: true })
        const git = getGit(sourceName)
        await git.rm([path.resolve(dirname), '-r'])
        await git.commit(`Delete version of ${modName}: ${version}`)
    }
}

const writeFile = (dir, filename, content, base = process.cwd()) => {
    const dirname = path.resolve(base, dir)
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname)
    }
    fs.writeFileSync(path.resolve(dirname, filename), content, { encoding: 'utf-8' })
}

const addMod = async (sourceName, moduleName, content) => {
    const modulesDir = path.resolve('sources', sourceName, 'modules')
    if (!fs.existsSync(modulesDir)) {
        fs.mkdirSync(modulesDir)
    }
    const moduleDir = path.resolve(modulesDir, moduleName)
    writeFile(moduleDir, 'mod.json', content)
    const git = getGit(sourceName)
    await git.add([path.resolve(moduleDir, 'mod.json')])
    await git.commit('New module: ' + moduleName)
}

const addModVersion = async (sourceName, moduleName, version, content) => {
    const versionsDir = path.resolve('sources', sourceName, 'modules', moduleName, 'versions')
    if (!fs.existsSync(versionsDir)) {
        fs.mkdirSync(versionsDir)
    }
    const versionDir = path.resolve(versionDir, version)
    writeFile(versionDir, 'version.json', content)
    const git = getGit(sourceName)
    await git.add([path.resolve(versionDir, 'version.json')])
    await git.commit(`New version of ${moduleName}: ${version}`)
}

module.exports = {
    getMods,
    getMod,
    getModVersions,
    getSources,
    deleteSource,
    writeFile,
    addMod,
    addModVersion,
    deleteMod,
    deleteModVersion
}