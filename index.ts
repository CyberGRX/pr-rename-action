import * as core from '@actions/core';
import * as github from '@actions/github';
import { graphql } from '@octokit/graphql';
import { EventPayloads } from '@octokit/webhooks';

async function run() {
  try {
    const token = process.env['GITHUB_TOKEN'];
    if (!token) {
      core.setFailed('GITHUB_TOKEN does not exist.');
      return;
    }

    const graphqlWithAuth = graphql.defaults({
      headers: { authorization: `token ${token}` },
    });

    if (github.context.eventName !== 'pull_request') {
      return;
    }

    const payload = github.context
      .payload as EventPayloads.WebhookPayloadPullRequest;

    const requestID = payload.pull_request.node_id;

    const { repository } = await graphql(
      `
    mutation updatePR($pullRequestId: ID!, $title: String) {
      updatePullRequest(input:{pullRequestId:$pullRequestId, title:$title}) {
        pullRequest {
          title
        }
      }
  `,
      {
        pullRequestId: requestID,
        title: 'Just testing',
      },
    );

    const response = JSON.stringify(repository, undefined, 2);
    console.log(`The response payload: ${response}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
