const path = require('path')
const simpleGit = require('simple-git')

const cloneModSource = async (url, customName) => {
    const sourceDir = path.resolve(process.cwd(), 'sources')
    const git = simpleGit(sourceDir)
    return await git.clone(url, customName ? path.resolve(sourceDir, customName) : undefined)
}

module.exports = {
    cloneModSource
}