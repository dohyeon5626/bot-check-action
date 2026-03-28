import * as core from '@actions/core';
import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';

type Octokit = ReturnType<typeof github.getOctokit>;

export async function handleRepositoryDispatch(octokit: Octokit, context: Context): Promise<void> {
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

  const body = isSuccess
    ? '✅ Verification successful! Your submission has been confirmed.'
    : '❌ Verification failed. Please try again.';

  await octokit.rest.issues.updateComment({
    owner,
    repo,
    comment_id: commentId,
    body,
  });

  core.info(`Comment #${commentId} updated on #${number}: ${isSuccess ? 'success' : 'failure'}`);
}
