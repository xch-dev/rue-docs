---
slug: /generics
---

# Generics

Generics let you write functions and types that work with any type, instead of writing a separate version for each one.

## Generic Functions

A generic function declares its type parameters in angle brackets after its name, and can use them in its parameters, return type, and body:

```rue
fn identity<T>(value: T) -> T {
    value
}
```

When you call a generic function, the compiler infers the type parameters from the arguments you pass:

```rue ignore
fn main() -> Int {
    identity(42)
}
```

Here's a more useful example, which applies a function to every item in a list:

```rue
fn map<T, U>(list: List<T>, function: fn(value: T) -> U) -> List<U> {
    if list is nil {
        return nil;
    }

    [function(list.first), ...map(list.rest, function)]
}

fn main() -> List<Int> {
    map([1, 2, 3], fn(value) => value * 2)
}
```

The types are inferred from every argument, as well as the expected return type if there is one. Here, `T` is `Int` because of the list, which is what gives the lambda's `value` its type, and `U` is `Int` because of what the lambda returns.

## Inference

### Literals

A literal has a type of its own, such as `5`, which only that value has. A type parameter that's inferred from a literal type is widened to the literal's base type, since that's almost always what's meant:

```rue
fn identity<T>(value: T) -> T {
    value
}

fn either<T>(condition: Bool, first: T, second: T) -> T {
    if condition {
        first
    } else {
        second
    }
}

fn main(condition: Bool) -> Int {
    // `T` is `Int`, rather than `5`
    let number = identity(5);

    // `T` is `Int`, rather than `5 | 6`
    let choice = either(condition, 5, 6);

    number + choice
}
```

The literal type is kept if that's what is expected of the call:

```rue
fn identity<T>(value: T) -> T {
    value
}

fn main() -> (5, Int) {
    let five: 5 = identity(5);
    let number = identity(5);
    (five, number)
}
```

This is for the type that the type parameter itself is inferred from, wherever that is in the argument: `T` is `Int` for `[5, 6]` passed as a `List<T>`. If the type parameter stands for a whole pair or list, the literals inside of it keep their types, which can still be assigned to the wider type:

```rue
fn identity<T>(value: T) -> T {
    value
}

fn main() -> Int {
    // `T` is `(5, "x")`
    let pair = identity((5, "x"));
    let wide: (Int, String) = pair;
    wide.first
}
```

### Lambda Parameters

A lambda that's passed to a generic function doesn't need types for its parameters. They come from the function type that the parameter expects, once the other arguments have given its type parameters a type. It doesn't matter which argument comes first, or whether the lambda is an argument itself or part of one, such as the first item of a pair:

```rue
fn map<T, U>(list: List<T>, function: fn(value: T) -> U) -> List<U> {
    if list is nil {
        return nil;
    }

    [function(list.first), ...map(list.rest, function)]
}

fn apply_pair<T, U>(pair: (fn(value: T) -> U, T)) -> U {
    pair.first(pair.rest)
}

fn main() -> (List<Int>, Int) {
    // `x` is an `Int` because of the list
    let list = map([1, 2], fn(x) => x + 1);

    // `x` is an `Int` because of the `5` after it
    let number = apply_pair((fn(x) => x + 1, 5));

    (list, number)
}
```

A lambda that nothing expects a function type of has nothing to infer its parameters from, so they need types:

```rue error
fn main() -> Int {
    // Type of parameter cannot be inferred, it must be specified explicitly
    let increment = fn(x) => x + 1;
    increment(1)
}
```

### Accumulators

A function like `fold` takes an initial value and a lambda that returns the next one, both of the same type parameter. The lambda's untyped accumulator is typed from the initial value and from what the lambda returns, so it can be a pair that's built up, or a list that starts out as `nil`:

```rue
fn fold<T, A>(list: List<T>, initial: A, function: fn(accumulator: A, item: T) -> A) -> A {
    if list is nil {
        return initial;
    }

    fold(list.rest, function(initial, list.first), function)
}

fn main(numbers: List<Int>) -> ((Int, Int), List<Int>) {
    // `acc` is an `(Int, Int)`, the sum and the count
    let totals = fold(numbers, (0, 0), fn(acc, x) => (acc.first + x, acc.rest + 1));

    // `acc` is a `List<Int>`, although it starts as `nil`
    let reversed = fold(numbers, nil, fn(acc, x) => [x, ...acc]);

    (totals, reversed)
}
```

This is for the accumulator as a whole. A `nil` inside of a pair, such as `(0, nil)` for a count and a list, isn't taken to be a list, so the lambda's accumulator needs a type there (`fn(acc: (Int, List<Int>), x) => ...`).

### Arguments Without Values

If the arguments hold no value of a type parameter, as an empty list holds no items, it's inferred as `Never`. That's a type with no values, which can be assigned to any type, so the result fits wherever it's used:

