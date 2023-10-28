const path = require('path')
const simpleGit = require('simple-git')
const git = simpleGit()

const cloneModSource = async (url) => {
    const sourceDir = path.resolve(process.cwd(), 'sources')
    console.log(url)
    console.log(sourceDir)
    return await git.clone(url, sourceDir)
}

module.exports = {
    cloneModSource
}