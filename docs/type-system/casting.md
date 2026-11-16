---
slug: /casting
---

# Casting

A cast changes the type of a value at compile time, without changing the value itself or emitting any code at runtime. It's written with the `as` keyword.

## Semantic Casts

Some types have the same runtime representation, but are semantically different. For example, an `Int` and a `Bytes` value are both atoms, but they are treated differently by operators. Assigning one to the other requires a cast, to make sure it's intentional:

```rue
fn main(value: Bytes) -> Int {
    value as Int + 1
}
```

The same goes for [structs](/docs/type-system/structs.md#semantics), which are lists at runtime, but can't be assigned to and from lists or other structs without a cast:

```rue
struct Point {
    x: Int,
    y: Int,
}

fn main() -> Point {
    [1, 2] as Point
}
```

## What Can Be Cast

A cast is only allowed if the value is already known to have the structure of the target type. So you can cast between atom types, or between pairs, lists, and structs with the same layout. However, you can't use a cast to check something that's only known at runtime, such as:

1. Casting a pair to an atom, or an atom to a pair, which is an error since they have different runtime representations.
2. Casting to a narrower type, such as `Bytes` to `Bytes32` or `Any` to `Int`, which requires a [type guard](/docs/type-system/guards.md) to check the value at runtime.

Casting to a type that the value is already compatible with is reported by the `unnecessary_cast` [lint](/docs/lints.md).

## Unchecked Casts

If you need to cast a value to a type that it can't be cast to normally, you can use the `unchecked_cast` builtin. It changes the type to anything you want, without any checks at compile time or at runtime:

```rue
fn main(value: Any) -> Int {
    unchecked_cast::<Int>(value)
}
```

:::danger
An unchecked cast tells the compiler to trust you, so if the value doesn't actually match the type, the program can behave in unexpected ways. This is especially dangerous for values that come from the solution of a puzzle, which an attacker can choose. Prefer a type guard whenever possible.
:::
