import * as core from '@actions/core';
import * as github from '@actions/github';
import { handleIssue } from './events/issue';
import { handlePullRequest } from './events/pullRequest';
import { handleRepositoryDispatch } from './events/repositoryDispatch';

async function run(): Promise<void> {
  const token = core.getInput('personal-access-token', { required: true });
  const autoClose = core.getInput('auto-close') === 'true';
  const tag = core.getInput('tag');
  const verificationTimeout = parseInt(core.getInput('verification-timeout')) || 5;

  core.info(`token : ${token}. autoClose : ${autoClose}. tag : ${tag}.`);

  const octokit = github.getOctokit(token);
  const { context } = github;
  const eventName = context.eventName;

  if (eventName === 'issues') {
    const issueNumber = await handleIssue(octokit, context, token, verificationTimeout);
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

run().catch((error: Error) => {
  core.setFailed(error.message);
});
