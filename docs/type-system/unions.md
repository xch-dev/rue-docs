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

```rue
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
fn first(value: (Int, Bytes) | (Bytes32, nil)) -> Int | Bytes32 {
    value.first
}
```

However, named fields can't be accessed on a union of different structs, even if every struct has a field with that name. Narrow it to one of the structs first.

## Optional Values

A union with `nil` is the idiomatic way to represent a value that may not be present, like `Option` or `null` in other languages.

However, `nil` is the same value as `0`, `false`, and `""` at runtime, so a union like `Int | nil` can't be narrowed. Use a type that never has that value instead, such as `Bytes32`, a pair, or a struct. See [Overlapping Values](/docs/type-system/guards.md#overlapping-values).
