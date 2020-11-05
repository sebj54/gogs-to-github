const gogsApi = require('./gogsApi.js')

const gogs = {
    listAll() {
        // TODO: Return a promise
        gogs.listUserRepositories()
            .then((repos) => {
                repos.forEach((repo) => {
                    Promise.all([
                        gogs.listRepoLabels(repo)
                            .then((labels) => {
                                repo.labels = labels
                            }),
                        gogs.listRepoMilestones(repo)
                            .then((milestones) => {
                                repo.milestones = milestones
                            }),
                        gogs.listRepoWebhooks(repo)
                            .then((webhooks) => {
                                repo.webhooks = webhooks
                            }),
                    ])
                        .then(() => {
                            gogs.listRepoIssues(repo)
                                .then((issues) => {
                                    repo.issues = issues

                                    issues.forEach((issue) => {
                                        gogs.listIssueComments(repo, issue)
                                            .then((comments) => {
                                                issue.comments = comments
                                            })
                                    })
                                })
                        })
                })
            })
    },
    listIssueComments({ full_name }, { number }) {
        return new Promise((resolve, reject) => {
            gogsApi.get(`/repos/${full_name}/issues/${number}/comments`)
                .then(({ data }) => {
                    resolve(data)
                })
                .catch(reject)
        })
    },
    listRepoIssues({ full_name }) {
        return new Promise((resolve, reject) => {
            gogsApi.get(`/repos/${full_name}/issues`)
                .then(({ data }) => {
                    resolve(data)
                })
                .catch(reject)
        })
    },
    listRepoLabels({ full_name }) {
        return new Promise((resolve, reject) => {
            gogsApi.get(`/repos/${full_name}/labels`)
                .then(({ data }) => {
                    resolve(data)
                })
                .catch(reject)
        })
    },
    listRepoMilestones({ full_name }) {
        return new Promise((resolve, reject) => {
            gogsApi.get(`/repos/${full_name}/milestones`)
                .then(({ data }) => {
                    resolve(data)
                })
                .catch(reject)
        })
    },
    listRepoWebhooks({ full_name }) {
        return new Promise((resolve, reject) => {
            gogsApi.get(`/repos/${full_name}/hooks`)
                .then(({ data }) => {
                    resolve(data)
                })
                .catch(reject)
        })
    },
    listUserRepositories() {
        return new Promise((resolve, reject) => {
            gogsApi.get('/user/repos')
                .then(({ data }) => {
                    // TODO: Remove this filter
                    data = data.filter(item => item.name === 'emile-weber')
                    resolve(data)
                })
                .catch(reject)
        })
    },
}

module.exports = gogs
