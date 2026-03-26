const core = require('@actions/core');
const github = require('@actions/github');
const { handleIssue } = require('./events/issue');
const { handlePullRequest } = require('./events/pullRequest');
const { handleRepositoryDispatch } = require('./events/repositoryDispatch');

async function run() {
  const token = core.getInput('github-token', { required: true });
  const autoClose = core.getInput('auto-close') === 'true';
  const tag = core.getInput('tag');

  core.info(`token : ${token}. autoClose : ${autoClose}. tag : ${tag}.`);

  const octokit = github.getOctokit(token);
  const { context } = github;
  const eventName = context.eventName;

  if (eventName === 'issues') {
    const issueNumber = await handleIssue(octokit, context);
    core.info(`Commented on issue #${issueNumber}.`);
  } else if (eventName === 'pull_request') {
    const prNumber = await handlePullRequest(octokit, context);
    core.info(`Commented on PR #${prNumber}.`);
  } else if (eventName === 'repository_dispatch') {
    const number = await handleRepositoryDispatch(octokit, context);
    core.info(`Commented on #${number}.`);
  } else {
    core.warning(`Unsupported event: ${eventName}`);
  }
}

run().catch((error) => {
  core.setFailed(error.message);
});
