---
slug: /let-bindings
---

# Let Bindings

In Rue, everything is immutable. This means there isn't the traditional concept of a mutable variable whose value can be reassigned. Once a value is given to a variable, it's final unless you make a new variable.

Here's an example:

```rue
fun main() -> Int {
    let num = 42;
    num + 10
}
```

This will bind `num` to the value `42`, then add it to `10` and return the result.

:::note

This is not possible, since it's immutable:

```rue
fun main() -> Int {
    let num = 42;
    num = 34; // You can't assign to bindings.
    num + 10
}
```

:::

## What's the point?

Bindings let you prevent repetition and optimize code when a value is used more than once. It can also be used to make code clearer.

For example, we use `num` twice in this example, but it only needs to be written once, both in the code and in the compiled output:

```rue
fun main() -> Int {
    let num = 42;
    num * num
}
```

If a binding is only used once, it will be inlined as though you wrote the value directly.
