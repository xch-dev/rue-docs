---
name: update-rue-docs
description: Update the Rue docs for a new Rue release (or commit), based on the Rue diff since the version the docs were last written against. Use when asked to update, sync or refresh the docs for a Rue release.
argument-hint: "<release tag or commit, default: latest release>"
---

# Update the Rue docs

The pages in `docs/` document the [Rue](https://github.com/xch-dev/rue) language, standard library and
tooling. The Rue version they're written against is in `.rue-version`. Your job is to bring the docs up
to date with a newer Rue release (the argument, or the latest release if none is given), and open a PR.

## 1. Get the diff

1. Clone or update Rue somewhere outside this repo (or use an existing checkout, read only). Check out
   the target in a separate worktree, so you have its source to read: `git worktree add --detach <dir> <target>`.
2. Resolve the target to a tag or full commit hash, and diff it against the tag in `.rue-version`:
   `git log --oneline <old>..<target>` and `git diff <old>..<target> -- crates README.md tests examples`.
   Ignore CI, benchmarks, dependency bumps and internal refactors that don't change what users see.
3. Read the release notes (`gh release view <tag> --repo xch-dev/rue`) and the descriptions of the
   merged PRs (`gh pr view <number> --repo xch-dev/rue`) for intent, especially for behaviour changes.
4. Build the CLI at the target (`cargo build --release -p rue-cli` in the worktree), so you can try
   claims and run the example check against it. Don't rely on whatever `rue` is on PATH.

These are the places in the Rue repo that define what the docs describe:

| Area                  | Where to look                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------- |
| Syntax and keywords   | `crates/rue-lexer`, `crates/rue-parser/src/grammar`                                       |
| Rules and errors      | `crates/rue-diagnostic/src/kind.rs`, `crates/rue-compiler/src/compile`                    |
| Builtins              | `crates/rue-hir/src/builtins.rs`, `crates/rue-compiler/src/compile/expr/function_call.rs` |
| Standard library      | `crates/rue-compiler/src/std` (written in Rue)                                            |
| Operators             | `crates/rue-compiler/src/compile/expr/binary.rs`, `prefix.rs`, and `binary_binding_power` |
| Lints                 | `crates/rue-lint`, and `rue lints`                                                        |
| CLI                   | `crates/rue-cli`, and `rue <command> --help`                                              |
| `Rue.toml`            | `crates/rue-options`                                                                      |
| Language server       | `crates/rue-lsp` (the server capabilities)                                                |
| Examples of behaviour | `tests/` and `examples/` (`.rue` files, with `.yaml` snapshots of output and diagnostics) |

## 2. Plan the changes

Sort every relevant change into one of these, and map it to the pages it affects (`grep -rn` the docs
for the keyword, type, function, flag or lint involved):

- **New features** (syntax, builtins, standard library items, CLI commands and flags, `Rue.toml` keys,
  lints, language server features): add them to the relevant page, or write a new page for a major
  feature.
- **Changed behaviour** (type checking, narrowing, inference, codegen, defaults, error rules): rewrite
  the affected prose. The example check won't find most of these, so read the diff and the changed
  tests carefully, and check every claim on the affected pages against the new source.
- **Renames and changed signatures**: update the prose and examples. The example check finds most of these.
- **Removals**: remove or replace them, including in examples.

Also check the tables and lists that summarize the language, since they go stale quietly:

- `docs/lints.md`: the lint tables (regenerate them from `rue lints`, grouped the same way, and escape
  `|` as `\|` inside table cells), the levels, the groups, and the naming conventions.
- `docs/cli.md`: the command table and every flag table, against `--help` for each command.
- `docs/projects.md` and `docs/formatting.md`: the `Rue.toml` keys and defaults, and the manifest that
  `rue init` generates (it includes the version).
- `docs/builtins.md` and `docs/standard-library.md`: every builtin and standard library item, with
  its signature.
- `docs/operators.md`: the operator tables and the precedence table.
- `docs/type-system/atoms.md`: the atom types and the literal table.
- `docs/installation.md`: the editor support and the hello world output.
- `sidebars.ts`, if pages are added, moved or removed.

For a large diff, split independent pages between subagents, giving each this skill's conventions,
the target's source and CLI, and the pages it owns.

## 3. Update the docs

Conventions:

- The docs describe Rue as it is at the target version, as if it's always been that way. Don't label
  anything as new, don't mention Rue versions in prose (other than `.rue-version`, the `rue init`
  manifest sample, and the tutorials' "last tested with" notes), and don't describe old behaviour.
- Every claim must match what the compiler actually does. When in doubt, compile a scratch program
  with the target's CLI rather than trusting the source's comments or the old docs.
- Pages are conceptual: what something is, when to use it, how it fits with the rest of the language,
  then realistic examples, then gotchas. Keep the existing pages' structure and tone: plain, direct
  prose, no marketing language or emoji.
- Every ` ```rue ` block is checked by `pnpm check:rue-examples` (see `scripts/check-rue-examples.py`):
  it must compile with no errors or warnings (unused items are allowed), its tests must pass, and it
  must be formatted the way `rue fmt` formats it. Prefer complete examples with a `fn main` or `test fn`.
  Use an info string only where needed:
  - ` ```rue ignore ` for a fragment that continues an earlier block, a file of a multi-file example
    (such as one that imports a sibling module), or code that needs a file that isn't there.
  - ` ```rue error ` for a block that deliberately shows an error. Put the error in a comment.
  - ` ```rue warn ` for a block that deliberately shows a warning.
  - ` ```rue nofmt ` only where `rue fmt`'s output is clearly worse, with an MDX comment
    (`{/* ... */}`) next to it saying why. Remove these when the formatter is fixed.
- If an example shows output (CLI output in a ` ```bash ` block, a compiled program, a hash), run it
  with the target's CLI and paste the real output.