```rue
fn length<T>(list: List<T>) -> Int {
    if list is nil {
        0
    } else {
        1 + length(list.rest)
    }
}

fn reverse<T>(list: List<T>) -> List<T> {
    reverse_onto(list, nil)
}

fn reverse_onto<T>(list: List<T>, result: List<T>) -> List<T> {
    if list is nil {
        result
    } else {
        reverse_onto(list.rest, [list.first, ...result])
    }
}

fn main() -> List<Bytes> {
    // `T` is `Never`, and the length is still an `Int`
    let count = length(nil);

    // A `List<Never>`, which can be used as a list of any type
    let items = reverse([]);

    if count == 0 {
        ["hello", ...items]
    } else {
        items
    }
}
```

This is only for a type parameter that an argument's value could hold, as in `List<T>`. One that's only in the return type, or that only a lambda's untyped parameter would use (`map([], fn(x) => x)`), has nothing to be inferred from. It comes from the expected type or a type on the lambda's parameter, or is written [explicitly](#explicit-arguments).

### Union Types

The type that's expected of a call can be a union. A type parameter is inferred from the members that the call's result can be, so a function that returns one member of a union doesn't need the other member's type parameters written out:

```rue
struct Ok<T> {
    value: T,
}

struct Err<E> {
    error: E,
}

type Result<T, E> = Ok<T> | Err<E>;

fn ok<T, E>(value: T) -> Result<T, E> {
    Ok::<T> { value }
}

fn main() -> Result<Int, String> {
    // `E` is `String` because of the return type
    ok(1)
}
```

### Explicit Arguments

If a type parameter can't be inferred from the arguments or the expected type, you need to specify the generic arguments explicitly with `::<...>` (known as the turbofish syntax):

```rue
fn empty<T>() -> List<T> {
    nil
}

fn main() -> List<Bytes> {
    let items = empty::<Bytes>();
    ["hello", ...items]
}
```

You can use `_` as a placeholder for any argument that should still be inferred:

```rue
fn wrap<A, B>(value: A) -> (A, B | nil) {
    (value, nil)
}

fn main() -> Int {
    let pair = wrap::<_, Bytes>(1);
    pair.first + 1
}
```

These are the places where generic arguments are needed:

- A type parameter that's only in the return type, with no expected type, as in `empty::<Bytes>()` above.
- The branches of an `if` or `match` don't give each other a type, so a call in one branch isn't inferred from the value of another. Give the call its arguments, or the binding a type.
- A generic struct or enum variant that's initialized always needs its arguments. They aren't inferred from the fields, and the compiler says where they go. A variant without fields, such as `Option::None`, takes none, and gets its type from where it's used.
- A generic function that's passed as a value, when the function type it's passed for has one of the called function's type parameters in a parameter, and no other argument or expected type gives it a type. The arguments can be written on either function: `same(identity::<Int>)` or `same::<Int>(identity)`.

```rue
struct Box<T> {
    value: T,
}

enum Option<T> {
    None,
    Some { value: T },
}

fn empty<T>() -> List<T> {
    nil
}

fn identity<T>(value: T) -> T {
    value
}

fn same<T>(function: fn(value: T) -> T) -> fn(value: T) -> T {
    function
}

fn main(condition: Bool, n: Int) -> (List<Int>, (List<Int>, Int)) {
    // A branch, with the call's arguments or with a type for the binding
    let written = if condition {
        [1]
    } else {
        empty::<Int>()
    };
    let annotated: List<Int> = if condition {
        [1]
    } else {
        empty()
    };

    // Initializers
    let boxed = Box::<Int> { value: 5 };
    let option = Option::Some::<Int> { value: n };

    // A generic function as a value
    let function = same(identity::<Int>);

    (written, (annotated, function(boxed.value + option.value)))
}
```

## Generic Types

[Structs](/docs/type-system/structs.md#generic-structs) and [type aliases](/docs/type-system/aliases.md#generic-aliases) can also have type parameters:

```rue
struct Box<T> {
    value: T,
}

type Pair<T> = (T, T);
```

When you use a generic type, you need to provide its arguments, such as `Box<Int>` or `Pair<Bytes32>`. The builtin `List<T>` and `AlternatingList<T, U>` types are generic type aliases.

## Generic Function Types

A [function type](/docs/functions.md#function-types) can have its own type parameters, which means the function must work for any type:

```rue
fn identity<T>(value: T) -> T {
    value
}

fn twice<T>(function: fn<U>(value: U) -> U, value: T) -> T {
    function(function(value))
}

fn main() -> Int {
    twice(identity, 42)
}
```

A generic function can also be assigned to a non-generic function type, as long as it's compatible once its type parameters are filled in. For example, `identity` can be used as a `fn(value: Int) -> Int`.

Lambdas can be generic as well, such as `fn<U>(value: U): U => value`.

## Limitations

A generic type parameter could be any type at runtime, so values of a generic type can't be checked with a [type guard](/docs/type-system/guards.md#generic-types), and you can't access fields on them. You can still pass them around, store them in pairs and structs, and return them.
