# Rue Docs

Documentation for [Rue Lang](https://rue-lang.com), built using [Docusaurus](https://docusaurus.io/).

## Requirements

- Node.js 24 (see `.nvmrc`)
- pnpm 12 (pinned via `packageManager` in `package.json`)

## Installation

```bash
pnpm install
```

## Local Development

```bash
pnpm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
pnpm build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Checks

CI runs these on every pull request:

```bash
pnpm prettier
pnpm typecheck
pnpm build
```

The Rue examples in the docs are checked separately, since this needs the Rue CLI at the version in `.rue-version` (`cargo install rue-cli --version <version>`):

```bash
pnpm check:rue-examples
```

Every ` ```rue ` block must compile without errors or warnings, pass its tests, and be formatted the way `rue fmt` formats it. See `scripts/check-rue-examples.py` for the info strings (such as ` ```rue ignore `) that change what's checked for a block.

## Updating for a Rue release

The docs describe the Rue version in `.rue-version`. The `update-rue-docs` skill in `.claude/skills` updates them for a new release: run `/update-rue-docs [version]` in Claude Code.
