---
slug: /debugging
---

# Debugging

## Debug Mode

By default, the compiler optimizes your program as much as possible, and leaves out anything that isn't needed for it to run correctly, such as error messages.

When you compile in debug mode, with `rue build --debug`:

1. `debug` statements are included in the program.
2. `raise` statements include their message, and the location they occurred at.
3. Failed `assert` statements raise a message with their location, such as `"assertion failed at main.rue:2:5"`, along with the [assert's message](/docs/control-flow.md#assert) if it has one.
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

## Debug Metadata

When a program fails, `rue debug` only reports the error by default. To see where in the source it failed, build it with `--debug-metadata`, which also writes a debug metadata sidecar file that maps the compiled program back to the source. Then pass the sidecar to `rue debug`:

```rue
fn main(amount: Int, fee: Int) -> Int {
    spend(amount, fee)
}

fn spend(amount: Int, fee: Int) -> Int {
    assert fee <= amount, "fee is larger than the amount";
    amount - fee
}
```

```bash
$ rue build --debug --debug-metadata
(a (q 2 2 (c 5 11)) (c (q 2 (i (not (> 3 2)) (q 17 2 3) (q 8 (q . "assertion failed at main.rue:6:5") (q . "fee is larger than the amount"))) 1) 1))
$ rue debug "$(rue build --debug)" "(10 20)" --debug-metadata puzzles/main.rue.debug.clvm.bin
Error: clvm raise
  main.rue:2:5, in main
    spend(amount, fee)
    amount = 10
    fee = 20
  main.rue:6:5, in spend
    assert fee <= amount, "fee is larger than the amount";
    amount = 10
    fee = 20
```

The stack trace lists the functions that were running when it failed, from the outermost to the innermost, with the line each one was running and the values of its parameters.

The sidecar doesn't change the compiled program, so it works for release builds as well as debug builds. Release builds inline more functions, so their stack traces have fewer frames:

```bash
$ rue build --debug-metadata
(a (i (> 5 2) (q 8) (q 17 2 5)) 1)
$ rue debug "(a (i (> 5 2) (q 8) (q 17 2 5)) 1)" "(10 20)" --debug-metadata puzzles/main.rue.debug.clvm.bin
Error: clvm raise
  main.rue:6:5, in main
    assert fee <= amount, "fee is larger than the amount";
    amount = 10
    fee = 20
```

A sidecar is written next to the source file by default, or to the path given with `--debug-metadata=<PATH>`. You can pass `--debug-metadata` to `rue debug` more than once, such as when a program runs another program that was compiled separately. See [`rue build`](/docs/cli.md#rue-build) for where `rue build --all` writes them.

[`rue test`](/docs/testing.md#stack-traces) shows the same kind of stack trace for a test that fails, without needing a sidecar.
