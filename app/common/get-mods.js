const fs = require('fs')
const path = require('path')

const getModInfo = (dirname) => {
    const modInfoFilename = path.resolve(dirname, 'mod.json')
    
    if (fs.existsSync(modInfoFilename)) {
        const jsonString = fs.readFileSync(modInfoFilename)
        return JSON.parse(jsonString)
    }
    
    return null
}

export default getMods = (dirname) => {
    if (!dirname) {
        dirname = __dirname
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