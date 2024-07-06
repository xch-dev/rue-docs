---
slug: /constants
---

# Constants

A constant is similar to a let binding. The difference is that it can be defined outside of a function, as a standalone item. Therefore, the order doesn't matter, but it can only reference other items within the same scope, rather than statements like let bindings.

Here is an example:

```rue
const TWO: Int = 2;

fun main() -> Int {
    42 * TWO
}
```

## Inline Constants

When you mark a constant as inline, it will be inserted wherever it's referenced rather than being defined within the compiled output only a single time. This is typically not a good idea to do unless the constant's value is really short and it's more efficient to inline it. Benchmarking would be required to determine this.

An inline constant can be defined and used in the same way:

```rue
inline const TWO: Int = 2;

fun main() -> Int {
    42 * TWO
}
```

## Circular References

Constants must not reference themselves, either directly or indirectly. If you find yourself needing to do this for some reason, consider writing a function instead.

For example, this is clearly impossible:

```rue
const NUM: Int = NUM;
```

But this is also circular:

```rue
const FIRST: Int = SECOND;
const SECOND: Int = FIRST;
```
