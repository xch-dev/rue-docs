---
slug: /unions
---

# Unions

A union allows a value to be one of multiple distinct types.

For example, either `Bytes32` or `nil`:

```rue
type Owner = Bytes32 | nil;
```

You can assign either of these types to `Owner`:

```rue ignore
fn main() -> Owner {
    nil
}
```

But you must narrow the type further through [Type Guards](/docs/type-system/guards.md) before using it as one of its individual types:

```rue
type Owner = Bytes32 | nil;

fn main(maybe_owner: Owner) -> Bytes32 {
    // This would fail because the type is too broad
    // let owner: Bytes32 = maybe_owner;

    // This will check at runtime, allowing the type to be narrowed
    assert maybe_owner is Bytes32;

    // And now this works because we know it's not nil
    maybe_owner
}
```

## Fields of Unions

If every type in a union is a pair, you can access `first` and `rest` directly, and the result is the union of each type's field:

```rue
fn first(value: (Int, Bytes) | ((Int, Int), nil)) -> Int | (Int, Int) {
    value.first
}
```

However, named fields can't be accessed on a union of different structs, even if every struct has a field with that name. Narrow it to one of the structs first.

## Optional Values

A union with `nil` is the idiomatic way to represent a value that may not be present, like `Option` or `null` in other languages.

However, `nil` is the same value as `0`, `false`, and `""` at runtime, so a union like `Int | nil` can't be narrowed. Use a type that never has that value instead, such as `Bytes32`, a pair, or a struct. See [Overlapping Values](/docs/type-system/guards.md#overlapping-values).

## Overlapping Members

Each type is only part of a union once, so a union like `Int | Int` is the same as `Int`, and `true | false` is the same as `Bool` (and is shown that way in error messages).

The compiler warns about members of a union you've written that overlap with another member:

- `redundant_union_member` reports a member whose values are all values of another member, so the union is the same without it. For example, `5` in `Int | 5`, or `Bytes32` in `Owner | Bytes32` when `Owner` already includes `Bytes32`. Remove the member.
- `indistinguishable_union_member` reports a member whose values are all valid values of another member at runtime, even though the types are different, such as `nil` in `Int | nil` or `Bytes32` in `Int | Bytes32`. A [type guard](/docs/type-system/guards.md) or [`match`](/docs/match.md) can't tell these members apart, so checking for one also takes the other member's values that look the same.

```rue warn
// Warning: `nil` overlaps with `Int` at runtime
type MaybeAmount = Int | nil;
```

If you only need the union to describe a value, and never need to narrow it, you can [allow](/docs/lints.md#attributes) the lint. Otherwise, change one of the members so that they can be told apart.
