import * as core from '@actions/core';
import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';

type Octokit = ReturnType<typeof github.getOctokit>;

export async function handleIssue(
  octokit: Octokit,
  context: Context,
  token: string,
  verificationTimeout: number,
): Promise<number> {
  const { owner, repo } = context.repo;
  const issueNumber = context.payload.issue!.number;

  const { data: comment } = await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body: [
      'To create an issue, a quick human verification is required.',
      '',
      'Please click the link below to complete the verification.',
      'Once verified, your issue will be created successfully.',
      '',
      '👉 Generating the link...',
    ].join('\n'),
  });

  const response = await fetch('https://api.dohyeon5626.com/bot-check/verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, verificationTimeout, owner, repo }),
  });

  if (!response.ok) {
    core.setFailed(`Failed to generate verification link: ${response.statusText}`);
    return issueNumber;
  }

  const { id } = (await response.json()) as { id: string };

  await octokit.rest.issues.updateComment({
    owner,
    repo,
    comment_id: comment.id,
    body: [
      'To create an issue, a quick human verification is required.',
      '',
      'Please click the link below to complete the verification.',
      'Once verified, your issue will be created successfully.',
      '',
      `👉 [Click here](https://bot-check-page.dohyeon5626.com/verification?id=${id})`,
    ].join('\n'),
  });

  core.info(`Verification link generated with id: ${id}`);

  return issueNumber;
}
