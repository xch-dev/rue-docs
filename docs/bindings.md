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

A binding must always have a value, since it can't be assigned later. The type is inferred from the value, but you can also specify it explicitly:

```rue
fn main() -> List<Int> {
    let items: List<Int> = [1, 2, 3];
    [0, ...items]
}
```

## Shadowing

You can declare a new binding with the same name as an existing one. The new binding shadows the old one for the rest of the scope, but doesn't change it:

```rue
fn main(value: Int) -> Int {
    let value = value * 2;
    let value = value + 1;
    value * value
}
```

:::tip
If you'd rather avoid shadowing in your project, you can enable the `shadowed_binding` [lint](/docs/lints.md).
:::

## Blocks

A block is a group of statements surrounded by braces, which ends in an expression. It can be used anywhere an expression is expected, and bindings declared inside of it are only visible within the block:

```rue
fn main() -> Int {
    let value = {
        let a = 34;
        a * 2
    };
    value + 1
}
```

## Inline Bindings

You can mark a `let` binding as `inline`, which forces its value to be inserted everywhere it's referenced rather than being defined a single time and reused.

As an example, this will insert `num * num` twice, rather than computing it once up front:

```rue
fn main(num: Int) -> Int {
    inline let squared = num * num;
    squared + squared
}
```

This should be used sparingly, since it can come with either a performance hit, an increase in compiled output size, or both.

:::tip
When compiling normally (not in debug mode), the compiler will automatically inline `let` bindings if they are only referenced a single time.
:::

## Unused Bindings

The compiler warns about bindings and parameters that are never used. If a binding or parameter is intentionally unused (for example, a parameter that's only there to match the layout of a solution), you can prefix its name with an underscore to silence the warning (see [Unused Code](/docs/lints.md#unused-code)):

```rue
fn main(_unused: Int, value: Int) -> Int {
    value
}
```

## Destructuring

You can destructure values (including `let` bindings, function parameters, and lambda parameters) into multiple bindings at once.

For example, if you have a pair, you can destructure the first and rest values into separate bindings:

```rue
fn main() -> Int {
    let (first, rest) = (100, 200);
    first + rest
}
```

This also works for lists (as long as the values are known to not be nil). You can use the spread operator to bind the rest of the list:

```rue
fn main() -> Int {
    let [a, b, ...rest] = [100, 200, 300, 400];
    a + b + sum(rest)
}
```

If you have a struct, you can destructure the fields by name, and rename them with a `:`:

```rue
struct Point {
    x: Int,
    y: Int,
}

fn main() -> Int {
    let { x, y: vertical } = Point { x: 100, y: 200 };
    x + vertical
}
```

In a struct pattern, a spread binding (such as `...point`) binds the whole value, so that you can still access the fields you didn't destructure:

```rue
struct Point {
    x: Int,
    y: Int,
}

fn add_x({ x, ...point }: Point) -> Int {
    x + point.y
}
```

These destructuring patterns can be combined arbitrarily:

```rue
struct Point {
    x: Int,
    y: Int,
}

fn main() -> Int {
    let ([a, b, c], { x, y }) = ([100, 200, 300], Point { x: 400, y: 500 });
    a + b + c + x + y
}
```

A spread in a list pattern must be the last item, since the length of the rest of the list isn't known.

The same patterns also bind the item of a [`for` expression](/docs/loops.md#patterns) (as in `for (a, b) in pairs`), and the value of a [`match` arm](/docs/match.md#bindings) after its type.

:::note
A destructured value is evaluated once, however many of its parts you use and however often you read them. Each part reads from that one value, so destructuring the result of a function call doesn't call it again for each part. Marking a destructuring `let` as `inline` does the opposite: the value is inserted, and evaluated again, everywhere a part is read.
:::
