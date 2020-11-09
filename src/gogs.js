const gogsApi = require('./gogsApi.js')
const { log } = require('./logger')

const gogs = {
    async listAll() {
        log('⌛ Fetching repositories…')
        const repos = await gogs.listUserRepositories()
        log(`  ✅ ${repos.length} repositories fetched.`)

        for (const repo of repos) {
            log(`⌛ Fetching "${repo.full_name}" repository’s labels…`)
            repo.labels = await gogs.listRepoLabels(repo)
            log(`  ✅ ${repo.labels.length} labels fetched.`)

            log(`⌛ Fetching "${repo.full_name}" repository’s milestones…`)
            repo.milestones = await gogs.listRepoMilestones(repo)
            log(`  ✅ ${repo.milestones.length} milestones fetched.`)

            log(`⌛ Fetching "${repo.full_name}" repository’s webhooks…`)
            repo.webhooks = await gogs.listRepoWebhooks(repo)
            log(`  ✅ ${repo.webhooks.length} webhooks fetched.`)

            log(`⌛ Fetching "${repo.full_name}" repository’s issues…`)
            repo.issues = await gogs.listRepoIssuesInOrder(repo)
            log(`  ✅ ${repo.issues.length} issues fetched.`)

            let commentsCount = 0
            log(`⌛ Fetching "${repo.full_name}" issues’ comments…`)
            for (const issue of repo.issues) {
                issue.comments = await gogs.listIssueComments(repo, issue)
                commentsCount += issue.comments.length
            }
            log(`  ✅ ${commentsCount} comments fetched.`)
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
