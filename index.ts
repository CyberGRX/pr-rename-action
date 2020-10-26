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
    console.log(`Running with ${requestID}`);

    try {
      const result = await graphqlWithAuth(
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
          title: 'Just testing 3',
        },
      );

      console.log('Finished up with the request');

      //const response = JSON.stringify(result, undefined, 2);
      //console.log(`The response payload: ${response}`);
    } catch (error) {
      console.log(`Request failed: ${JSON.stringify(error)}`);
    }
    console.log('Done');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
