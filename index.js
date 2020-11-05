require('dotenv').config()

const { listAll } = require('./src/gogs.js')

// TODO: FROM GOGS
// [x] TODO: List repos
// [x] TODO: List labels, milestones & issues from repo
// [x] TODO: List comments from issues
// [x] TODO: List webhooks

// TODO: TO GITHUB
// [ ] TODO: Create API wrapper
// [ ] TODO: Create repos
// [ ] TODO: Create labels for each repo
// [ ] TODO: Create milestones for each repo
// [ ] TODO: Create issues for each repos
// [ ] TODO: Create comments for each issue
// [ ] TODO: Create webhooks (won't it be a problem when pushing new code? disabled webhooks?)
// [ ] TODO: Display code to copy/paste to clone old repos and push them on Github new ones
listAll()
