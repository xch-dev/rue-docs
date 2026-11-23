---
slug: /enums
---

# Enums

An enum is a type whose values are one of a fixed set of variants. Each variant is a [struct](/docs/type-system/structs.md) with a discriminant, which is a number that tells it apart from the other variants at runtime.

This is an example of an enum:

```rue
enum Shape {
    Empty,
    Circle { radius: Int },
    Rect { width: Int, height: Int },
}
```

A variant is written with the name of the enum, followed by `::` and the name of the variant. A variant with fields is initialized like a struct, and a variant without fields is written on its own:

```rue ignore
fn main(radius: Int) -> List<Shape> {
    [Shape::Empty, Shape::Circle { radius }, Shape::Rect { width: 2, height: 3 }]
}
```

The enum itself is the [union](/docs/type-system/unions.md) of its variants, and each variant is also a type of its own, such as `Shape::Circle`. Before you can read the fields of a `Shape`, you have to narrow it to one of its variants, with a [type guard](/docs/type-system/guards.md) or a [`match`](/docs/match.md):

```rue
enum Shape {
    Empty,
    Circle { radius: Int },
    Rect { width: Int, height: Int },
}

fn area(shape: Shape) -> Int {
    match shape {
        Shape::Empty => 0,
        Shape::Circle { radius } => 3 * radius * radius,
        Shape::Rect { width, height } => width * height,
    }
}

test fn areas() {
    assert area(Shape::Empty) == 0;
    assert area(Shape::Circle { radius: 2 }) == 12;
    assert area(Shape::Rect { width: 2, height: 3 }) == 6;
}
```

Since the variants belong to the enum, their names don't clash with other items. An enum can have a variant named `String` or `Bool`, for example, and it's still a different type from the `String` and `Bool` atom types.

## Discriminants

By default, the first variant's discriminant is `0`, and each variant after it is one more than the one before. You can also give a variant its discriminant explicitly, after an `=`, and the variants after it count up from there:

```rue
enum Status {
    Pending,
    Active,
    Closed = 10,
    Archived,
}

test fn discriminants() {
    assert Status::Pending as Int == 0;
    assert Status::Active as Int == 1;
    assert Status::Closed as Int == 10;
    assert Status::Archived as Int == 11;
}
```

An explicit discriminant goes before the fields of a variant, such as `CreateCoin = 51 { ... }`. It must be an integer literal, which can be negative or written in binary or octal, but not a hex literal or a constant.

Two variants of the same enum can't have the same discriminant. This is an error even when the duplicate comes from counting up after an explicit discriminant, such as `One = 1, Zero = 0, AlsoOne`.

## Representation

How the variants are represented at runtime depends on whether any of them have fields.

### Without Fields

If none of the variants have fields, each variant is only its discriminant, which is an atom. For example, `Status::Closed` above is the atom `10`.

This makes an enum without fields useful for a set of named values, like the modes of a puzzle. Its values can be cast to `Int` with `as`, and compared with `==` and `!=`:

```rue
enum Mode {
    Locked,
    Unlocked,
    Open = 5,
}

fn can_spend(mode: Mode) -> Bool {
    mode != Mode::Locked
}

test fn modes() {
    assert can_spend(Mode::Open);
    assert !can_spend(Mode::Locked);
    assert Mode::Open as Int == 5;
}
```

