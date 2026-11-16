---
slug: /guards
---

# Type Guards

A type guard allows you to check a value at runtime and change the type at compile time to match. It's written with the `is` keyword, and evaluates to a `Bool`.

As a simple example, you can check the length of values:

```rue
fn main(bytes: Bytes) -> Bytes32 {
    assert bytes is Bytes32;
    bytes
}
```

After this assertion, the type of `bytes` is now `Bytes32` since it has been checked.

However, if you negate a type guard with the `!` operator or use the value in an else branch, it will remain the `Bytes` type since there was no union that could be narrowed:

```rue
fn main(bytes: Bytes) -> Bytes {
    assert !(bytes is Bytes32);
    bytes
}
```

## What's Checked

The compiler emits the minimum set of checks needed to verify that the value on the left matches the type on the right. It skips any checks that are already implied by the type on the left. Depending on the types involved, it can check:

1. Whether the value is an atom or a pair, such as `value is Bytes` or `value is (Any, Any)`.
2. The length of an atom, such as `value is Bytes32` or `value is PublicKey`.
3. The exact value of an atom, for [literal types](/docs/type-system/atoms.md#literal-types), such as `value is 42` or `value is nil`.
4. Each of the above for the `first` and `rest` of a pair, recursively.

Since a struct is a list at runtime, checking for a struct checks its structure and any fields with literal types. For example, every [condition](/docs/standard-library.md#conditions) in the standard library has a literal `opcode`, so if you already know that a value is a `Condition`, checking whether it's a `CreateCoin` only needs to compare the opcode to `51`.

## Narrowing

Type guards can be used to narrow the type of a union to one or more of its variants.

Let's say you have a union of structurally distinct types:

```rue
fn fee(condition: CreateCoin | ReserveFee) -> Int {
    if condition is CreateCoin {
        // The type is CreateCoin in this branch
        0
    } else {
        // The type is ReserveFee in this branch
        condition.amount
    }
}
```

The else branch removes `CreateCoin` as a possibility, narrowing it down to the opposite, which is `ReserveFee`. This works regardless of how many variants you have in the union.

The narrowed type applies anywhere the result of the guard is known:

1. In the branches of an `if` expression.
2. After an `if` statement that returns or raises, using the opposite of the condition.
3. After an `assert` statement.
4. On the right side of `&&` and `||`, such as `value is Int && value > 5`.

Guards can be combined with `!`, `&&`, `||`, `&`, and `|`, and the compiler will narrow each value based on what's known in each branch:

```rue
fn add(x: Int | (Int, Int), y: Int | (Int, Int)) -> Int {
    if x is Int && y is Int {
        x + y
    } else {
        0
    }
}
```

:::warning
The type after `is` can be a union, so a `|` directly after a guard is read as part of the type. Wrap each guard in parentheses before combining them with `|`, such as `(x is Int) | (y is Int)`. The same applies to casts with `as`.
:::

### Fields

You can also guard a field of a pair or struct, such as `pair.first` or `point.x`. This narrows the type of that field wherever it's accessed through the same value:

```rue
struct Point {
    x: Int | (Int, Int),
    y: Int,
}

fn sum(point: Point) -> Int {
    if point.x is Int {
        point.x + point.y
    } else {
        point.y
    }
}
```

This works for nested fields as well, such as `outer.inner.x`.

## Lints

The compiler warns about type guards that don't do anything useful:

- `unnecessary_guard` reports guards where the value is already known to be of the type, so a check isn't needed.
- `indistinguishable_guard` reports guards that are always true at runtime, even though the types are different. For example, `value is Int` when `value` is `Int | nil` can never be false, since `nil` and `0` have the same runtime representation.

## Limitations

Some types can't be checked at runtime. Using them on the right side of a type guard is an error.

### Function Types

Rue supports [higher-order functions](https://en.wikipedia.org/wiki/Higher-order_function), which means functions can be passed around freely as values. As such, it's possible to express [functions as types](/docs/functions.md#function-types).

However, there's no way to know at runtime whether or not a value fits the definition of a given function type. Any value _could_ match the type, but not every value _does_ match the type.

Due to this, it is **not possible** to check if a value is a function, or to narrow union types that contain function variants.

### Recursive Types

A recursive type such as `List<Int>` can't be checked, since it would require a loop to check every item, and the length of the list isn't known at compile time.

However, you can check a recursive type against a non-recursive one, such as `list is nil` or `list is (Int, List<Int>)`, since that only requires a fixed number of checks.

### Generic Types

A [generic type](/docs/type-system/generics.md) parameter such as `T` could be any type, so there's no way to know what to check.

### Deeply Nested Types

The compiler limits how deeply nested a type can be checked, to avoid generating an excessive amount of code. A very long list type such as `[Int, Int, ..., Int]` can't be checked all at once.

### Overlapping Values

Because different types can share the same runtime representation, a guard can only tell types apart if there's a value that belongs to one and not the other. In particular, `nil` is the same as `0`, `false`, and `""`. So in a union like `Int | nil`, every value is also a valid `Int`, and `value is Int` is always true.

To represent an optional value that can be told apart from `nil`, use a type that never has that value, such as `Bytes32`, a pair, or a struct.
