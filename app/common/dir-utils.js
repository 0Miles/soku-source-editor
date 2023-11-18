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
    const elementStat = fs.statSync(dirname)
    if (elementStat.isDirectory()) {
        const jsonInfo = getJsonInfo(dirname, filename)
        if (jsonInfo) {
            jsonInfo.modifiedAt = elementStat.mtimeMs
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
        const modInfos = getSubdirJsonInfos(dirname, 'mod.json').sort((a, b) => b.modifiedAt - a.modifiedAt)
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
        const versionInfos = getSubdirJsonInfos(path.resolve(dirname, 'versions'), 'version.json')
            .sort((a, b) => compareVersions(b.version, a.version))
        for (const versionInfo of versionInfos) {
            const moduleDataPath = path.resolve(versionInfo.dirname, 'module_data')
            if (fs.existsSync(moduleDataPath)) {
                versionInfo.moduleFiles = getFilesTree([moduleDataPath]).find(_ => true)
            }
        }
        return versionInfos
    }
    return []
}

const compareVersions = (a, b) => {
    const aParts = a.match(/\d+/g)
    const bParts = b.match(/\d+/g)
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = parseInt(aParts[i]) ?? 0
        const bPart = parseInt(bParts[i]) ?? 0
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
        .sort((a, b) => a.stat.mtimeMs - b.stat.mtimeMs)
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

const updateJson = (originJsonFilename, patchJson) => {
    const jsonInfo = JSON.parse(fs.readFileSync(originJsonFilename, { encoding: 'utf-8' }))
    const patch = JSON.parse(patchJson)
    const newModInfo = Object.assign(jsonInfo, patch)
    fs.writeFileSync(originJsonFilename, JSON.stringify(newModInfo), { encoding: 'utf-8' })
}

const addMod = async (sourceName, moduleName, content, base = process.cwd()) => {
    const modulesDir = path.resolve(base, 'sources', sourceName, 'modules')
    if (!fs.existsSync(modulesDir)) {
        fs.mkdirSync(modulesDir)
    }
    const moduleDir = path.resolve(modulesDir, moduleName)
    writeFile(moduleDir, 'mod.json', content)
    const git = getGit(sourceName)
    await git.add([path.resolve(moduleDir, 'mod.json')])
    await git.commit('New module: ' + moduleName)
}

const updateMod = async (sourceName, moduleName, content, base = process.cwd()) => {
    const modulesDir = path.resolve(base, 'sources', sourceName, 'modules')
    if (!fs.existsSync(modulesDir)) {
        fs.mkdirSync(modulesDir)
    }
    const moduleInfoFilename = path.resolve(modulesDir, moduleName, 'mod.json')
    updateJson(moduleInfoFilename, content)

    const git = getGit(sourceName)
    await git.add('.')
    await git.commit('Update module: ' + moduleName)
}

const addModVersion = async (sourceName, moduleName, version, content, base = process.cwd()) => {
    const versionsDir = path.resolve(base, 'sources', sourceName, 'modules', moduleName, 'versions')
    if (!fs.existsSync(versionsDir)) {
        fs.mkdirSync(versionsDir)
    }
    const versionDir = path.resolve(versionsDir, version)
    writeFile(versionDir, 'version.json', content)
    const git = getGit(sourceName)
    await git.add([path.resolve(versionDir, 'version.json')])
    await git.commit(`New version of ${moduleName}: ${version}`)
}

const getAllFilenames = (paths) => {
    let result = []
    for (const originPath of paths) {
        const absPath = path.resolve(originPath)
        const absPathStat = fs.statSync(absPath)
        if (absPathStat.isDirectory()) {
            result = result.concat(fs.readdirSync(absPath).map(x => path.resolve(absPath, x)))
        } else {
            result.push(absPath)
        }
    }
    return result
}

const getFilesTree = (paths) => {
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

const copyModVersionFiles = (files, sourceName, moduleName, version, base = process.cwd()) => {
    const versionsDir = path.resolve(base, 'sources', sourceName, 'modules', moduleName, 'versions')
    if (!fs.existsSync(versionsDir)) {
        fs.mkdirSync(versionsDir)
    }

    const versionDir = path.resolve(versionsDir, version)
    if (!fs.existsSync(versionDir)) {
        fs.mkdirSync(versionDir)
    }

    const versionModuleDataDir = path.resolve(versionDir, 'module_data')
    if (fs.existsSync(versionModuleDataDir)) {
        fs.rmSync(versionModuleDataDir, { recursive: true, force: true })
    }
    fs.mkdirSync(versionModuleDataDir)

    for (const file of files) {
        fs.cpSync(url.fileURLToPath(file.url), path.resolve(versionModuleDataDir, file.name), { recursive: true, force: true })
    }
}


module.exports = {
    getMods,
    getMod,
    getModVersions,
    getSources,
    getAllFilenames,
    getFilesTree,
    deleteSource,
    writeFile,
    addMod,
    addModVersion,
    deleteMod,
    deleteModVersion,
    copyModVersionFiles,
    updateMod
}