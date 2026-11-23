---
slug: /testing
---

# Testing

Rue has a built-in test runner, so you can write unit tests right alongside your code. Tests are just functions marked with `test`:

```rue
fn factorial(num: Int) -> Int {
    if num > 1 {
        num * factorial(num - 1)
    } else {
        1
    }
}

test fn factorial_works() {
    assert factorial(0) == 1;
    assert factorial(5) == 120;
}
```

You can run every test in the project with:

```bash
rue test
```

If you pass a file or directory, it's used to find the project, and all of that project's tests are run. A file that isn't part of a project is tested by itself:

```bash
rue test scratch.rue
```

## How Tests Run

Each test function is compiled as its own program, in debug mode, and run with an empty solution. A test passes if it finishes without raising an error, and returns `nil`.

The output shows each test as it runs, and the reason for any failure. For example, if there was also a `factorial_fails` test with an incorrect assertion:

```
Running test `factorial_works` (1/2)
Running test `factorial_fails` (2/2)
Test failed due to raise: "assertion failed at main.rue:15:5"
  main.rue:15:5, in factorial_fails
    assert factorial(3) == 7;
```

Since tests are compiled in debug mode, failed assertions and `raise` statements include the location they occurred at, along with the message of an [assert](/docs/control-flow.md#assert) that has one, and [debug statements](/docs/debugging.md) print their values as the test runs.

If the project's `Rue.toml` sets a `version`, `rue test` fails unless it matches the version of the CLI, the same as `rue build`.

## Stack Traces

When a test fails by raising an error, the output includes a stack trace, which lists the functions that were running when it failed, from the test itself to the innermost function. Each one shows the line it was running, and the values of its parameters:

```rue
fn factorial(num: Int) -> Int {
    assert num >= 0, "factorial of a negative number";

    if num > 1 {
        num * factorial(num - 1)
    } else {
        1
    }
}

fn choose(n: Int, k: Int) -> Int {
    factorial(n) / (factorial(k) * factorial(n - k))
}

test fn choose_works() {
    assert choose(5, 2) == 10;
}
```

If there was also a test that called `choose` with `k` larger than `n`, which makes `factorial` fail:

```rue ignore
test fn choose_fails() {
    assert choose(2, 5) == 0;
}
```

The output shows each call that led to the failure:

```
Running test `choose_works` (1/2)
Running test `choose_fails` (2/2)
Test failed due to raise: ("assertion failed at main.rue:2:5" "factorial of a negative number")
  main.rue:20:12, in choose_fails
    assert choose(2, 5) == 0;
  main.rue:12:36, in choose
    factorial(n) / (factorial(k) * factorial(n - k))
    n = 2
    k = 5
  main.rue:2:5, in factorial
    assert num >= 0, "factorial of a negative number";
    num = -3
```

A test that returns a value other than `nil` fails without a stack trace, since nothing went wrong while it ran. To see where a compiled program fails outside of a test, see [Debug Metadata](/docs/debugging.md#debug-metadata).

Test functions aren't included when compiling the program normally, so they don't affect the size or cost of your puzzles.

## Cost Limit

To prevent a test that never ends (such as one with infinite recursion) from hanging, each test stops once its CLVM cost passes 11,000,000,000, which is the same as Chia's block cost limit. You can change the limit with `--max-cost`:

```bash
rue test --max-cost 100000000
```

This is also a useful way to make sure that a puzzle stays within a certain cost.

## Testing Puzzles

Tests are great for checking the logic of individual functions. To test a full puzzle with real coins, signatures, and conditions, you can use a simulator like the one in the [Chia Wallet SDK](https://github.com/xch-dev/chia-wallet-sdk), which can compile Rue code directly. The [tutorials](/docs/tutorials/password.md) show how to set this up.