Each enum has its own [semantic type](/docs/type-system/structs.md#semantics), so assigning a variant to an `Int` requires a cast, and only variants of the same enum can be compared with each other. Other operators, such as `<` and `+`, don't work on enums.

An `Int` can't be cast to an enum directly, since not every number is one of its variants. Check it with a type guard first, and then cast it:

```rue
enum Mode {
    Locked,
    Unlocked,
    Open = 5,
}

fn parse_mode(value: Int) -> Mode {
    assert value is Mode;
    value as Mode
}

test fn parse() {
    assert parse_mode(5) == Mode::Open;
}
```

### With Fields

If any of the variants have fields, every variant is a list that starts with its discriminant, followed by its fields, in the same way as a struct. For the `Shape` enum above:

| Value                                 | Runtime value |
| ------------------------------------- | ------------- |
| `Shape::Empty`                        | `(0)`         |
| `Shape::Circle { radius: 3 }`         | `(1 3)`       |
| `Shape::Rect { width: 2, height: 4 }` | `(2 2 4)`     |

A variant without fields in an enum like this is still a list, so it can also be written with empty braces, as in `Shape::Empty {}`. A variant that's declared with empty braces, such as `Done {}`, counts as having fields: it makes every variant of its enum a list, and it's always written with the braces. Values of these enums can't be compared with `==`, or cast to `Int`. Use a type guard or a `match` to find out which variant a value is.

The discriminant isn't a field, so it can't be read with `.`. If you need the number itself, you can cast the value to a pair and read the first part:

```rue
enum Shape {
    Empty,
    Circle { radius: Int },
    Rect { width: Int, height: Int },
}

fn discriminant(shape: Shape) -> Int {
    let (discriminant, _) = shape as (Int, Any);
    discriminant
}

test fn discriminants() {
    assert discriminant(Shape::Rect { width: 2, height: 3 }) == 2;
}
```

## Variant Fields

The fields of a variant work the same way as the fields of a struct. They can have [default values](/docs/type-system/structs.md#default-values), fields with a literal type and default value act as constants, and the last field can be a [spread field](/docs/type-system/structs.md#spread-fields).

The conditions in the [standard library](/docs/standard-library.md#conditions) are an enum like this, where each discriminant is a condition's opcode:

```rue
enum Output {
    CreateCoin = 51 { puzzle_hash: Bytes32, amount: Int, ...memos: List<Bytes> = nil },
    Remark = 1 { kind = "note", ...rest: Any },
}

test fn outputs() {
    let coin = Output::CreateCoin { puzzle_hash: sha256("puzzle"), amount: 1 };
    let remark = Output::Remark { rest: 42 };

    assert coin.memos is nil;
    assert remark.kind == "note";
    assert tree_hash(remark) == tree_hash((1, ("note", 42)));
}
```

The [struct update syntax](/docs/type-system/structs.md#struct-update) works with variants too, as long as the value being spread is narrowed to the same variant:

```rue
enum Shape {
    Circle { radius: Int },
    Rect { width: Int, height: Int },
}

fn widen(shape: Shape) -> Shape {
    match shape {
        Shape::Circle => Shape::Circle { radius: shape.radius * 2 },
        Shape::Rect => Shape::Rect { ...shape, width: shape.width * 2 },
    }
}
```

## Generic Enums

An enum can have [generic](/docs/type-system/generics.md) type parameters, which its variants can use in their fields:

```rue
enum Option<T> {
    None,
    Some { value: T },
}

fn unwrap_or(option: Option<Int>, default: Int) -> Int {
    match option {
        Option::None<Int> => default,
        Option::Some<Int> => option.value,
    }
}

test fn options() {
    assert unwrap_or(Option::Some::<Int> { value: 5 }, 0) == 5;
    assert unwrap_or(Option::None, 0) == 0;
}
```

As with [generic structs](/docs/type-system/structs.md#generic-structs), a variant with fields is initialized with its generic arguments written explicitly, as in `Option::Some::<Int> { value: 5 }`. A variant without fields never needs them.

When narrowing a generic enum with `is` or `match`, the variant is written with its generic arguments too, as in `Option::Some<Int>`.

An enum can also refer to itself in its variants' fields, such as a linked list whose `Cons` variant has a `tail: Chain<T>`. As with [recursive aliases](/docs/type-system/aliases.md#recursion), the generic arguments can't grow as they refer back, so `tail: Chain<(T, T)>` is an error.

## Type Guards and Matching

A type guard or `match` on an enum value compares its discriminant, so narrowing a `Shape` to `Shape::Circle` is a single comparison:

```rue
enum Shape {
    Empty,
    Circle { radius: Int },
    Rect { width: Int, height: Int },
}

fn radius(shape: Shape) -> Int {
    if shape is Shape::Circle {
        shape.radius
    } else {
        0
    }
}
```

A `match` on an enum must handle every variant, or have a `_` arm for the rest. If a variant is added later, every `match` that doesn't handle it is an error until it does. See [Match](/docs/match.md) for the patterns that can be used in the arms.

Checking a value of another type, such as `Any`, against an enum checks its structure as well, in the same way as a struct. See [What's Checked](/docs/type-system/guards.md#whats-checked).

## Modules and Imports

An enum can be exported like any other item, with `export enum`. Its variants can also be imported by name, so they can be used without the enum's name in front of them:

```rue
import Shape::{Circle, Empty};

enum Shape {
    Empty,
    Circle { radius: Int },
}

fn main(radius: Int) -> List<Shape> {
    [Empty, Circle { radius }]
}
```

A glob import such as `import Shape::*;` imports every variant, and `export Shape::*;` re-exports them. The standard library re-exports the variants of `Condition` this way, which is why `CreateCoin { ... }` and `Condition::CreateCoin { ... }` are the same.

## Lints

If an enum is never used, the `unused_enum` lint warns about it. The names of enums and their variants should be in `UpperCamelCase`, which the `naming_convention` lint checks. See [Lints](/docs/lints.md).

## Gotchas

- In an enum without fields, the first variant's discriminant is `0` by default, which is the same value as `nil`, `false` and `""` at runtime. So a union like `Mode | nil` can't be told apart by a type guard or `match`, and the `indistinguishable_union_member` lint warns about it. Give the first variant a discriminant other than `0` if this matters. See [Overlapping Values](/docs/type-system/guards.md#overlapping-values).
- Narrowing an `Int` with `value is Mode` leaves it an `Int` (narrowed to the discriminants of the enum), since a type guard keeps the semantic type of the value it narrows. Cast it with `as Mode` afterward, as in the example above.
- Adding a field to any variant changes the representation of every variant, from an atom to a list. Programs that store or compare these values, such as in the curried arguments of a puzzle, change too.
- An enum's name is used both as a type and as the namespace of its variants, so it can't share its name with a struct, type alias or module.
