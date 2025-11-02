---
slug: /debugging
---

# Debugging

:::note
Rue's developer tools are still a work in progress, and important functionality may be missing in the meantime.
:::

## Debug Print

You can use `debug` statements to print messages to the console:

```rue
debug "Hello, world!";
```

If you compile this with `rue build`, it will be omitted from the compiled program (since printing isn't supported in CLVM natively). However, if you compile this with `rue build -d`, special debug symbols will be included that will print the message (as an untyped CLVM value) to the console at runtime.

This modified version of CLVM can be executed with the `rue debug` command, with `rue test`, or with the [Wallet SDK](https://github.com/xch-dev/chia-wallet-sdk) simulator.
