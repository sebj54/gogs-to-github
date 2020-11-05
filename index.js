require('dotenv').config()

const { listAll } = require('./src/gogs.js')
const { createAll } = require('./src/github.js')

listAll()
    .then(createAll)
