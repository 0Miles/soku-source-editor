const path = require('path')
const simpleGit = require('simple-git')

const cloneModSource = async (url) => {
    const sourceDir = path.resolve(process.cwd(), 'sources')
    const git = simpleGit(sourceDir)
    return await git.clone(url)
}

module.exports = {
    cloneModSource
}