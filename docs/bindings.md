---
slug: /bindings
---

# Bindings

Rue is a [purely-functional](https://en.wikipedia.org/wiki/Purely_functional_programming) programming language, and doesn't directly support mutation.

Practically, this means a few things:

1. The output of a function will remain the same every time, as long as its arguments don't change
2. There is no support for mutable variables
3. A function cannot change the outer scope in any way

However, even though _mutation_ isn't supported, you can still define `let` bindings:

```rue
fn main(num: Int) -> Int {
    let squared = num * num;
    let doubled = squared * 2;
    doubled + 100
}
```

In this example, we declare two bindings to make the code more readable. These can be reused multiple times to avoid calculating the same value twice or writing duplicate code.

## Inline Bindings

You can mark a `let` binding as `inline`, which forces its value to be inserted everywhere it's referenced rather than being defined a single time and reused.

As an example, this will insert `num * num` multiple times, rather than computing it once up front:

```rue
fn main(num: Int) -> Int {
    inline let squared = num * num;
    square + squared
}
```

This should be used sparingly, since it can come with either a performance hit, an increase in compiled output size, or both.

:::tip
The compiler will automatically inline `let` bindings if they are only referenced a single time.
:::
