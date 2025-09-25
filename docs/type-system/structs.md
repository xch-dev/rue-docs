---
slug: /structs
---

# Structs

A struct is structurally identical to a [List](/docs/type-system/pairs.md#lists), but provides more semantic type safety and a more readable way to initialize values and access fields contained within.

This is an example of a struct:

```rue
struct Point {
    x: Int,
    y: Int,
}
```

You can initialize a value with this type like so:

```rue
let point = Point {
    x: 42,
    y: 34,
};
```

And access fields on the value:

```rue
let value = point.x * point.y;
```

## Semantics

Every struct has its own semantic type id, which determines whether they can be directly assigned or if a cast is required.

A cast is required for structurally identical values when:

1. You're assigning a struct to a different struct
2. You're assigning a non-struct to a struct
3. You're assigning a struct to a non-struct

For example:

```rue
struct PointTwo {
    x: Int,
    y: Int,
}

let point = Point { x: 0, y: 0 };
let point_two = PointTwo { x: 0, y: 0 };

// This will fail since the structs are different
let value: Point = point_two;

// You can cast explicitly
let value = point_two as Point;
```

## Default Values

It can get tedious having to manually specify all of the values in a struct, when one or more of them almost always have the same initial value.

Because of this, it's possible to provide a default value for fields. When initializing a struct, if a field is omitted, its default value will be inserted in its place.

```rue
struct Point {
    x: Int = 0,
    y: Int = 0,
}
```

While the type can technically be inferred, it's often necessary to explicitly use a more broad type than the default, since in this case we want values other than `0` to be assignable to `x` and `y`.

:::note
Default values are always inlined exactly as written. If the value is expensive to compute, or would require a lot of bytes to duplicate in the output program, it should be extracted out into a constant:

```rue
const DEFAULT_NAME: Bytes = "Patricia";

struct Person {
    name: Bytes = DEFAULT_NAME,
}
```

This way, the normal inlining rules can take effect.

:::