- Link other pages with `/docs/<path>.md#anchor`. `pnpm build` fails on broken links and anchors.
- New pages get a `slug` in their front matter, matching the existing pages, and an entry in `sidebars.ts`.
- The Rue syntax highlighter is `src/theme/prism-rue.ts`. Update it if keywords, literals or
  operators change.

### Tutorials

The tutorials in `docs/tutorials` use the [Chia Wallet SDK](https://crates.io/crates/chia-wallet-sdk),
which compiles Rue with its own copy of the compiler. If a released `chia-wallet-sdk` depends on the
target Rue version (check the `rue-compiler` version in its `Cargo.toml`), follow each tutorial end to
end in a scratch directory with that SDK version (`rue init`, `cargo init --lib`, `cargo add
chia-wallet-sdk@<version> anyhow sha2`, then each checkpoint's code), and make sure `cargo test` passes.
Then update the Rue and Wallet SDK versions in each tutorial's "last tested with" list. If no SDK
release uses the target yet, leave the tutorials' versions alone, and say so in the PR.

## 4. Verify

1. Update `.rue-version` to the target version, and update the version in the `rue init` manifest
   sample in `docs/projects.md`.
2. Run `pnpm check:rue-examples --rue <path to the target's rue binary>` until every example passes.
   Failures name the markdown file and the line of the block.
3. Have a separate reviewer (a subagent given the changed pages, the target's source and its CLI, not
   your conclusions) check the prose, tables and examples against the source, and fix what it finds.
4. Run `pnpm exec prettier --write .`, `pnpm prettier`, `pnpm typecheck` and `pnpm build`, and make
   sure the build has no broken links or anchors.

## 5. Open a PR

Work on a branch, commit, and open a PR against `main` that names the Rue range (`<old>..<new>`), what
changed in the docs and why, which tutorials were re-tested, and anything you couldn't cover (such as
a behaviour you think is a compiler bug, rather than documenting it as intended). Follow the user's
branch naming and attribution preferences.
