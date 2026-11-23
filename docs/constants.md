---
slug: /constants
---

# Constants

Constants allow you to write a value a single time, give it a name, and then reuse it throughout your program.

They are similar to [Bindings](/docs/bindings.md), with the primary difference being that they are defined at the top level of the program and are order independent. They will live for and be reused for the entire lifecycle of the `main` function.

A constant must have an explicit type. As a simple example, you might want to reuse a string multiple times:

```rue
const GREET: String = "Hello, ";

fn main(person_a: String, person_b: String) -> (String, String) {
    (GREET + person_a, GREET + person_b)
}
```

A constant's value can be any expression, including calls to functions and references to other constants. However, a constant can't refer to itself, either directly or through other constants.

## Constants as Programs

A constant can be compiled as a program on its own, like an [entrypoint](/docs/functions.md#entrypoints). Mark it with `export`, and build it with `rue build --export`:

```rue
export const ALLOWED_AMOUNTS: List<Int> = [100, 500, 1000];

fn double(value: Int) -> Int {
    value * 2
}

export const DOUBLE: fn(value: Int) -> Int = double;
```

How the program behaves depends on the constant's type:

- If its type is a function type, the program behaves like that function, taking its arguments from the solution, just as if the function were `main`. So `rue build --export DOUBLE` compiles to `(* 2 (q . 2))`, which returns `42` when run with the solution `(21)`.
- Otherwise, the program ignores its solution and returns the constant's value. So `rue build --export ALLOWED_AMOUNTS` compiles to `(q 100 500 1000)`.

A constant named `main` (in place of a `main` function) is the program in the same way, although the `naming_convention` [lint](/docs/lints.md) warns that it isn't in `SCREAMING_SNAKE_CASE`, so exporting a constant is usually clearer.

You can mark a constant as `inline`, which forces its value to be inserted everywhere it's referenced rather than being defined a single time and reused.

As an example, this will behave the same as if you had written the string multiple times:

```rue
inline const GREET: String = "Hello, ";

fn main(person_a: String, person_b: String) -> (String, String) {
    (GREET + person_a, GREET + person_b)
}
```

This should be used sparingly, since it can come with either a performance hit, an increase in compiled output size, or both. It's best suited for small values, like the condition opcodes in the [standard library](/docs/standard-library.md), which are cheaper to repeat than to reference.

:::tip
When compiling normally (not in debug mode), the compiler will automatically inline constants if they are only referenced a single time.
:::

## Const Expressions

A `const` block is evaluated at compile time, and its result is inserted into the program as a constant value. This lets you precompute values that would otherwise be computed every time the program runs:

```rue
fn main() -> Bytes32 {
    const { tree_hash([1, 2, 3]) }
}
```

This compiles to `(q . 0xbcd55bcd0daebba8cb158547e8480dc968570faf958f1e31a9887d6ae3dba591)`, instead of hashing the list at runtime.

A const block can contain statements like any other [block](/docs/bindings.md#blocks), and can call functions (including recursive ones) and reference constants:

```rue
const BASE: Int = 5;

fn factorial(value: Int) -> Int {
    if value <= 1 {
        1
    } else {
        value * factorial(value - 1)
    }
}

fn main() -> Int {
    const {
        let result = factorial(BASE);
        result * 2
    }
}
```

However, it can't depend on any values that are only known at runtime, such as function parameters or `let` bindings declared outside of it. If the expression raises an error while it's being evaluated, or it uses more than the CLVM cost limit of 11,000,000,000, it's reported as a compile error.

:::tip
Keep in mind that a large constant value (such as a hash) can cost more to include in a program than it costs to compute at runtime, since every byte of a puzzle adds to its cost. Const expressions are most useful for values that are expensive to compute, but small to store.
:::
