import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';

type Octokit = ReturnType<typeof github.getOctokit>;

export async function isFirstTimeContributor(
  octokit: Octokit,
  context: Context,
  username: string,
): Promise<boolean> {
  const { owner, repo } = context.repo;

  const { data } = await octokit.rest.repos.listContributors({
    owner,
    repo,
    per_page: 100,
  });

  return !data.some((contributor) => contributor.login === username);
}
