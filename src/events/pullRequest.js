async function handlePullRequest(octokit, context) {
  const { owner, repo } = context.repo;
  const prNumber = context.payload.pull_request.number;

  await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number: prNumber,
    body: 'PullRequest Test',
    event: 'COMMENT',
  });

  return prNumber;
}

module.exports = { handlePullRequest };
