---
slug: /control-flow
---

# Control Flow

Control flow is used to change the behavior of the program based on certain conditions. This is known as [branching](<https://en.wikipedia.org/wiki/Branch_(computer_science)>).

## If Expression

You can use an `if` expression to execute different blocks of code based on a condition.

For example:

```rue
let size = if number > 100 {
    "large"
} else {
    "small"
};
```

It's worth noting that this will only execute the branch that matches the condition. This means that you can use a [type guard](/docs/type-system/guards.md) to narrow the type of variables after the condition is evaluated.

However, if you don't need to narrow the type, you can use an `inline if` expression to immediately execute both branches and return the result of the branch that matches the condition. This can be an important optimization to reduce the size of the compiled program, but it can also lead to logic errors or higher runtime costs if you're not careful.

The example above is a great example of when you should use an `inline if` expression:

```rue
let size = inline if number > 100 {
    "large"
} else {
    "small"
};
```

## If Statement

To reduce the amount of indentation, you can use an `if` statement instead of an `if` expression if you're going to exit the function early if the condition is met (i.e., an early `return`).

This might look like this:

```rue
if list is nil {
    return 0;
}

let (first, rest) = list;
```

## Raise

You can use a `raise` statement to immediately exit the program with an error.

```rue
raise "List is empty";
```

This will cause the program to fail with the message "List is empty".

:::info
In release builds, error messages will automatically be omitted to reduce the size of the compiled program.
:::

## Assert

The `assert` statement is a shorthand for `raise` inside of an `if` statement:

```rue
assert !(list is nil);
```

It's useful for checking types at runtime and raising an error if the condition is not met.

## Return

You can use a `return` statement to exit the current function early and return a value.

```rue
return 0;
```
