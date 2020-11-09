require('dotenv').config()

const { listAll } = require('./src/gogs.js')
const { createAll } = require('./src/github.js')
const { showCommands } = require('./src/cli-helper.js')

listAll()
    .then((repos) => {
        createAll(repos)
            .then((reposCreated) => {
                showCommands(repos, reposCreated)
            })
    })
