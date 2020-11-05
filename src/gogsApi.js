const axios = require('axios')

module.exports = axios.create({
    baseURL: `${process.env.GOGS_URL}/api/v1`,
    headers: {
        Authorization: `token ${process.env.GOGS_ACCESS_TOKEN}`,
    },
})
