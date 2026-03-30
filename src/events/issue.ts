import * as core from '@actions/core';
import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { hasTrustedPermission } from '../utils/hasPermission';
import { isAllowedUser } from '../utils/isAllowedUser';
import { isFirstTimeContributor } from '../utils/isFirstTimeContributor';

type Octokit = ReturnType<typeof github.getOctokit>;

export async function handleIssue(
  octokit: Octokit,
  context: Context,
  token: string,
  verificationTimeout: number,
  trustedPermission: string,
  allowedUsers: string,
  firstTimeOnly: boolean,
): Promise<void> {
  const { owner, repo } = context.repo;
  const issueNumber = context.payload.issue!.number;
  const issueAuthor = context.payload.issue!.user.login;
  const issueUrl: string = context.payload.issue!.html_url ?? '';

  if (isAllowedUser(issueAuthor, allowedUsers)) {
    core.info(`Skipping verification for @${issueAuthor} (allowed user).`);
    return;
  }

  if (await hasTrustedPermission(octokit, context, issueAuthor, trustedPermission)) {
    core.info(`Skipping verification for @${issueAuthor} (trusted permission: ${trustedPermission}).`);
    return;
  }

  if (firstTimeOnly && !(await isFirstTimeContributor(octokit, context, issueAuthor))) {
    core.info(`Skipping verification for @${issueAuthor} (returning contributor).`);
    return;
  }

  const { data: comment } = await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body: [
      `@${issueAuthor}`,
      'A quick human verification is required to confirm this issue.',
      '',
      'Please click the link below to complete the verification.',
      `The link will expire in **${verificationTimeout} minute(s)**.`,
      '',
      '👉 Generating the link...',
    ].join('\n'),
  });

  const response = await fetch('https://api.dohyeon5626.com/bot-check/verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, verificationTimeout, owner, repo, issueNumber, commentId: comment.id }),
  });

  if (!response.ok) {
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: comment.id,
      body: `Failed to generate verification link: ${response.statusText}`,
    });
    core.setFailed(`Failed to generate verification link: ${response.statusText}`);
    return;
  }

  const { id } = (await response.json()) as { id: string };

  await octokit.rest.issues.updateComment({
    owner,
    repo,
    comment_id: comment.id,
    body: [
      `@${issueAuthor}`,
      'A quick human verification is required to confirm this issue.',
      '',
      'Please click the link below to complete the verification.',
      `The link will expire in **${verificationTimeout} minute(s)**.`,
      '',
      `👉 [Click here](https://bot-check-page.dohyeon5626.com?id=${id}&redirect_url=${encodeURIComponent(issueUrl)})`,
    ].join('\n'),
  });

  core.info(`Verification link generated with id: ${id}`);
}
