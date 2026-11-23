---
slug: /security
---

# Security

Puzzles control real value on the blockchain, and anyone can choose the solution they spend a coin with. So it's important to keep in mind what the type system can and can't guarantee.

## Untrusted Values

While Rue's type system aims to provide the means to comprehensively check the type of values at runtime, the types of the parameters of the `main` function are assumed to be correct. Nothing checks that a solution actually matches the types you declared.

This means that a program like this is actually incorrect:

```rue
fn main(parent_coin_id: Bytes32, puzzle_hash: Bytes32, amount: Int) -> Bytes32 {
    sha256(parent_coin_id + puzzle_hash + amount as Bytes)
}
```

Because the length of the untrusted values `parent_coin_id` and `puzzle_hash` are unchecked, they may be manipulated in a way that increases the length of `amount` without affecting the concatenated value.

For example, if `parent_coin_id` was 28 bytes, `puzzle_hash` was shifted 4 bytes to the left, and the value of `amount` grew by 4 bytes, it would suddenly be much larger than it was before without changing the hash.

This is what led to the [CAT1 vulnerability](https://www.chia.net/2022/07/29/cat1-vulnerability-explained-cve-and-cwe/).

The solution is to use a more general type and check the invariants you care about at runtime:

```rue
fn main(parent_coin_id: Bytes, puzzle_hash: Bytes, amount: Int) -> Bytes32 {
    assert parent_coin_id is Bytes32;
    assert puzzle_hash is Bytes32;

    sha256(parent_coin_id + puzzle_hash + amount as Bytes)
}
```

Or you can use the builtin [`coinid`](/docs/builtins.md#coinid) function, which checks the lengths for you:

```rue
fn main(parent_coin_id: Bytes32, puzzle_hash: Bytes32, amount: Int) -> Bytes32 {
    coinid(parent_coin_id, puzzle_hash, amount)
}
```

Now, if someone tried to play tricks with the lengths, the program would raise an error.

## Untrusted Structure

The same applies to the structure of values. If a parameter is declared as a struct or a list, an attacker can pass an atom, a shorter list, or a list with extra values instead. Accessing a field of a value that isn't a pair raises an error, which is usually safe, but anything that depends on the exact contents of a value (such as a hash) should be checked.

When in doubt, accept a broader type (such as `Any`) and narrow it with a [type guard](/docs/type-system/guards.md), which emits the runtime checks for you.

## Checks in Release Builds

Release builds are heavily optimized, but the optimizer never removes or skips a check that can fail. If a function call, assertion, or other expression can raise an error, it's still evaluated in the release build, even if its value is never used or the binding it's assigned to is inlined. So this program rejects the wrong password in both debug and release builds, even though `_checked` isn't used:

```rue
fn check_password(password: Bytes) -> Bool {
    assert sha256(password) == 0x2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824;
    true
}

fn main(password: Bytes) -> Int {
    let _checked = check_password(password);
    42
}

test fn accepts_password() {
    assert main("hello") == 42;
}
```

This means you can rely on a release build to fail whenever the debug build does, as long as the solution matches the types you declared (and, before hard fork 2, as long as the `operand_limits` option is on if mainnet's [operand limits](/docs/builtins.md#operand-limits) matter to your puzzle). Expressions that can't fail, such as `a + b`, can still be left out when their values aren't used.

## Other Things to Watch Out For

- `inline if` and `inline match` evaluate every branch, so an error in a branch that isn't selected still causes the program to raise. See [Inline If](/docs/control-flow.md#inline-if) and [Inline Match](/docs/match.md#inline-match).
- `&` and `|` always evaluate both sides, so the right side raises even when the left side decides the result, and `&&` and `||` return their right side as is, which may not be `true` or `false` if it's an untrusted `Bool`. See [Logical Operators](/docs/operators.md#logical).
- Until hard fork 2, mainnet rejects some long operands of `*`, `/`, `%`, and a few builtins, which Rue doesn't check for by default. See [Operand Limits](/docs/builtins.md#operand-limits).
- `nil`, `0`, `false`, and `""` are the same value at runtime, so a type guard can't distinguish between them. See [Type Guards](/docs/type-system/guards.md#overlapping-values).
- Byte values with leading zeros aren't equal to the integer they appear to represent. See [Int](/docs/type-system/atoms.md#int).
- `unchecked_cast` bypasses the type system entirely. See [Unchecked Casts](/docs/type-system/casting.md#unchecked-casts).
- Puzzles compiled with `--debug` aren't meant to be deployed. See [Debugging](/docs/debugging.md).

:::warning
The example puzzles in the Rue repository have not been audited, and are for educational purposes only. Have puzzles that hold real value reviewed carefully before deploying them.
:::
