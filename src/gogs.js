const gogsApi = require('./gogsApi.js')

const gogs = {
    async listAll() {
        const repos = await gogs.listUserRepositories()

        for (const repo of repos) {
            repo.labels = await gogs.listRepoLabels(repo)
            repo.milestones = await gogs.listRepoMilestones(repo)
            repo.webhooks = await gogs.listRepoWebhooks(repo)

            const issues = await gogs.listRepoIssues(repo)
            repo.issues = issues

            for (const issue of issues) {
                issue.comments = await gogs.listIssueComments(repo, issue)
            }
        }

        return repos
    },
    async listIssueComments({ full_name }, { number }) {
        const { data } = await gogsApi.get(`/repos/${full_name}/issues/${number}/comments`)
        return data
    },
    async listRepoIssues({ full_name }) {
        const { data } = await gogsApi.get(`/repos/${full_name}/issues`)
        return data
    },
    async listRepoLabels({ full_name }) {
        const { data } = await gogsApi.get(`/repos/${full_name}/labels`)
        return data
    },
    async listRepoMilestones({ full_name }) {
        const { data } = await gogsApi.get(`/repos/${full_name}/milestones`)
        return data
    },
    async listRepoWebhooks({ full_name }) {
        const { data } = await gogsApi.get(`/repos/${full_name}/hooks`)
        return data
    },
    async listUserRepositories() {
        const { data } = await gogsApi.get('/user/repos')
        // TODO: Remove this filter
        return data.filter(item => item.name === 'emile-weber')
    },
}

module.exports = gogs
