import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';

type Octokit = ReturnType<typeof github.getOctokit>;

export async function handlePullRequest(octokit: Octokit, context: Context): Promise<number> {
  const { owner, repo } = context.repo;
  const prNumber = context.payload.pull_request!.number;

  await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number: prNumber,
    body: 'PullRequest Test',
    event: 'COMMENT',
  });

  return prNumber;
}
