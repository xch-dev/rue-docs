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

## Destructuring

You can destructure values (including `let` bindings and function parameters) into multiple bindings at once.

For example, if you have a pair, you can destructure the first and rest values into separate bindings:

```rue
let (first, rest) = (100, 200);
```

This also works for lists (as long as the values are known to not be nil):

```rue
let [a, b, c] = [100, 200, 300];
```

If you have a struct, you can destructure the fields:

```rue
struct Point {
    x: Int,
    y: Int,
}

let { x, y } = Point { x: 100, y: 200 };
```

These destructuring patterns can be combined arbitrarily:

```rue
let ([a, b, c], { x, y }) = ([100, 200, 300], Point { x: 400, y: 500 });
```

:::note
When you destructure a value, it's first assigned to a temporary binding, and then that binding is referenced by each of the bindings in the destructuring pattern. Thus, if you're destructuring a non-inline variable, it's best to mark the destructured bindings as `inline` to reduce the size of the compiled program.
:::
