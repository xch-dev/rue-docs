---
slug: /projects
---

# Projects

A Rue project is a directory with a `Rue.toml` manifest, and a directory of `.rue` source files.

You can create one with `rue init`:

```bash
rue init my-project
```

This creates the following files:

```
my-project
├── Rue.toml
└── puzzles
    └── main.rue
```

Every `.rue` file inside of the `puzzles` directory (including in subdirectories) is part of the project, and can reference the others as [modules](/docs/modules.md). A path that starts with `project::` starts at the `puzzles` directory, from any file in the project.

## Finding the Project

When you run a command such as `rue build` or `rue test`, the CLI searches for the project that the current directory (or the file you pass to it) belongs to:

1. The nearest `Rue.toml` in the directory or any of its parents is used, if there is one. So you can run commands from anywhere inside a project.
2. Otherwise, the nearest directory with a `main.rue` file is treated as the project, using the default settings.
3. Otherwise, a single `.rue` file is compiled by itself.

## Manifest

The `Rue.toml` file configures the compiler, the formatter, and which lints are reported. The `[compiler]` section is required, but all of its keys are optional. Here's what `rue init` generates:

```toml
[compiler]
version = "0.13.0"
entrypoint = "puzzles"

[formatter]
max_width = 100
indent_width = 4
single_quote = false
```

### Compiler

| Key              | Default     | Description                                                                                                                                                                            |
| ---------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`        | Not set     | The version of Rue that the project is written for. If it's set and doesn't match the installed version of the CLI, `rue build` and `rue test` fail.                                   |
| `entrypoint`     | `"puzzles"` | The directory (or file) containing the source code, relative to `Rue.toml`.                                                                                                            |
| `std`            | `true`      | Whether to include the [standard library](/docs/standard-library.md). Set this to `false` to only have access to [builtins](/docs/builtins.md).                                        |
| `dist_dir`       | Not set     | The directory that `rue build --all` writes compiled programs to, relative to the directory the command is run from. If it's not set, each program is written next to its source file. |
| `operand_limits` | `false`     | Target CLVM with the `LIMITS` flag, which mainnet enforces until hard fork 2. See [Targeting Mainnet](#targeting-mainnet).                                                             |
| `hard_fork_2`    | `false`     | Target mainnet as it will be after hard fork 2. See [Targeting Mainnet](#targeting-mainnet).                                                                                           |

### Formatter

| Key            | Default | Description                                                                            |
| -------------- | ------- | -------------------------------------------------------------------------------------- |
| `max_width`    | `100`   | The maximum width of a line before it's broken up.                                     |
| `indent_width` | `4`     | The number of spaces used for each level of indentation.                               |
| `single_quote` | `false` | Whether strings are written with `'` rather than `"` when neither needs fewer escapes. |

See [Formatting](/docs/formatting.md) for more details.

### Lints

The `[lints]` section sets the level of individual lints or lint groups:

```toml
[lints]
unused = "deny"
unused_binding = "allow"
```

See [Lints](/docs/lints.md) for the list of lints and how their levels are resolved.

## Targeting Mainnet

The CLVM that Chia mainnet runs changes at hard fork 2, so the compiler has two options for choosing which version of it a project targets. Both are off by default, and can be turned on in the `[compiler]` section, or for a single command with `--operand-limits` or `--hard-fork-2` (a flag can't turn off an option that `Rue.toml` turns on). Setting both is an error, since hard fork 2 removes `LIMITS`.

```toml
[compiler]
entrypoint = "puzzles"
operand_limits = true
```

By default, programs target CLVM without the `LIMITS` flag. Until hard fork 2, mainnet runs programs with `LIMITS`, which makes some operators fail when an operand is too long:

- `*` fails if an operand is longer than 256 bytes, or the running product gets longer than 1024 bytes.
- `/`, `%` and `divmod` fail if the dividend is longer than 256 bytes, or the divisor is longer than 1024 bytes.
- `g1_multiply` and `g2_multiply` fail if the scalar is longer than 1024 bytes.

Typical puzzles are far from these limits, since amounts are at most 8 bytes and hashes are 32. But if your operands could be that long, turn on `operand_limits`. The compiler then treats these operators as able to fail, so a release build fails under `LIMITS` exactly when the debug build does, and `rue test` (and `rue debug`, when it's run in the project) runs programs with `LIMITS`, so they fail where mainnet would. See [Operand Limits](/docs/builtins.md#operand-limits). Without it, a program can pass its tests and still fail on mainnet today, and the optimizer can make a release build fail where the debug build succeeds (or the other way around), by folding constants into longer operands, for example. Constants are evaluated without `LIMITS` either way, since they're never run on chain.

`hard_fork_2` targets mainnet as it will be after hard fork 2. It allows the `modpow` and `keccak256` builtins, which are errors without it, compiles `secp256k1_verify` and `secp256r1_verify` to their shorter opcodes, and runs and optimizes programs with the new cost model, in `rue test` (and `rue debug`, when it's run in the project) as well. This changes the compiled program, and so its puzzle hash, for programs that use the secp operators or `keccak256_verify`, and since the optimizer folds constants and compares costs for the target, it can change the output of other programs too. A program compiled with it can fail on mainnet until hard fork 2 activates. Before then, use [`keccak256_verify`](/docs/builtins.md#keccak256_verify) to check a Keccak-256 hash.

## Entrypoints

The `main` function in `main.rue` is the project's primary entrypoint, and is what `rue build` compiles by default.

Each file can also have its own `main` function, which can be compiled by passing the file to the CLI:

```bash
rue build puzzles/other.rue
```

And any exported function can be compiled with `--export`:

```bash
rue build --export my_puzzle
```

See [Functions](/docs/functions.md#entrypoints) for more on how entrypoints are compiled.

## Building Everything

When a project contains multiple puzzles, you can compile all of them at once:

```bash
rue build --all
```

This compiles the `main` function of every file, as well as every exported function in `main.rue`, and writes each one as a hex file. Add `--hash` to also write the tree hash of each program.

By default, the files are written next to their source file, and exports are prefixed with the name of the file they're in (such as `puzzles/main.rue.hex` and `puzzles/main.rue_my_puzzle.rue.hex`). If `dist_dir` is set in `Rue.toml`, they are all written to that directory instead, and are named after just the file or export (such as `dist/main.rue.hex` and `dist/my_puzzle.rue.hex`). Since those names can collide, two programs with the same name are an error.
