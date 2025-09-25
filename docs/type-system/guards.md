---
slug: /guards
---

# Guards

A type guard allows you to check a value at runtime and change the type at compile time to match.

As a simple example, you can check the length of values:

```rue
assert bytes is Bytes32;
```

After this assertion, the type of `bytes` is now `Bytes32` since it has been checked.

However, if you negate a type guard with the `!` operator or use the value in an else branch, it will revert to the `Bytes` type since there was no union that could be narrowed:

```rue
assert !(bytes is Bytes32);
```

## Subtraction

Type guards can be used to narrow the type of a union to one or more of its variants.

Let's say you have a union of structurally distinct types:

```rue
type Condition = CreateCoin | ReserveFee;
```

You can check the type, and depending on the branch the value will have the correct narrowed type:

```rue
if condition is CreateCoin {
    // The type is CreateCoin in this branch
} else {
    // The type is ReserveFee in this branch
}
```

Subtraction is the mechanism in which `CreateCoin | ReserveFee` can remove `CreateCoin` as a possibility in the else branch, narrowing it down into the opposite, which is `ReserveFee`. This should work regardless of how many variants you have in the union.

## Function Types

Rue supports [higher-order functions](https://en.wikipedia.org/wiki/Higher-order_function), which means functions can be passed around freely as values. As such, it's possible to express functions as types.

However, there's no way to know at runtime whether or not a value fits the definition of a given function type. Any value _could_ match the type, but not every value _does_ match the type.

Due to this, it is **not possible** to check if a value is a function, or to narrow union types that contain function variants. However, you _can_ include a function type inside of one you are guarding, and as long as it's compatible it will be skipped.

If a function type is used on the left hand side, you can check the type of the underlying value. It will be treated as if it were equivalent to `Any`.

## Recursive Types

When you use a type guard, the compiler emits a series of type checks in order to verify that the value on the left matches the type on the right. It skips any checks that are already implied by the type on the left as an optimization.

However, recursive checks cannot currently be emitted by the compiler. This does not mean that recursive _types_ aren't allowed, and as long as you're either checking if a static type matches a recursive one, or a recursive type matches a static one it will likely work.

The compiler will simply limit the number of iterations it will run the type check until failing, so if you try to guard `List<Bytes>` into `List<Bytes32>` you will get a compiler error.
