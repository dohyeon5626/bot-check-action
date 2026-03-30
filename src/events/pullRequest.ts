import * as core from '@actions/core';
import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { hasTrustedPermission } from '../utils/hasPermission';

type Octokit = ReturnType<typeof github.getOctokit>;

export async function handlePullRequest(
  octokit: Octokit,
  context: Context,
  token: string,
  verificationTimeout: number,
  trustedPermission: string,
): Promise<void> {
  const { owner, repo } = context.repo;
  const prNumber = context.payload.pull_request!.number;
  const prAuthor = context.payload.pull_request!.user.login;
  const prUrl: string = context.payload.pull_request!.html_url ?? '';

  if (await hasTrustedPermission(octokit, context, prAuthor, trustedPermission)) {
    core.info(`Skipping verification for @${prAuthor} (trusted permission: ${trustedPermission}).`);
    return;
  }

  const { data: comment } = await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: [
      `@${prAuthor}`,
      'A quick human verification is required to confirm this pull request.',
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
    body: JSON.stringify({ token, verificationTimeout, owner, repo, prNumber, commentId: comment.id }),
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
      `@${prAuthor}`,
      'A quick human verification is required to confirm this pull request.',
      '',
      'Please click the link below to complete the verification.',
      `The link will expire in **${verificationTimeout} minute(s)**.`,
      '',
      `👉 [Click here](https://bot-check-page.dohyeon5626.com?id=${id}&redirect_url=${encodeURIComponent(prUrl)})`,
    ].join('\n'),
  });

  core.info(`Verification link generated with id: ${id}`);
}
