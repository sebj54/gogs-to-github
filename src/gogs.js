const gogsApi = require('./gogsApi.js')
const { log } = require('./logger')

const gogs = {
    async listAll() {
        log('⌛ Fetching repositories…')
        const repos = await gogs.listUserRepositories()
        log(`  ✅ ${repos.length} repositories fetched.`)

        return repos
    },
    async listAllContent(repos) {
        let n = 1

        log('⌛ Fetching repositories’ content…')

        for (const repo of repos) {
            const count = `[${n}/${repos.length}]`

            log(`⌛ ${count} Fetching "${repo.full_name}" repository’s labels…`)
            repo.labels = await gogs.listRepoLabels(repo)
            log(`  ✅ ${repo.labels.length} labels fetched.`)

            log(`⌛ ${count} Fetching "${repo.full_name}" repository’s milestones…`)
            repo.milestones = await gogs.listRepoMilestones(repo)
            log(`  ✅ ${repo.milestones.length} milestones fetched.`)

            log(`⌛ ${count} Fetching "${repo.full_name}" repository’s webhooks…`)
            repo.webhooks = await gogs.listRepoWebhooks(repo)
            log(`  ✅ ${repo.webhooks.length} webhooks fetched.`)

            try {
                log(`⌛ ${count} Fetching "${repo.full_name}" repository’s issues…`)
                repo.issues = await gogs.listAllRepoIssuesInOrder(repo)
                log(`  ✅ ${repo.issues.length} issues fetched.`)
            } catch (e) {
                if (e && e.response && e.response.status === 404) {
                    repo.issues = []
                    log('  ❌ No issue to fetch.')
                } else {
                    throw e
                }
            }

            if (repo.issues.length) {
                let commentsCount = 0
                log(`⌛ ${count} Fetching "${repo.full_name}" issues’ comments…`)
                for (const issue of repo.issues) {
                    if (issue.comments) {
                        issue.comments = await gogs.listIssueComments(repo, issue)
                        commentsCount += issue.comments.length
                    } else {
                        issue.comments = []
                    }
                }
                log(`  ✅ ${commentsCount} comments fetched.`)
            }

            n += 1
        }

        return repos
    },
    async listIssueComments({ full_name }, { number }) {
        const { data } = await gogsApi.get(`/repos/${full_name}/issues/${number}/comments`)
        return data
    },
    async listAllRepoIssues(repo) {
        const issuesOpened = await gogs.listRepoIssues(repo)
        const issuesClosed = await gogs.listRepoIssues(repo, 'closed')

        const data = issuesOpened.concat(issuesClosed)
            .sort((a, b) => a.number - b.number)

        return data
    },
    async listRepoIssues({ full_name }, state) {
        let issues = []
        let page = 1
        let hasNextPage = true
        const stateParameter = state ? `&state=${state}` : ''

        while (hasNextPage) {
            const { data, headers } = await gogsApi.get(`/repos/${full_name}/issues?page=${page}${stateParameter}`)

            issues = issues.concat(data)

            if (headers.link) {
                const matches = headers.link.match(/<[^>]*\?page=(\d+)>; rel="next"/)
                if (matches) {
                    page = Number(matches[1])
                } else {
                    hasNextPage = false
                }
            } else {
                hasNextPage = false
            }
        }

        return issues
    },
    async listAllRepoIssuesInOrder(repo) {
        const issues = await gogs.listAllRepoIssues(repo)
        const issuesInOrder = []
        let i = 0
        let number = 0

        while (i < issues.length) {
            number += 1
            const issue = issues[i]

            if (issue.number === number) {
                issuesInOrder.push(issue)
                i += 1
            } else {
                issuesInOrder.push({
                    title: `Missing PR #${number}`,
                    body: 'This issue has been created to keep issues in the right order after a migration from Gogs.',
                    number,
                    state: 'closed',
                })
            }
        }

        return issuesInOrder
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
        return data
    },
}

module.exports = gogs
