const path = require('path')
const simpleGit = require('simple-git')

const cloneModSource = async (url, customName) => {
    const sourceDir = path.resolve(process.cwd(), 'sources')
    const git = simpleGit(sourceDir)
    return await git.clone(url, customName ? path.resolve(sourceDir, customName) : undefined)
}

const getGit = (sourceName) => {
    const sourceDir = path.resolve(process.cwd(), 'sources', sourceName)
    return simpleGit(sourceDir)
}

const pullAndMerge = async (sourceName, branch, git) => {
    if (!git) {
        git = getGit(sourceName)
    }
    if (!branch) {
        const status = await git.status()
        branch = status.current
    }
    await git.pull('origin', branch, { '--strategy-option': 'theirs' })
}

const sync = async (sourceName, branch, git) => {
    if (!git) {
        git = getGit(sourceName)
    }
    if (!branch) {
        const status = await git.status()
        branch = status.current
    }
    await git.fetch()
    await pullAndMerge(sourceName, branch, git)
    await git.push('origin', branch)
    return await git.status()
}

const fetchStatus = async (sourceName, branch, git) => {
    if (!git) {
        git = getGit(sourceName)
    }
    if (!branch) {
        const status = await git.status()
        branch = status.current
    }
    
    return JSON.parse(JSON.stringify(await git.fetch().status()))
}

module.exports = {
    cloneModSource,
    getGit,
    pullAndMerge,
    sync,
    fetchStatus
}