---
slug: /aliases
---

# Aliases

A type alias allows you to reuse complex types multiple times without having to repeat yourself.

For example:

```rue
type MathOp = fn(a: Int, b: Int) -> Int;

fn adder(a: Int, y: Int) -> Int {
    a + b
}

fn get_adder() -> MathOp {
    adder
}
```

## Recursion

You can use type aliases for recursive type definitions:

```rue
type List<T> = nil | (T, List<T>);
```

The type system should be equipped to handle recursive types like this, and they are quite useful for modeling complex CLVM values.

:::warning
There is currently nothing preventing you from making a type that _always_ references itself (without any base case or nesting):

```rue
type Value = Value;
```

This type will allow any value to be assigned to it, and some things may unexpectedly fail. A future release will likely forbid such type declarations from being created.
:::
