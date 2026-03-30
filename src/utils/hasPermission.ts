import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';

type Octokit = ReturnType<typeof github.getOctokit>;

const PERMISSION_LEVELS = ['none', 'read', 'write', 'admin'];

export async function hasTrustedPermission(
  octokit: Octokit,
  context: Context,
  username: string,
  trustedPermission: string,
): Promise<boolean> {
  if (!trustedPermission) return false;

  const { owner, repo } = context.repo;

  const { data } = await octokit.rest.repos.getCollaboratorPermissionLevel({
    owner,
    repo,
    username,
  });

  const userLevel = PERMISSION_LEVELS.indexOf(data.permission);
  const requiredLevel = PERMISSION_LEVELS.indexOf(trustedPermission);

  return userLevel >= requiredLevel;
}
