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

### `check-format`

**Optional** String format using the `branch-regex` named groups, if the original title starts with this format, auto formatting is skipped.

## Outputs

### `matches`

The groups that were matched by the `branch-regex`.

### `originalTitle`

The original title of the PR.

### `formattedTitle`

The formatted title that this action applied to the PR.

## Example usage

It is recommended that you only run this action when a PR is opened so you do not overwrite a custom title.
```
on:
  pull_request:
    types: [opened]
```

Example step
```
name: Rename PR
uses: CyberGRX/pr-rename-action@v1.1
id: pr-auto-namer
env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
with:
    branch-regex: '(?<prefix>.*?)(?<team>[\d\w]+)-(?<ticket>\d+)(?<postfix>.*)'
    title-format: '{team!upper}-{ticket!upper}: {postfix!normalize}'
    check-format: '{team!upper}-{ticket!upper}'
```