# Bot Check Action<img src="https://github.com/user-attachments/assets/14e68075-fb8a-4cf3-8ce1-f104ff905c35" align=left width=100>

![GitHub License](https://img.shields.io/github/license/dohyeon5626/bot-check-action?style=flat&color=green) ![GitHub Tag](https://img.shields.io/github/v/tag/dohyeon5626/bot-check-action?style=flat&color=green`)

<img width="100%" align=center alt="readme" src="https://github.com/user-attachments/assets/d9db562b-b815-4e52-b7be-c04ce18c8c77">
<br/><br/>

A GitHub Action that verifies whether an issue or pull request was created by a human. Supports auto-closing and tagging of unverified submissions.

-> [Test Here](https://github.com/dohyeon5626/bot-check-action-example/issues)

### How To Use
```yaml
name: Bot Check

on:
  issues:
    types: [opened]
  pull_request:
    types: [opened]
  repository_dispatch:
    types: [bot-check]

jobs:
  bot-check:
    runs-on: ubuntu-latest

    # required configuration when using secrets.GITHUB_TOKEN as the comment-account-token
    # permissions:
    #   issues: write
    #   pull-requests: write

    steps:
      - uses: dohyeon5626/bot-check-action@main
        with:
          personal-access-token: ${{ secrets.BOT_CHECK_TOKEN }}
          comment-account-token: ${{ secrets.GITHUB_TOKEN }}
          auto-close: 'true'
          tag: 'bot'
          verification-timeout: '10'
```
| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `personal-access-token` | ✅ | — | Personal access token used to call the verification API. |
| `comment-account-token` | ❌ | `personal-access-token` | Token for the account that posts comments. If not set, `personal-access-token` is used. |
| `auto-close` | ❌ | `false` | Automatically close the issue or PR if verification fails. |
| `tag` | ❌ | `''` | Label to add to the issue or PR if verification fails. The label must already exist in the repository. |
| `verification-timeout` | ❌ | `5` | Verification link expiration time in minutes. (5~60) |

> Works with [Bot Check Page](https://github.com/dohyeon5626/bot-check-page), [Serverless Functions](https://github.com/dohyeon5626/serverless-functions/tree/main/bot-check)
