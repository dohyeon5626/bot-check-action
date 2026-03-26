import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';

type Octokit = ReturnType<typeof github.getOctokit>;

export async function handleIssue(octokit: Octokit, context: Context): Promise<number> {
  const { owner, repo } = context.repo;
  const issueNumber = context.payload.issue!.number;

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body: 'Issue Test',
  });

  return issueNumber;
}
