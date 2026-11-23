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

The types are inferred from every argument, as well as the expected type of the call if there is one. Here, `T` is inferred as `Int` from the list, which then gives the lambda's `value` parameter its type, so it doesn't need to be written.

### Inference

Inference works through most of the ways you'd pass values to a generic function, and gives the same types as writing the generic arguments out would:

- Lambdas without parameter types, as arguments or inside of pairs and lists that are passed as arguments.
- Generic functions passed as arguments, such as `apply(42, duplicate)` below, where `duplicate` is itself generic.
- Recursive calls to the function being declared.
- The expected type, including [literal types](/docs/type-system/atoms.md#literal-types) and unions, such as `let five: 5 = apply(5, fn(value) => value);`, or a function whose branches return different members of a union.

```rue
fn fold<T, A>(list: List<T>, initial: A, f: fn(acc: A, item: T) -> A) -> A {
    if list is nil {
        return initial;
    }

    fold(list.rest, f(initial, list.first), f)
}

fn apply<T, U>(value: T, function: fn(value: T) -> U) -> U {
    function(value)
}

fn duplicate<T>(value: T) -> (T, T) {
    (value, value)
}

test fn inference() {
    let total = fold([1, 2, 3], 0, fn(acc, item) => acc + item);
    assert total == 6;

    let reversed = fold([1, 2, 3], nil, fn(acc, item) => (item, acc));
    assert reversed is (Int, List<Int>) && reversed.first == 3;

    let pair = apply(42, duplicate);
    assert pair.first + pair.rest == 84;

    let five: 5 = apply(5, fn(value) => value);
    assert five == 5;
}
```

In the second call to `fold`, the accumulator starts as `nil`, and the lambda adds pairs to it, so `A` is inferred as the list type `nil | (Int, List<Int>)` that covers both.

If a type parameter only appears where the arguments have no values of it, it's inferred as [`Never`](/docs/type-system/atoms.md#never). For example, `nil` is a `List<T>` for any `T`, so `length(nil)` compiles without saying what the list would contain.

### Explicit Arguments

If a type parameter can't be inferred from the arguments or the expected type, such as one that only appears in the return type, you need to specify the generic arguments explicitly with `::<...>` (known as the turbofish syntax). Otherwise, the call is an error such as "Cannot infer generic `T` for `empty`":

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

A type parameter is never inferred as another function's type parameter, which would leave it unbound outside of that function. For example, with `fn apply2<T>(f: fn<U>(x: U) -> T) -> T`, the call `apply2(identity)` would need `T` to be `identity`'s own type parameter, so it's rejected (with "Cannot infer generic `T` for `apply2`", or an error that the function types are incompatible when something else fixes `T`), and specifying `T` explicitly doesn't help either, since `identity` doesn't return a `T` for every input.

The generic arguments of a [struct](/docs/type-system/structs.md#generic-structs) or [enum variant](/docs/type-system/enums.md#generic-enums) initializer aren't inferred from its fields, so they need to be written explicitly.
