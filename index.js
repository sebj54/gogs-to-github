require('dotenv').config()

const { listAll, listAllContent } = require('./src/gogs.js')
const { createAll, createAllContent } = require('./src/github.js')
const { showCommands } = require('./src/cli-helper.js')

async function migrate() {

    let repos = await listAll()
    let reposCreated = await createAll(repos)

    const correspondingAllRepos = reposCreated.map(repoCreated => {
        return repos.find(repo => repo.name === repoCreated.name)
    })

    repos = await listAllContent(correspondingAllRepos)
    reposCreated = await createAllContent(repos, reposCreated)

    showCommands(repos, reposCreated)
}

migrate()
