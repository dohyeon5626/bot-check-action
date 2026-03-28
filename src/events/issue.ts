import * as core from '@actions/core';
import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';

type Octokit = ReturnType<typeof github.getOctokit>;

export async function handleIssue(
  octokit: Octokit,
  context: Context,
  token: string,
  verificationTimeout: number,
): Promise<void> {
  const { owner, repo } = context.repo;
  const issueNumber = context.payload.issue!.number;
  const issueAuthor = context.payload.issue!.user.login;

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
      `👉 [Click here](https://bot-check-page.dohyeon5626.com/verification?id=${id})`,
    ].join('\n'),
  });

  core.info(`Verification link generated with id: ${id}`);
}
