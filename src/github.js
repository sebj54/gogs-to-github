const octokit = require('./octokit.js')
const { log } = require('./logger')

// TODO: TO GITHUB
// [x] TODO: Create API wrapper
// [x] TODO: Create repos
// [x] TODO: Create labels for each repo
// [x] TODO: Create milestones for each repo
// [x] TODO: Create issues for each repos
// [x] TODO: Ensure issues are created with the right numbers (so commits have still the good number)
// [x] TODO: Create comments for each issue
// [x] TODO: Create webhooks (won't it be a problem when pushing new code? disabled webhooks?)
// [ ] TODO: Display code to copy/paste to clone old repos and push them on Github new ones
const github = {
    async createAll(repos) {
        log('➡ Starting creation of all repositories…')
        for (const repoToCreate of repos) {
            log(`⌛ Creating "${repoToCreate.full_name}" repository…`)
            const repo = await github.createRepo(repoToCreate)
            log(`  ✅ Repository "${repo.full_name}" created.`)

            log(`⌛ Fetching "${repo.full_name}" repository’s default labels…`)
            const defaultLabels = await github.listRepoLabels(repo)
            log(`  ✅ ${defaultLabels.length} default labels fetched.`)

            log(`⌛ Deleting "${repo.full_name}" repository’s default labels…`)
            await github.deleteRepoLabels(repo, defaultLabels)
            log(`  ✅ ${defaultLabels.length} default labels deleted.`)

            log(`⌛ Creating "${repo.full_name}" repository’s labels…`)
            const labels = await github.createRepoLabels(repo, repoToCreate.labels)
            log(`  ✅ ${labels.length} labels created.`)

            log(`⌛ Creating "${repo.full_name}" repository’s milestones…`)
            const milestones = await github.createRepoMilestones(repo, repoToCreate.milestones)
            log(`  ✅ ${milestones.length} milestones created.`)

            log(`⌛ Creating "${repo.full_name}" repository’s issues…`)
            const issues = await github.createRepoIssues(repo, repoToCreate.issues, labels, milestones)
            log(`  ✅ ${issues.length} issues created.`)

            let commentsCount = 0
            log(`⌛ Creating "${repo.full_name}" issues’ comments…`)
            for (const issue of repoToCreate.issues) {
                const commentsCreated = await github.createIssueComments(repo, issue)
                commentsCount += commentsCreated.length
            }
            log(`  ✅ ${commentsCount} comments created.`)

            log(`⌛ Creating "${repo.full_name}" repository’s webhooks…`)
            const webhooks = await github.createRepoWebhooks(repo, repoToCreate.webhooks)
            log(`  ✅ ${webhooks.length} webhooks created.`)
        }
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
