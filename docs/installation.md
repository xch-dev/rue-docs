---
slug: /installation
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Installation

Rue is a statically typed programming language that compiles to [CLVM](https://chialisp.com/clvm) bytecode. It's designed as an alternative to [Chialisp](https://chialisp.com) for writing coin puzzles on the [Chia blockchain](https://chia.net).

:::note
Rue is still in active development. If you run into any issues, please report them in [GitHub issues](https://github.com/xch-dev/rue/issues).
:::

:::tip
If you just want to try the language, the [Playground](https://play.rue-lang.com) runs the compiler entirely in your browser, with no installation required.
:::

## Command Line Tool

First, you will need to install the [Rust toolchain](https://rustup.rs).

Then you can install the Rue CLI from [crates.io](https://crates.io/crates/rue-cli):

```bash
cargo install rue-cli
```

This installs the `rue` command, which includes the compiler, test runner, formatter, and CLVM debugger. See the [Command Line](/docs/cli.md) page for everything it can do.

It's also useful to install [clvm_tools_rs](https://github.com/Chia-Network/clvm_tools_rs), which provides tools such as `brun` and `opd` for working with CLVM directly:

```bash
cargo install clvm_tools_rs
```

## Editor Support

Rue has a language server, which provides:

- Diagnostics as you type, and quick fixes for many lints.
- Hover information, go to definition, and find references.
- Renaming functions, constants, bindings, structs, enums, fields, modules and other symbols across the project, including the files of file modules.
- Completions, and signature help that shows the parameters of a call or the fields of a struct initializer as you type them, with any inferred generic arguments.
- Inlay hints for the inferred types of bindings and lambda parameters, inferred generic arguments, and the names of the parameters that arguments are passed to.
- Document outlines and workspace symbol search.
- [Formatting](/docs/formatting.md).

You can install it with this command:

```bash
cargo install rue-lsp
```

<Tabs>
<TabItem value="vscode" label="VSCode" default>

You will need to install [Visual Studio Code](https://code.visualstudio.com).

Then, you can install the [Rue extension](https://marketplace.visualstudio.com/items?itemName=Rigidity.rue-language) on the VSCode marketplace. It provides syntax highlighting, and uses the `rue-lsp` language server installed above.

</TabItem>
<TabItem value="cursor" label="Cursor">

You will need to install [Cursor](https://cursor.com/).

Then, you can install the [Rue extension](https://open-vsx.org/extension/Rigidity/rue-language) on the Open VSX marketplace. It provides syntax highlighting, and uses the `rue-lsp` language server installed above.

</TabItem>
</Tabs>

:::tip
Any editor that supports Open VSX and VSCode extensions will likely support this. Other editors can run `rue-lsp` directly, since it communicates over the standard [Language Server Protocol](https://microsoft.github.io/language-server-protocol/).
:::

Each kind of inlay hint can be turned off with the language server's `inlayHints` setting, which has the keys `types`, `genericArguments` and `parameterNames` (all `true` by default). It's read from the initialization options and from configuration change notifications, either directly or under `rue`:

```json
{
  "rue": {
    "inlayHints": {
      "types": true,
      "genericArguments": true,
      "parameterNames": false
    }
  }
}
```

## Hello World

The simplest program in Rue is the classic "hello world" example.

You can run the following command to set up a new project:

```bash
rue init my-project
cd my-project
```

This creates a `Rue.toml` manifest, and a `puzzles/main.rue` file with the following contents:

```rue
fn main() -> String {
    "Hello, world!"
}
```

Now you can build it:

```bash
rue build
```

The output is the compiled CLVM program:

```
(q . "Hello, world!")
```

You can learn more about how projects are laid out on the [Projects](/docs/projects.md) page.
