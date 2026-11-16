---
slug: /debugging
---

# Debugging

## Debug Mode

By default, the compiler optimizes your program as much as possible, and leaves out anything that isn't needed for it to run correctly, such as error messages.

When you compile in debug mode, with `rue build --debug`:

1. `debug` statements are included in the program.
2. `raise` statements include their message, and the location they occurred at.
3. Failed `assert` statements raise a message with their location, such as `"assertion failed at main.rue:2:5"`.
4. Some optimizations are disabled, so the output more closely matches the structure of your code.

Tests are always compiled in debug mode.

:::warning
Debug builds should only be used for development. They are larger and more expensive to run, have a different puzzle hash than the normal build, and `debug` statements use an operator that isn't part of standard CLVM. Always deploy puzzles compiled without `--debug`.
:::

## Debug Statements

You can use `debug` statements to print values to the console while a program runs:

```rue
fn main(value: Int) -> Int {
    debug value;
    value * 2
}
```

The value can be anything, and is printed as an untyped CLVM value, along with the location of the statement.

If you compile this with `rue build`, it will be omitted from the compiled program (since printing isn't supported in CLVM natively). However, if you compile this with `rue build --debug`, special debug symbols will be included that will print the value at runtime.

This modified version of CLVM can be executed with the `rue debug` command, with `rue test`, or with the [Wallet SDK](https://github.com/xch-dev/chia-wallet-sdk) simulator. For example:

```bash
$ rue debug "$(rue build --debug)" "(10)"
main.rue:2:5: 10
20
```

:::tip
Since `debug` statements shouldn't be left in your code once you're done with them, you can enable the `debug_statement` [lint](/docs/lints.md) to report any that remain.
:::

## Running Programs

The `rue debug` command runs any CLVM program against a solution, and prints the result. This is useful for checking how a compiled puzzle behaves with different solutions, without having to write a test:

```bash
$ rue build
(* 2 (q . 2))
$ rue debug "(* 2 (q . 2))" "(10)"
20
```

See [Command Line](/docs/cli.md#rue-debug) for the available options.
