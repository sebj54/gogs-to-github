const gogsApi = require('./gogsApi.js')

module.exports = {
    listUserRepositories() {
        return new Promise((resolve, reject) => {
            gogsApi.get('/user/repos')
                .then(({ data }) => {
                    resolve(data)
                })
                .catch(reject)
        })
    }
}
