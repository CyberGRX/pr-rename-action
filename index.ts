import * as core from '@actions/core';
import * as github from '@actions/github';
import * as format from 'string-format';
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

    const branchRegex = new RegExp(core.getInput('branch-regex'), 'ig');
    const titleFormat = core.getInput('title-format');

    const payload = github.context
      .payload as EventPayloads.WebhookPayloadPullRequest;

    const pr = payload.pull_request;
    console.log(`Running auto rename for #${pr.number} - ${pr.title}`);

    const matches = branchRegex.exec(pr.head.ref);
    if (!matches || !matches.groups) {
      console.log(`${pr.head.ref} did not match ${branchRegex.source}`);
      return;
    }

    // Create a formatter with custom transforms
    const fmt = format.create({
      upper: s => s.toUpperCase(),
      normalize: s => s.replaceAll(/[\W]/g, ' ').trim(),
    });

    const formattedTitle = fmt(titleFormat, matches.groups);
    if (!formattedTitle || !formattedTitle.trim()) {
      console.log(
        `${matches.groups} and ${titleFormat} resulted in an empty string`,
      );
      return;
    }
    console.log(`Renaming #${pr.number} to ${formattedTitle}`);

    try {
      const result = await graphqlWithAuth(
        `
        mutation updatePR($pullRequestId: ID!, $title: String) {
          updatePullRequest(input: {pullRequestId: $pullRequestId, title: $title}) {
            pullRequest {
              title
            }
          }
        }`,
        {
          pullRequestId: pr.node_id,
          title: formattedTitle,
        },
      );

      const response = JSON.stringify(result, undefined, 2);
      console.log(`The response payload: ${response}`);
    } catch (error) {
      console.log(`Request failed: ${JSON.stringify(error)}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
