import * as core from '@actions/core';
import * as github from '@actions/github';
import { handleIssue } from './events/issue';
import { handlePullRequest } from './events/pullRequest';
import { handleRepositoryDispatch } from './events/repositoryDispatch';

async function run(): Promise<void> {
  const commentAccountToken = core.getInput('comment-account-token');
  const pat = core.getInput('personal-access-token', { required: true });
  const autoClose = core.getInput('auto-close') === 'true';
  const tag = core.getInput('tag');
  const verificationTimeout = parseInt(core.getInput('verification-timeout')) || 5;
  const trustedPermission = core.getInput('trusted-permission');

  const octokit = github.getOctokit(commentAccountToken || pat);
  const { context } = github;
  const eventName = context.eventName;

  if (eventName === 'issues') {
    await handleIssue(octokit, context, pat, verificationTimeout, trustedPermission);
  } else if (eventName === 'pull_request') {
    await handlePullRequest(octokit, context, pat, verificationTimeout, trustedPermission);
  } else if (eventName === 'repository_dispatch') {
    await handleRepositoryDispatch(octokit, context, autoClose, tag);
  } else {
    core.warning(`Unsupported event: ${eventName}`);
  }
}

run().catch((error: Error) => {
  core.setFailed(error.message);
});
