import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';

type Octokit = ReturnType<typeof github.getOctokit>;

export async function handleRepositoryDispatch(octokit: Octokit, context: Context): Promise<void> {
  const { owner, repo } = context.repo;
  const clientPayload = context.payload.client_payload;
  const number = clientPayload.number;
  const type = clientPayload.type;

  if (type === 'issue') {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: number,
      body: 'RepositoryDispatch Test',
    });
  } else if (type === 'pr') {
    await octokit.rest.pulls.createReview({
      owner,
      repo,
      pull_number: number,
      body: 'RepositoryDispatch Test',
      event: 'COMMENT',
    });
  }
}
