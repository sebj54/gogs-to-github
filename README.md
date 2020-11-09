# gogs-to-github

A tool to help you migrate Gogs repositories to Github.

## Features

- Migrate repositories from Gogs to Github
    - Create repositories
    - Create labels
    - Create milestones
    - Create issues and comments
    - Keep issue numerotation
    - Create webhooks
- Display commands to clone old repositories and push to new ones (you just have to copy/paste)

**⚠ This tool does not migrate pull requests because Gogs does not provide an API for pull requests (see https://github.com/gogs/gogs/issues/2253).**

## Installation and usage

```
git clone https://github.com/sebj54/gogs-to-github
cd gogs-to-github
npm ci
GOGS_ACCESS_TOKEN=____YOUR_GOGS_TOKEN____
GOGS_URL=https://____YOUR_GOGS_URL____
GITHUB_ACCESS_TOKEN=____YOUR_GITHUB_TOKEN____
npm start
```

### Configuration

To be able to run migration, you will need to set 3 environment variables:

- `GOGS_ACCESS_TOKEN`: A Gogs access token (Create one from *Settings → Applications*)
- `GOGS_URL`: Your Gogs instance URL (without trailing slash)
- `GITHUB_ACCESS_TOKEN`: A GitHub access token with `repo` and `admin:repo_hook` scopes (Create one from https://github.com/settings/tokens)

You can define these variables directly from your CLI or use a `.env` root file. You can copy the structure of the `env.dist` file and fill the variables.
