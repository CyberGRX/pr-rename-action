# PR Rename Javascript Action
This action automatically renames a PR using a regex with named groups and [custom format](https://www.npmjs.com/package/string-format).

## Inputs

### `branch-regex`

**Required** Regex with named groups used to process the PR's source branch.

### `title-format`

**Required** String format using the `branch-regex` named groups that will construct a clean PR title.

There are 2 special transforms available
1. `{group!upper}` - will transform the group to upper case.
1. `{group!normalize}` - will transform the group, replacing non words with space, converting to title case, and trimming the resulting string.

## Outputs

### `matches`

The groups that were matched by the `branch-regex`.

## Example usage

It is recommended that you only run this action when a PR is opened so you do not overwrite a custom title.
```
on:
  pull_request:
    types: [opened, synchronize]
```

Example step
```
name: Rename PR
uses: CyberGRX/pr-rename-action@v1.0
id: pr-auto-namer
env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
with:
    branch-regex: '(?<prefix>.*?)(?<team>[\d\w]+)-(?<ticket>\d+)(?<postfix>.*)'
    title-format: '{team!upper}-{ticket!upper}: {postfix!normalize}'
```