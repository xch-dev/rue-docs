---
slug: /cli
---

# Command Line

The `rue` command line tool is installed with `cargo install rue-cli` (see [Installation](/docs/installation.md)).

| Command                          | Description                                                       |
| -------------------------------- | ----------------------------------------------------------------- |
| `rue init [path]`                | Create a new project with a `Rue.toml` manifest.                  |
| `rue build [file]`               | Compile the project (or a single file) and print the CLVM output. |
| `rue test [file]`                | Run every `test fn` in the project.                               |
| `rue fmt [paths...] [--check]`   | Format Rue source files, or check that they're already formatted. |
| `rue debug <program> [solution]` | Run a CLVM program against a solution and print the result.       |
| `rue lints`                      | List every lint and its default level, and the lint groups.       |

## `rue init`

Creates a new [project](/docs/projects.md) in the given directory (or the current directory, if none is given), with a `Rue.toml` manifest and a `puzzles/main.rue` file. It fails if either of those files already exist.

```bash
rue init my-project
```

## `rue build`

Compiles the project's `main` function, and prints the CLVM output.

```bash
$ rue build
(q . "Hello, world!")
```

If you pass a file, its `main` function is compiled instead:

```bash
rue build puzzles/other.rue
```

| Flag             | Description                                                                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `-e`, `--export` | Compile the exported function with this name instead of `main`.                                                                          |
| `-x`, `--hex`    | Output the serialized bytecode as hex, instead of the CLVM text.                                                                         |
| `-h`, `--hash`   | Output the tree hash of the compiled program. This can be combined with `--hex` to output both.                                          |
| `-s`, `--split`  | Split the hex output into lines of 64 characters. This requires `--hex` (or `--all`).                                                    |
| `-d`, `--debug`  | Compile in debug mode, which includes `debug` statements and messages for failed assertions, and disables some optimizations.            |
| `-a`, `--all`    | Compile every entrypoint in the project, and write each one to a file. See [Building Everything](/docs/projects.md#building-everything). |
| `-A`, `--allow`  | Allow a lint or lint group. Can be repeated.                                                                                             |
| `-W`, `--warn`   | Report a lint or lint group as a warning. Can be repeated.                                                                               |
| `-D`, `--deny`   | Report a lint or lint group as an error, which fails compilation. Can be repeated.                                                       |
| `-F`, `--forbid` | Like `--deny`, but attributes and later flags can't change the level. Can be repeated.                                                   |

:::note
Since `-h` is short for `--hash`, the help text for `rue build` is only available as `--help`.
:::

Errors and warnings are printed with the file, line, and column they occurred at. If there are any errors (including lints that are denied), nothing is output and the command fails.

## `rue test`

Compiles the project in debug mode, and runs every [test function](/docs/testing.md) in it. If you pass a file or directory, it's used to find the project, and all of that project's tests are run. A file that isn't part of a project is tested by itself.

```bash
$ rue test
Running test `factorial_works` (1/1)
```

A test passes if it finishes without raising an error and returns `nil`. The command fails if any of the tests fail.

| Flag                   | Description                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| `--max-cost`           | The maximum CLVM cost each test can use before it fails. Defaults to `11000000000`, Chia's block cost limit. |
| `-A`, `-W`, `-D`, `-F` | Set the level of a lint or lint group, the same as for `rue build`.                                          |

## `rue fmt`

Formats Rue source files in place. With no arguments, every file in the project is formatted. Otherwise, you can pass any number of files, directories, or glob patterns:

```bash
rue fmt
rue fmt puzzles/main.rue
rue fmt 'puzzles/**/*.rue'
```

With `--check`, files are not changed. Instead, it lists the files that need to be formatted, and fails if there are any. This is useful in CI.

See [Formatting](/docs/formatting.md) for more details.

## `rue debug`

Runs a CLVM program against a solution (which defaults to `nil`), and prints the result. Both are written in CLVM's text format, or as hex with `--hex`:

```bash
$ rue debug "(+ 2 5)" "(10 20)"
30
```

Unlike other CLVM runners, this supports the debug output from programs compiled with `rue build --debug`, which prints the value of each `debug` statement as the program runs. See [Debugging](/docs/debugging.md).

| Flag          | Description                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| `-x`, `--hex` | Read the program and solution as serialized hex, instead of CLVM text.                                         |
| `--max-cost`  | The maximum CLVM cost the program can use before it fails. Defaults to `11000000000`, Chia's block cost limit. |

## `rue lints`

Lists every lint, along with its default level and a short description, as well as the lint groups and the lints in each of them. See [Lints](/docs/lints.md).
