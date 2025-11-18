---
slug: /installation
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Installation

:::warning
Rue is currently in alpha. Please use it with caution and report any bugs you find in doing so.
:::

First, you will need to install the [Rust toolchain](https://rustup.rs).

You can install the Rue CLI with this command:

```bash
cargo install rue-cli
```

It's also useful to install [clvm_tools_rs](https://github.com/Chia-Network/clvm_tools_rs):

```bash
cargo install clvm_tools_rs
```

## Editor Support

<Tabs>
<TabItem value="vscode" label="VSCode" default>

You will need to install [Visual Studio Code](https://code.visualstudio.com).

Then, you can install the [Rue extension](https://marketplace.visualstudio.com/items?itemName=Rigidity.rue-language) on the VSCode marketplace. It provides syntax highlighting and LSP integration.

You can install the Rue language server with this command:

```bash
cargo install rue-lsp
```

This should automatically work with the extension.

</TabItem>
<TabItem value="cursor" label="Cursor">

You will need to install [Cursor](https://cursor.com/).

Then, you can install the [Rue extension](https://open-vsx.org/extension/Rigidity/rue-language) on the Open VSX marketplace. It provides syntax highlighting and LSP integration.

You can install the Rue language server with this command:

```bash
cargo install rue-lsp
```

This should automatically work with the extension.

</TabItem>
</Tabs>

:::tip
Any editor that supports Open VSX and VSCode extensions will likely support this.
:::

## Hello World

The simplest example of a program in Rue is the classic hello world example.

Write the following program in a file named `hello.rue`:

```rue title="hello.rue"
fn main() -> String {
    "Hello, world!"
}
```

Now, run the following command to run the file:

```bash
rue build hello.rue
```

The output should be `(q . "Hello, world!)"`, which when run with CLVM outputs the string on its own.
