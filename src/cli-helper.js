module.exports = {
    showCommands(oldRepos, newRepos) {
        console.log('')
        console.log('⌨ Migration commands:')
        console.log('')

        oldRepos.forEach((oldRepo, index) => {
            const newRepo = newRepos[index]

            console.log(`mkdir ${oldRepo.name}`)
            console.log(`cd ${oldRepo.name}`)
            console.log(`git clone --mirror ${oldRepo.ssh_url} .git`)
            console.log('git config --unset core.bare')
            console.log('git reset --hard')
            console.log(`git remote set-url origin ${newRepo.ssh_url}`)
            console.log('git push --all origin')
            console.log('cd ..')
            console.log('')
        })
    },
}
