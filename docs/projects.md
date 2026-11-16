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

Every `.rue` file inside of the `puzzles` directory (including in subdirectories) is part of the project, and can reference the others as [modules](/docs/modules.md).

## Finding the Project

When you run a command such as `rue build` or `rue test`, the CLI searches for the project that the current directory (or the file you pass to it) belongs to:

1. The nearest `Rue.toml` in the directory or any of its parents is used, if there is one. So you can run commands from anywhere inside a project.
2. Otherwise, the nearest directory with a `main.rue` file is treated as the project, using the default settings.
3. Otherwise, a single `.rue` file is compiled by itself.

## Manifest

The `Rue.toml` file configures the compiler, the formatter, and which lints are reported. Here's what `rue init` generates:

```toml
[compiler]
version = "0.12.0"
entrypoint = "puzzles"

[formatter]
max_width = 100
indent_width = 4
```

### Compiler

| Key          | Default     | Description                                                                                                                                     |
| ------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`    | Not set     | The version of Rue that the project is written for. If it's set and doesn't match the installed version of the CLI, `rue build` fails.          |
| `entrypoint` | `"puzzles"` | The directory (or file) containing the source code, relative to `Rue.toml`.                                                                     |
| `std`        | `true`      | Whether to include the [standard library](/docs/standard-library.md). Set this to `false` to only have access to [builtins](/docs/builtins.md). |
| `dist_dir`   | Not set     | The directory that `rue build --all` writes compiled programs to. If it's not set, each program is written next to its source file.             |

### Formatter

| Key            | Default | Description                                              |
| -------------- | ------- | -------------------------------------------------------- |
| `max_width`    | `100`   | The maximum width of a line before it's broken up.       |
| `indent_width` | `4`     | The number of spaces used for each level of indentation. |

See [Formatting](/docs/formatting.md) for more details.

### Lints

The `[lints]` section sets the level of individual lints or lint groups:

```toml
[lints]
unused = "deny"
unused_binding = "allow"
```

See [Lints](/docs/lints.md) for the list of lints and how their levels are resolved.

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

By default, the files are written next to their source file (such as `puzzles/main.rue.hex`). If `dist_dir` is set in `Rue.toml`, they are all written to that directory instead, and are named after the file or export (such as `dist/main.rue.hex` and `dist/my_puzzle.rue.hex`).
