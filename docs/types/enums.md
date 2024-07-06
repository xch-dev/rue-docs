---
slug: /enums
---

# Enums

An enum allows you to define a type which can contain multiple variants, each with their own discriminator value, and optionally fields.

This is an example of an enum without fields:

```rue
enum Mode {
    Locked,
    Unlocked,
}

fun main() -> Int {
    // By default, the type is `Mode::Locked`
    let locked = Mode::Locked;

    // Let's generalize that to `Mode`
    let mode: Mode = locked;

    // Now we can check the type
    if !(mode is Mode::Locked) {
        raise "This isn't possible.";
    }

    // Lastly, we can cast to an `Int`
    mode as Int
}
```

## Discriminants

By default, the first discriminant is `0`, and each one after that increments by `1`.

However, you can also explicitly set the discriminant:

```rue
enum Mode {
    Locked = 5,
    Unlocked = 10,
}
```

## Fields

If any of the enum variants have fields, all variants of the enum will be represented as a list, with the discriminant being the first item.

Here is an example:

```rue
enum Value {
    None,
    Scalar {
        num: Int,
    },
    Point {
        x: Int,
        y: Int,
    },
}

fun main() -> Int {
    number(Value::Point { x: 42, y: 34 })
}

fun number(value: Value) -> Int {
    if value is Value::None {
        return 0;
    }

    if value is Value::Scalar {
        return value.num;
    }

    assume value is Value::Point;
    value.x + value.y
}
```

:::note
There is currently no way to do pattern matching, chain if statements, or narrow the enum variants down incrementally. However, these are planned features.
:::
