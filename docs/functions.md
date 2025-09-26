---
slug: /functions
---

# Functions

A [function](<https://en.wikipedia.org/wiki/Function_(computer_programming)>) is a self contained part of a program. You can break up complex code into multiple programs to make it more readable, or use recursive functions to implement looping.

Function items can be declared at the top level:

```rue
fn add(a: Int, b: Int) -> Int {
    a + b
}
```

And they can be called by other functions:

```rue
add(42, 34)
```

## Main

The `main` function is special, in that it's the entrypoint to every compiled program. It's used to determine which symbols are used in the program, and its body is compiled verbatim (along with any functions and constants it depends on) rather than being called.

For example, the following program:

```rue
fn main() -> Int {
    42
}
```

Will compile to the CLVM `(q . 42)`.

## Inline Functions

You can mark a function as `inline`. This will change the behavior of the compiler to insert the function body everywhere it's referenced, substituting each of the parameters with the corresponding arguments in the function call, instead of defining the function separately and calling it.

As an example, this will insert the parameter value `num + 10` four times, twice for each multiplication, rather than defining the function once and calling it twice:

```rue
fn main(num: Int) -> Int {
    square(num + 10) + square(num + 10)
}

inline fn square(num: Int) -> Int {
    num * num
}
```

This should be used sparingly, since it can come with either a performance hit, an increase in compiled output size, or both.

A recursive function cannot be marked as `inline`.

:::tip
The compiler will automatically inline functions if they are referenced a single time and their parameters are referenced a single time. You almost never need to explicitly mark them as `inline`.
:::

## Spread Syntax

Typically, there is a fixed number of arguments in a function. However, if you want to allow a variable number of arguments, or extend the argument list with another type, you can use the spread operator.

For example, the following function accepts any number of arguments:

```rue
fn sum(...numbers: List<Int>) -> Int {
    if numbers is nil {
        0
    } else {
        numbers.first + sum(...numbers.rest)
    }
}
```

And can be called as such:

```rue
let zero = sum();
let added = sum(42, 34);

// You can spread arguments too
let list = [1, 2, 3, 4, 5];
let total = sum(42, ...list);
```

It's also possible to use the spread operator with non-list types, which allows for compatibility with arbitrary functions:

```rue
fn main(
    inner_puzzle: fn(...inner_solution: Any) -> List<Condition>,
    ...inner_solution: Any,
) -> List<Condition> {
    inner_puzzle(...inner_solution)
}
```

Another use case for this feature is extending the list of arguments with a struct:

```rue
struct Solution {
    public_key: PublicKey,
    conditions: List<Condition>,
}

fn main(...solution: Solution) -> List<Condition> {
    let message = tree_hash(solution.conditions as Any);
    let agg_sig = AggSigMe {
        public_key: solution.public_key,
        message: message,
    };
    [agg_sig, ...solution.conditions]
}
```

## Lambdas

Because functions can be passed around as values, it's sometimes useful to be able to write a function inline.

You can do this with a lambda:

```rue
let adder = fn(a: Int, b: Int) => a + b;
let sum = adder(42, 34);
```

### Closures

Lambdas can automatically capture values that are defined in their parent scope, much like how functions in general capture other functions or constants that are defined externally.

Here's an example of a lambda that captures its environment in a closure:

```rue
fn main() -> Int {
    let adder = create_adder(42);
    adder(100)
}

fn create_adder(a: Int) -> fn(b: Int) -> Int {
    fn(b) => a + b
}
```

In this case, `create_adder` returns a closure which captures the value of `a` into the lambda function.
