const fs = require('fs')
const path = require('path')
const url = require('url')

const getModInfo = (dirname) => {
    const modInfoFilename = path.resolve(dirname, 'mod.json')
    
    if (fs.existsSync(modInfoFilename)) {
        const jsonString = fs.readFileSync(modInfoFilename)
        const modInfo = JSON.parse(jsonString)

        const fileNames = fs.readdirSync(dirname)
        modInfo.icon = fileNames.find(x => /^icon\.(?:png|jpg|jpge|gif|ico)$/.test(x))
        if (modInfo.icon) {
            modInfo.icon = url.pathToFileURL(path.join(dirname, modInfo.icon)).href
        }
        modInfo.banner = fileNames.find(x => /^banner\.(?:png|jpg|jpge|gif|ico)$/.test(x))
        if (modInfo.banner) {
            modInfo.banner = url.pathToFileURL(path.join(dirname, modInfo.banner)).href
        }
        return modInfo 
    }
    
    return null
}

module.exports = (dirname) => {
    if (!dirname) {
        dirname = process.cwd()
    }
    const mods = []
    const elements = fs.readdirSync(dirname)
    for (const element of elements) {
        const elementFullPath = path.join(dirname, element)
        const elementInfo = fs.statSync(elementFullPath)
        if (elementInfo.isDirectory()) {
            const modInfo = getModInfo(elementFullPath)
            if (modInfo) {
                mods.push(modInfo)
            }
        }
    }
    return mods
}