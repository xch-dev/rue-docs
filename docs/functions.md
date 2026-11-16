---
slug: /functions
---

# Functions

A [function](<https://en.wikipedia.org/wiki/Function_(computer_programming)>) is a self contained part of a program. You can break up complex code into multiple functions to make it more readable, or use recursive functions to implement looping.

Function items can be declared at the top level of a file or module:

```rue
fn add(a: Int, b: Int) -> Int {
    a + b
}
```

And they can be called by other functions:

```rue
fn main() -> Int {
    add(42, 34)
}
```

Every parameter must have a type. The return type comes after the `->`, and if it's omitted, the function returns `nil`. The last expression in the body (without a semicolon) is the value that the function returns, although you can also [return early](/docs/control-flow.md#return).

Functions can be declared in any order, and can call themselves recursively:

```rue
fn factorial(num: Int) -> Int {
    if num > 1 {
        num * factorial(num - 1)
    } else {
        1
    }
}
```

:::info
CLVM doesn't have loops, so recursion is how you iterate over a list or repeat a computation in Rue.
:::

## Entrypoints

An entrypoint is a function that's compiled as a standalone program, rather than being called by another function. Its parameters are read from the program's solution (or for a puzzle, the curried arguments followed by the solution) as a list, and its return value is the output of the program.

Only entrypoints, and the functions and constants they depend on, are included in the compiled output. Anything that isn't used is removed.

### Main Function

The `main` function is the primary entrypoint to your program. Its body is compiled directly (along with any functions and constants it depends on) rather than being called.

For example, the following program:

```rue
fn main() -> Int {
    42
}
```

Will compile to the CLVM `(q . 42)`.

### Test Functions

Another kind of entrypoint is a test function, which lets you write unit tests directly alongside your Rue code:

```rue
test fn verify() {
    assert main() == 42;
}
```

When you run `rue test`, all of the tests in the project will be executed. See [Testing](/docs/testing.md) for more details.

### Exported Functions

The last kind of entrypoint is any function that is marked with `export`:

```rue
export fn puzzle() -> List<Condition> {
    nil
}
```

If you run `rue build --export puzzle`, it will build this export as if it were the main function. This lets you include multiple programs in a single project.

The `export` keyword also makes the function visible to other [modules](/docs/modules.md).

## Inline Functions

You can mark a function as `inline`. This will change the behavior of the compiler to insert the function body everywhere it's referenced, substituting each of the parameters with the corresponding arguments in the function call, instead of defining the function separately and calling it.

As an example, this will insert the argument `num + 10` four times, twice for each multiplication, rather than defining the function once and calling it twice:

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
The compiler will automatically inline functions if they are referenced a single time and their parameters are referenced a single time.
:::

## Parameter Layout

Most functions are only ever called by your own code, so the compiler is free to choose how their arguments are passed. Parameters of these functions are stored in an efficient binary tree structure, rather than a list, which makes them cheaper to access.

This isn't possible for entrypoints, or functions that are used as values (such as [closures](#closures), or functions passed as arguments), since other programs need to know how to call them. Those always use the standard list layout, where the arguments are a nil-terminated list.

The compiler picks the layout automatically, but you can force a function to use the standard list layout with the `extern` keyword:

```rue
extern fn add(a: Int, b: Int) -> Int {
    a + b
}
```

Just keep in mind that this can increase the size of the generated program, as well as its runtime CLVM cost.

### Spread Parameters

You can mark the last parameter with the spread operator (`...`), which binds it to the rest of the arguments, rather than to a single argument. In CLVM terms, this removes the nil terminator from the parameter list.

For example:

```rue
extern fn sum_all(...numbers: List<Int>) -> Int {
    if numbers is nil {
        0
    } else {
        numbers.first + sum_all(...numbers.rest)
    }
}
```

Rue doesn't allow you to pass an arbitrary number of arguments directly. Instead, when a function has a spread parameter, the last argument you pass to it must also be spread:

```rue
fn main() -> Int {
    let list = [1, 2, 3, 4, 5];
    sum_all(...list)
}
```

It's also possible to use the spread syntax with non-list types, which allows for flexibility with external programs:

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
    let message = tree_hash(solution.conditions);
    let agg_sig = AggSigMe { public_key: solution.public_key, message };
    [agg_sig, ...solution.conditions]
}
```

## External Functions

An `extern` function can also be loaded from a program that's already been compiled, instead of being written in Rue. The program is read from a hex file (such as one produced by `rue build --hex`, or the `.hex` files in the [chia_puzzles](https://github.com/Chia-Network/chia_puzzles) repository), with a path relative to the source file:

```rue
extern fn add(a: Int, b: Int) -> Int from "./add.hex";

fn main() -> Int {
    add(20, 22)
}
```

The signature of the function is up to you, and isn't checked against the program, so make sure that it matches the parameters the program actually expects. The program is called with its arguments in the standard list layout.

An external function can be used like any other function, including as a value. For example, `tree_hash(add)` computes the puzzle hash of the program at compile time.

:::note
The path must be relative and end in `.hex`, and the file must contain a valid serialized CLVM program.
:::

## Closures

Because functions can be passed around as values, it's sometimes useful to be able to write a function inline.

You can do this with a lambda:

```rue
fn main() -> Int {
    let adder = fn(a: Int, b: Int) => a + b;
    adder(42, 34)
}
```

The parameter types can be left out if they can be inferred from the expected type, and you can specify the return type after the parameters with a `:`:

```rue
fn main() -> Int {
    let double: fn(value: Int) -> Int = fn(value) => value * 2;
    let triple = fn(value: Int): Int => value * 3;
    double(1) + triple(2)
}
```

:::warning
Creating and calling function values limits the compiler's ability to optimize the generated bytecode, since they are forced to be compatible with external programs. You should use lambdas and closures sparingly, if at all.
:::

### Captures

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

## Function Types

The type of a function is written like its signature, with the `fn` keyword, parameter names, and the return type:

```rue
type Operation = fn(a: Int, b: Int) -> Int;

fn apply(operation: Operation, a: Int, b: Int) -> Int {
    operation(a, b)
}

fn multiply(a: Int, b: Int) -> Int {
    a * b
}

fn main() -> Int {
    apply(multiply, 6, 7)
}
```

The return type of a function type is required. A function type can also have a spread parameter (such as `fn(...solution: Any) -> List<Condition>`), and can be [generic](/docs/type-system/generics.md#generic-function-types).

A function can be assigned to a function type if it accepts at least the same arguments, and returns a compatible value. So a function that accepts `Bytes` can be used where a function that accepts `Bytes32` is expected, but not the other way around.

:::note
A function value is just a compiled CLVM program at runtime, so there's no way to check whether an arbitrary value is a function. See [Type Guards](/docs/type-system/guards.md#limitations).
:::
