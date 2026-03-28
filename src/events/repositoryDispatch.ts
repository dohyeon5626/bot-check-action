import * as core from '@actions/core';
import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';

type Octokit = ReturnType<typeof github.getOctokit>;

export async function handleRepositoryDispatch(
  octokit: Octokit,
  context: Context,
  autoClose: boolean,
  tag: string,
): Promise<void> {
  const { owner, repo } = context.repo;
  const { issueNumber, prNumber, commentId, isSuccess } = context.payload.client_payload as {
    issueNumber?: number;
    prNumber?: number;
    commentId: number;
    isSuccess: boolean;
  };

  const number = issueNumber ?? prNumber;
  if (number === undefined) {
    core.setFailed('client_payload must contain either issueNumber or prNumber.');
    return;
  }

  const type = issueNumber !== undefined ? 'issue' : 'pull request';
  const body = isSuccess
    ? [
        `✅ Human verification for this ${type} has been completed successfully.`,
        '',
        'Your submission is confirmed. Thank you for verifying!',
      ].join('\n')
    : [
        `❌ Human verification for this ${type} has failed or expired.`,
        '',
        'Please create a new issue or pull request and complete the verification in time.',
      ].join('\n');

  await octokit.rest.issues.updateComment({
    owner,
    repo,
    comment_id: commentId,
    body,
  });

  if (!isSuccess) {
    if (autoClose) {
      await octokit.rest.issues.update({
        owner,
        repo,
        issue_number: number,
        state: 'closed',
      });
      core.info(`Closed #${number} due to failed verification.`);
    }

    if (tag) {
      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: number,
        labels: [tag],
      });
      core.info(`Added label "${tag}" to #${number}.`);
    }
  }

  core.info(`Comment #${commentId} updated on #${number}: ${isSuccess ? 'success' : 'failure'}`);
}
