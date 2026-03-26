async function handleIssue(octokit, context) {
  const { owner, repo } = context.repo;
  const issueNumber = context.payload.issue.number;

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body: 'Issue Test',
  });

  return issueNumber;
}

module.exports = { handleIssue };
