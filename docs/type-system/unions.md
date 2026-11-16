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

This doesn't apply to unions of different structs, since each struct's fields are only known after narrowing to that struct.

## Optional Values

A union with `nil` is the idiomatic way to represent a value that may not be present, like `Option` or `null` in other languages.

However, keep in mind that `nil` has the same runtime representation as `0`, `false`, and the empty string. So it's only possible to tell `nil` apart from types that never have that value, such as `Bytes32`, pairs, or structs. A union like `Int | nil` can't be narrowed, since every `nil` is also a valid `Int`. See [Type Guards](/docs/type-system/guards.md#limitations) for more details.
