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
    map([1, 2, 3], fn(value: Int) => value * 2)
}
```

The types are inferred from every argument, as well as the expected return type if there is one.

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
