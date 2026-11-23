---
slug: /match
---

# Match

A `match` expression picks one of several arms by the type of a value. Each arm starts with a type, and the first arm whose type the value matches is the one that's evaluated:

```rue
enum Shape {
    Empty,
    Circle { radius: Int },
    Rect { width: Int, height: Int },
}

fn area(shape: Shape) -> Int {
    match shape {
        Shape::Empty => 0,
        Shape::Circle => 3 * shape.radius * shape.radius,
        Shape::Rect => shape.width * shape.height,
    }
}
```

This is the same as a chain of `if` expressions with [type guards](/docs/type-system/guards.md), but shorter, and the compiler checks that every possible value is handled. Matching on the variants of an [enum](/docs/type-system/enums.md) like this is the most common use of `match`, but it works on any value whose type can be checked at runtime.

## Patterns

The pattern of an arm is a type, the same as the type on the right side of `is`. It can be:

- A struct, or a variant of an enum, such as `Shape::Circle` or `CreateCoin`.
- A literal, such as `0`, `"yes"`, `true` or `nil`.
- An atom type, such as `Bytes32`, `PublicKey` or `Int`.
- A pair or list type, such as `(Int, Int)` or `(Bytes32, List<Int>)`.
- A union of any of these, such as `Shape::Circle | Shape::Rect`, or an alias for one.
- `_`, which matches every value that the arms before it haven't handled.

For example, you can match an `Int` by its value, using `_` for every other value:

```rue
fn name(value: Int) -> String {
    match value {
        0 => "zero",
        1 => "one",
        _ => "many",
    }
}
```

The arms are checked in order, and the checks are the same ones a type guard would make. A pattern that doesn't overlap the type of the value at all is an error, as it is for `is`.

## Narrowing

Inside of an arm, the value is narrowed to the arm's type, the same way a type guard narrows it in an `if` branch. Each arm after it only sees the values that the earlier arms didn't handle, and `_` sees everything that's left:

```rue
fn describe(value: Bytes32 | (Int, Int) | nil) -> Int {
    match value {
        nil => 0,
        (Int, Int) => value.first + value.rest,
        // The only type that's left is `Bytes32`
        _ => value.length,
    }
}
```

Narrowing works on fields as well, such as `match order.payment` or `match pair.first`, as long as the field is accessed through the same value inside of the arm.

