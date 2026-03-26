async function handleRepositoryDispatch(octokit, context) {
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

  return number;
}

module.exports = { handleRepositoryDispatch };
