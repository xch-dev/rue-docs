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
