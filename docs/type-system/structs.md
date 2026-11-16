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

```rue ignore
fn main() -> Point {
    Point { x: 42, y: 34 }
}
```

If you have a binding with the same name as a field, you can use the shorthand syntax:

```rue ignore
fn point(x: Int, y: Int) -> Point {
    Point { x, y }
}
```

And access fields on the value:

```rue ignore
fn area(point: Point) -> Int {
    point.x * point.y
}
```

At runtime, the `Point` above is the list `(x y)`, or `(x . (y . nil))`.

## Semantics

Every struct has its own semantic type, which determines whether they can be directly assigned or if a cast is required.

A cast is required for structurally identical values when:

1. You're assigning a struct to a different struct
2. You're assigning a non-struct to a struct
3. You're assigning a struct to a non-struct (other than `Any`)

For example:

```rue
struct Point {
    x: Int,
    y: Int,
}

struct Vector {
    x: Int,
    y: Int,
}

fn main(vector: Vector) -> Point {
    // This would fail since the structs are different
    // let point: Point = vector;

    // You can cast explicitly instead
    vector as Point
}
```

## Default Values

It can get tedious having to manually specify all of the values in a struct, when one or more of them almost always have the same initial value.

Because of this, it's possible to provide a default value for fields. When initializing a struct, if a field is omitted, its default value will be inserted in its place.

```rue
struct Point {
    x: Int = 0,
    y: Int = 0,
}

fn main() -> Point {
    Point { y: 42 }
}
```

A default value can refer to constants, functions, and types, even if they are declared later in the file.

If you leave out the type of a field with a default value, its type is inferred from the value. Since the type of a literal is the [literal type](/docs/type-system/atoms.md#literal-types) itself, this is a useful way to declare a field that always has the same value, such as the opcode of a condition:

```rue
struct ReserveFee {
    opcode = 52,
    amount: Int,
}
```

Here, the `opcode` field has the type `52`, so it can't be set to anything else, and it can be used to tell the struct apart from other structs in a [type guard](/docs/type-system/guards.md).

When the field could have other values, you should specify a broader type explicitly, since in the `Point` example we want values other than `0` to be assignable to `x` and `y`.

:::note
Default values are always inlined exactly as written. If the value is expensive to compute, or would require a lot of bytes to duplicate in the output program, it should be extracted out into a constant:

```rue
const DEFAULT_NAME: String = "Patricia";

struct Person {
    name: String = DEFAULT_NAME,
}
```

This way, the normal inlining rules can take effect.

:::

## Spread Fields

The last field of a struct can be marked with the spread operator (`...`). Instead of being the last item of a nil-terminated list, the field is the rest of the list itself.

This is commonly used when a struct has a variable number of trailing values:

```rue
struct Payment {
    puzzle_hash: Bytes32,
    amount: Int,
    ...memos: List<Bytes>,
}

fn main(puzzle_hash: Bytes32) -> Payment {
    Payment { puzzle_hash, amount: 1, memos: ["hint"] }
}
```

At runtime, this is the list `(puzzle_hash amount "hint")`, rather than `(puzzle_hash amount ("hint"))`.

It can also be used to make one struct extend another, or to match a value that isn't a nil-terminated list at all. For example, this struct is a chain of pairs, where the rest of each pair is either the next node or `nil`:

```rue
struct Node {
    value: Int,
    ...next: Node | nil,
}
```

## Generic Structs

A struct can have [generic](/docs/type-system/generics.md) type parameters:

```rue
struct Box<T> {
    value: T,
    count: Int = 1,
}

fn main() -> Int {
    let box = Box::<Int> { value: 5 };
    box.value + box.count
}
```

When initializing a generic struct, the generic arguments must be specified explicitly with `::<...>`.

## Unused Fields

If a struct is only ever read by its fields, the compiler warns about any fields that are never read. When a field is only needed so that the struct matches the layout of a value, you can prefix its name with an underscore to silence the warning:

```rue
struct LineageProof {
    parent_parent_coin_info: Bytes32,
    _parent_inner_puzzle_hash: Bytes32,
    parent_amount: Int,
}
```
