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

Or only the tests in a single file:

```bash
rue test puzzles/utils.rue
```

## How Tests Run

Each test function is compiled as its own program, in debug mode, and run with an empty solution. A test passes if it finishes without raising an error, and returns `nil`.

The output shows each test as it runs, and the reason for any failure. For example, if there was also a `factorial_fails` test with an incorrect assertion:

```
Running test `factorial_works` (1/2)
Running test `factorial_fails` (2/2)
Test failed due to raise: "assertion failed at main.rue:15:5"
```

Since tests are compiled in debug mode, failed assertions and `raise` statements include the location they occurred at, and [debug statements](/docs/debugging.md) print their values as the test runs.

Test functions aren't included when compiling the program normally, so they don't affect the size or cost of your puzzles.

## Cost Limit

To prevent a test that never ends (such as one with infinite recursion) from hanging, each test stops once its CLVM cost passes 11,000,000,000, which is the same as Chia's block cost limit. You can change the limit with `--max-cost`:

```bash
rue test --max-cost 100000000
```

This is also a useful way to make sure that a puzzle stays within a certain cost.

## Testing Puzzles

Tests are great for checking the logic of individual functions. To test a full puzzle with real coins, signatures, and conditions, you can use a simulator like the one in the [Chia Wallet SDK](https://github.com/xch-dev/chia-wallet-sdk), which can compile Rue code directly. The [tutorials](/docs/tutorials/password.md) show how to set this up.
