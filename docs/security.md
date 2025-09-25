---
slug: /security
---

# Security

## Untrusted Values

While Rue's type system aims to provide the means to comprehensively check the type of values at runtime, the types of values passed into the `main` function are currently assumed to be correct by default.

This means that a program like this is actually incorrect:

```rue
fn main(
    parent_coin_id: Bytes32,
    puzzle_hash: Bytes32,
    amount: Int,
) -> Bytes32 {
    sha256(parent_coin_id + puzzle_hash + amount as Bytes)
}
```

Because the length of the untrusted values `parent_coin_id` and `puzzle_hash` are unchecked, they may be manipulated in a way that increases the length of `amount` without affecting the concatenated value.

For example, if `parent_coin_id` was 28 bytes, `puzzle_hash` was shifted 4 bytes to the left, and the value of `amount` grew by 4 bytes, it would suddenly be much larger than it was before without changing the hash.

This is what led to the [CAT1 vulnerability](https://www.chia.net/2022/07/29/cat1-vulnerability-explained-cve-and-cwe/).

The solution is to use a more general type and check the invariants you care about at runtime:

```rue
fn main(
    parent_coin_id: Bytes,
    puzzle_hash: Bytes,
    amount: Int,
) -> Bytes32 {
    assert parent_coin_id is Bytes32;
    assert puzzle_hash is Bytes32;

    sha256(parent_coin_id + puzzle_hash + amount as Bytes)
}
```

Now, if someone tried to play tricks with the lengths, the assertions would fail and the program would raise an error.
