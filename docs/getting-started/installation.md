---
slug: /installation
---

# Installation

:::danger
This is an alpha release of Rue. It should **NOT** be used for production use.
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

## VSCode

Currently the only editor with support for Rue is [Visual Studio Code](https://code.visualstudio.com).

Install the [Rue extension](https://example.com) for syntax highlighting and a built in LSP client for Rue files.

You can install the Language Server with this command:

```bash
cargo install rue-lsp
```
