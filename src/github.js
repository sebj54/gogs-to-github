const octokit = require('./octokit.js')
const { log } = require('./logger')

const github = {
    async createAll(repos) {
        log('➡ Starting creation of all repositories…')
        const reposCreated = []

        for (const repoToCreate of repos) {
            const count = `[${reposCreated.length + 1}/${repos.length}]`

            log(`⌛ ${count} Creating "${repoToCreate.full_name}" repository…`)
            const repo = await github.createRepo(repoToCreate)
            reposCreated.push(repo)
            log(`  ✅ Repository "${repo.full_name}" created.`)

            log(`⌛ ${count} Fetching "${repo.full_name}" repository’s default labels…`)
            const defaultLabels = await github.listRepoLabels(repo)
            log(`  ✅ ${defaultLabels.length} default labels fetched.`)

            log(`⌛ ${count} Deleting "${repo.full_name}" repository’s default labels…`)
            await github.deleteRepoLabels(repo, defaultLabels)
            log(`  ✅ ${defaultLabels.length} default labels deleted.`)

            log(`⌛ ${count} Creating "${repo.full_name}" repository’s labels…`)
            const labels = await github.createRepoLabels(repo, repoToCreate.labels)
            log(`  ✅ ${labels.length} labels created.`)

            log(`⌛ ${count} Creating "${repo.full_name}" repository’s milestones…`)
            const milestones = await github.createRepoMilestones(repo, repoToCreate.milestones)
            log(`  ✅ ${milestones.length} milestones created.`)

            log(`⌛ ${count} Creating "${repo.full_name}" repository’s issues…`)
            const issues = await github.createRepoIssues(repo, repoToCreate.issues, labels, milestones)
            log(`  ✅ ${issues.length} issues created.`)

            let commentsCount = 0
            log(`⌛ ${count} Creating "${repo.full_name}" issues’ comments…`)
            for (const issue of repoToCreate.issues) {
                const commentsCreated = await github.createIssueComments(repo, issue)
                commentsCount += commentsCreated.length
            }
            log(`  ✅ ${commentsCount} comments created.`)

            log(`⌛ ${count} Creating "${repo.full_name}" repository’s webhooks…`)
            const webhooks = await github.createRepoWebhooks(repo, repoToCreate.webhooks)
            log(`  ✅ ${webhooks.length} webhooks created.`)
        }

        return reposCreated
    },
    async createIssueComments({ full_name }, issue) {
        const commentsCreated = []

        if (issue.comments) {
            for (const commentToCreate of issue.comments) {
                if (commentToCreate.body) {
                    let body = commentToCreate.body
                    body += '\n\nOriginally posted on Gogs '

                    if (commentToCreate.user) {
                        body += `by ${commentToCreate.user.full_name} (${commentToCreate.user.username}), `
                    }

                    body += `on ${commentToCreate.created_at}`

                    if (commentToCreate.created_at !== commentToCreate.updated_at) {
                        body += ` (last update on ${commentToCreate.updated_at})`
                    }

                    body += '.'

                    const payload = {
                        body,
                    }

                    const { data } = await octokit.request(`POST /repos/${full_name}/issues/${issue.number}/comments`, payload)
                    commentsCreated.push(data)
                }
            }
        }

        return commentsCreated
    },
    async createRepo(repo) {
        const payload = {
            name: repo.name,
            description: repo.description,
            homepage: repo.website,
            private: repo.private,
        }

        const { data } = await octokit.request('POST /user/repos', payload)
        return data
    },
    async createRepoIssues({ full_name }, issues, allLabels, allMilestones) {
        const issuesCreated = []

        for (const issueToCreate of issues) {
            let milestone = null
            let labels = []

            if (issueToCreate.milestone) {
                milestone = allMilestones.find(milestone => milestone.title === issueToCreate.milestone.title)

                if (milestone) {
                    milestone = milestone.number
                }
            }

            if (issueToCreate.labels) {
                labels = issueToCreate.labels.map((labelToAssign) => {
                    return allLabels.find(label => label.name === labelToAssign.name)
                })
            }

            const payload = {
                // TODO: Handle assignees?
                title: issueToCreate.title,
                body: issueToCreate.body,
                milestone,
                labels,
            }

            let { data } = await octokit.request(`POST /repos/${full_name}/issues`, payload)

            if (issueToCreate.state !== data.state) {
                const result = await octokit.request(`PATCH /repos/${full_name}/issues/{issue_number}`, {
                    issue_number: data.number,
                    state: issueToCreate.state,
                })
                data = result.data
            }

            issuesCreated.push(data)
        }

        return issuesCreated
    },
    async createRepoLabels({ full_name }, labels) {
        const labelsCreated = []

        for (const labelToCreate of labels) {
            const payload = {
                name: labelToCreate.name,
                color: labelToCreate.color,
                description: labelToCreate.description,
            }

            const { data } = await octokit.request(`POST /repos/${full_name}/labels`, payload)
            labelsCreated.push(data)
        }

        return labelsCreated
    },
    async createRepoMilestones({ full_name }, milestones) {
        const milestonesCreated = []

        for (const milestoneToCreate of milestones) {
            const payload = {
                title: milestoneToCreate.title,
                state: milestoneToCreate.state,
                description: milestoneToCreate.description,
            }

            if (milestoneToCreate.due_on) {
                payload.due_on = milestoneToCreate.due_on
            }

            const { data } = await octokit.request(`POST /repos/${full_name}/milestones`, payload)
            milestonesCreated.push(data)
        }

        return milestonesCreated
    },
    async createRepoWebhooks({ full_name }, webhooks) {
        const webhooksCreated = []

        for (const webhookToCreate of webhooks) {
            const payload = {
                config: webhookToCreate.config,
                events: webhookToCreate.events,
                active: webhookToCreate.active,
            }

            const { data } = await octokit.request(`POST /repos/${full_name}/hooks`, payload)
            webhooksCreated.push(data)
        }

        return webhooksCreated
    },
    async deleteRepoLabels({ full_name }, labels) {
        for (const labelToDelete of labels) {
            await octokit.request(`DELETE /repos/${full_name}/labels/{name}`, {
                name: labelToDelete.name,
            })
        }
    },
    async listRepoLabels({ full_name }) {
        const { data } = await octokit.request(`GET /repos/${full_name}/labels`)
        return data
    },
}

module.exports = github