If the value being matched is an expression that isn't a name or a field, such as a function call, it's only evaluated once, and each arm uses the same result. To use the narrowed value in that case, name it in the arm, as described in [Bindings](#bindings).

## Exhaustiveness

A `match` must handle every possible value of the type it's matching on. If it doesn't, the compiler lists what's missing:

```rue error
struct A {
    kind = 1,
}

struct B {
    kind = 2,
}

struct C {
    kind = 3,
}

fn main(value: A | B | C) -> Int {
    // Match on `A | B | C` is not exhaustive, since it doesn't handle `B` and `C`
    match value {
        A => 1,
    }
}
```

Literal patterns never handle every value of a type like `Int`, `Bytes` or `String`, so a match on one of those needs a `_` arm (or an arm for the whole type) at the end.

The type of a `match` expression is the union of the types of its arms.

### Pairs

Matching on a pair handles each combination of its parts separately, so a set of arms that covers every combination is exhaustive:

```rue
enum Side {
    Buy,
    Sell,
}

fn crosses(orders: (Side, Side)) -> Bool {
    match orders {
        (Side::Buy, Side::Sell) => true,
        (Side::Sell, Side::Buy) => true,
        (Side::Buy, Side::Buy) => false,
        (Side::Sell, Side::Sell) => false,
    }
}
```

The same goes for a pair whose parts are any other unions, such as `(Circle | Square, Circle | Square)`, and for a pair whose first or rest is matched separately, such as the arms `(Circle, Int)` and `(Square, Int)` on `(Circle | Square, Int)`.

## Bindings

An arm's type can be followed by a binding, which names or [destructures](/docs/bindings.md#destructuring) the value once it's been narrowed to that type. A struct binding comes right after the type, and any other binding comes after `as`:

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

fn sum(value: (Int, Int) | Bytes32) -> Int {
    match value {
        (Int, Int) as (first, rest) => first + rest,
        Bytes32 as hash => hash.length,
    }
}
```

The binding is the same as a `let` at the start of the arm, so it doesn't change which values the arm matches. Each arm has its own bindings, which aren't in scope in the other arms or after the `match`.

A list can be destructured once the arms before it have handled `nil`, since a list that might be empty has no first item:

```rue
fn total(values: List<Int>) -> Int {
    match values {
        nil => 0,
        List<Int> as [first, ...rest] => first + total(rest),
    }
}
```

The `_` arm can have a binding too, such as `_ as other` or `_ { side }`, which destructures whatever is left.

## Arm Conditions

An arm can have a condition, written with `if` after its type and binding. The arm is only taken for the values of its type that the condition is true for, and the arms after it still see every value that it does:

```rue
enum Shape {
    Empty,
    Circle { radius: Int },
    Rect { width: Int, height: Int },
}

fn size(shape: Shape) -> Int {
    match shape {
        Shape::Circle { radius } if radius > 10 => radius * 2,
        Shape::Circle { radius } => radius,
        Shape::Rect { width, height } if width == height => width,
        _ => 0,
    }
}
```

The condition sees the value narrowed to the arm's type, and a type guard in the condition narrows it further inside of the arm, like it would in an `if`. Since a condition might be false, an arm with one never counts towards exhaustiveness, so an arm without a condition has to handle what's left. If none does, the error says which arm has the condition.

## Arm Values

The arms are separated by commas. An arm whose value is a block, an `if` or a `match` ends at its closing brace, so the comma after it can be left out. A block arm can contain statements, and can `raise`:

```rue
fn checked(value: Bytes32 | (Int, Int)) -> Int {
    match value {
        Bytes32 => {
            raise "expected a pair";
        }
        (Int, Int) => {
            assert value.first < value.rest;
            value.rest - value.first
        }
    }
}
```

## Match Statement

A `match` can also be used as a statement anywhere in a block, the same way as an [`if` statement](/docs/control-flow.md#if-statement). Each arm is a block, which can `return`, `raise`, or fall through to the rest of the block:

```rue
enum Payment {
    Free,
    Card { amount: Int },
    Refund { amount: Int },
}

fn charge(payment: Payment) -> Int {
    match payment {
        Payment::Free => {
            return 0;
        }
        Payment::Refund => {
            raise "refunds can't be charged";
        }
        Payment::Card => {
            assert payment.amount > 0;
        }
    }

    // Only `Payment::Card` falls through, so the type is narrowed to it
    payment.amount
}
```

The rest of the block only sees the values of the arms that fall through to it, so the value is narrowed after the statement. If every arm returns or raises, the statement ends the block, and the `unreachable_code` lint reports any code after it.

The arms of a `match` statement can't be values, since they aren't used. A `match` that is the last expression of a function body can mix the two, with some arms that `return` and others that are the function's value.

## Inline Match

Like [`inline if`](/docs/control-flow.md#inline-if), an `inline match` evaluates every arm up front, and picks the result of the one that matches. This avoids wrapping each arm in its own program, which is smaller and cheaper when the arms are simple values:

```rue
fn fee(speed: Int) -> Int {
    inline match speed {
        0 => 10,
        1 => 100,
        _ => 1000,
    }
}
```

Since every arm is evaluated, the arms don't narrow the value, although the match still has to be exhaustive. If an arm can raise, it raises even when it isn't the one that matches, which the `inline_match_may_raise` [lint](/docs/lints.md) warns about.

## Lints

These [lints](/docs/lints.md) report arms that probably don't do what was intended:

- `unreachable_match_arm` reports an arm that's never taken, since the arms before it already handle every value it matches.
- `indistinguishable_match_arm` reports an arm whose check also lets through other members of the type, since they can't be told apart at runtime. For example, a `nil` arm on `Bool | nil` also takes `false`, since they're the same value.
- `inline_match_may_raise` reports an `inline match` with an arm that can raise.
- `redundant_match_arm_as` reports a struct binding written after `as`, such as `Point as { x, y }`, which can be written as `Point { x, y }`.

## Limitations

The same types that can't be used in a [type guard](/docs/type-system/guards.md#limitations) can't be used as a pattern. In particular, an arm can't check for a generic type, and a `match` can't tell a function value apart from anything else, since functions are represented differently in debug and release builds. This includes a `nil` arm on `(fn() -> Int) | nil`, since checking for `nil` would have to look at the function:

```rue error
fn call(callback: (fn() -> Int) | nil) -> Int {
    match callback {
        // Cannot check if value is a function at runtime
        nil => 0,
        _ => 1,
    }
}
```

Values that have the same representation at runtime, such as `nil`, `0`, `false` and `""`, can't be told apart either, so they're handled by the first arm that matches any of them. See [Overlapping Values](/docs/type-system/guards.md#overlapping-values).
