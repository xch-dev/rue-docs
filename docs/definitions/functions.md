---
slug: /functions
---

# Functions

A function allows you to separate code, reuse it in multiple places, and use recursion to repeat things multiple times.

Here is a simple function example:

```rue
fun main() -> Int {
    square(42)
}

fun square(num: Int) -> Int {
    num * num
}
```

This will square the value `42` and return the result.

## Inline Functions

If a function is concise and you don't want the additional overhead of the function call, you can define an inline function instead. This will replace function calls with the body directly, instead of defining the function and referencing it.

For example, in this example the function body is simple enough that it makes sense to inline it:

```rue
fun main() -> Int {
    double(100)
}

inline fun double(num: Int) -> Int {
    num * 2
}
```

This is the exact same as writing the following:

```rue
fun main() -> Int {
    42 * 2
}
```

As you can see, `num` just got replaced with the argument value and inserted in place of the function call.

:::note
Inline functions are treated as constants, so recursion is not allowed. Use normal functions if you need recursion.
:::

## Recursion

You can use [recursion](https://en.wikipedia.org/wiki/Recursion) to run code multiple times.

For example, the classic [factorial](https://en.wikipedia.org/wiki/Factorial):

```rue
fun main() -> Int {
    factorial(5)
}

fun factorial(num: Int) -> Int {
    if num > 1 {
        num * factorial(num - 1)
    } else {
        1
    }
}
```

In this case, we recursively call factorial on the previous number and multiply with the current number until we reach the base case of `1`.

So it will call:

- `5 * factorial(4)`
- `4 * factorial(3)`
- `3 * factorial(2)`

And so on, until it reaches the final result of `120`.

## Lambda Functions

A lambda function, also known as an [anonymous function](https://en.wikipedia.org/wiki/Anonymous_function), lets you define a function as an expression rather than a named item.

It's convenient for passing functions as parameters:

```rue
fun main() -> Int {
    map([1, 2, 3], fun(num) => num * 100)
}

fun map(list: Int[], mapper: fun(num: Int) -> Int) -> Int[] {
    if list is (Int, Int[]) {
        return [mapper(list.first), ...map(list.rest, mapper)];
    }
    nil
}
```

## Generic Types

You can define generic types on functions which will get replaced when called.

Here's a simple example, building on the previous:

```rue
fun main() -> Int {
    map([1, 2, 3], fun(num) => num * 100)
}

fun map<T>(list: T[], mapper: fun(num: T) -> T) -> T[] {
    if list is (T, T[]) {
        return [mapper(list.first), ...map(list.rest, mapper)];
    }
    nil
}
```

:::info
The only difference is that we made `map` generic over any type `T` rather than being specific to `Int`, since the type doesn't matter.
:::

## Captures

Functions can capture values from scopes they are defined in, even if they aren't an explicit parameter. This is seen in the previous example, where `factorial` captures itself so it can call it recursively.

The `main` function itself captures `factorial` so it can call it.

## Closures

If a function leaves the scope it's defined in, it must first [partially apply](https://en.wikipedia.org/wiki/Partial_application) its captures. This creates a [closure](<https://en.wikipedia.org/wiki/Closure_(computer_programming)>).

Because of this, functions can be passed to other functions or variables, otherwise known as [higher-order functions](https://en.wikipedia.org/wiki/Higher-order_function). This is one of the most powerful functional programming features.

Here is an example of this:

```rue
fun main() -> Int {
    let doubler = fn(2);
    doubler(1000)
}

fun multiplier(factor: Int) -> fun(num: Int) -> Int {
    fun fn(num: Int) -> Int {
        num * factor
    }
    fn
}
```

In this example, `multiplier` returns a function which captures `factor`. This creates a closure which is assigned to `doubler`, then called.

The output is `2000`.
