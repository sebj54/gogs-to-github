const { Octokit } = require('@octokit/core')

module.exports = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN,
})
