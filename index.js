require('dotenv').config()

const { listUserRepositories } = require('./src/gogs.js')

listUserRepositories()
