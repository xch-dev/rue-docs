---
slug: /control-flow
---

# Control Flow

Control flow is used to change the behavior of the program based on certain conditions. This is known as [branching](<https://en.wikipedia.org/wiki/Branch_(computer_science)>).

## If Expression

You can use an `if` expression to execute different blocks of code based on a condition. The condition must be a `Bool`.

For example:

```rue
fn size(number: Int) -> String {
    if number > 100 {
        "large"
    } else {
        "small"
    }
}
```

Since `if` is an expression, both branches must produce a value, and the result can be assigned to a binding or returned from a function.

You can chain multiple conditions with `else if`:

```rue
fn size(number: Int) -> String {
    if number > 100 {
        "large"
    } else if number > 10 {
        "medium"
    } else {
        "small"
    }
}
```

It's worth noting that this will only execute the branch that matches the condition. This means that you can use a [type guard](/docs/type-system/guards.md) to narrow the type of variables in each branch.

## Inline If

If you don't need to narrow the type, you can use an `inline if` expression to evaluate both branches up front, and return the result of the branch that matches the condition. This can be an important optimization to reduce the size and cost of the compiled program, since it avoids wrapping each branch in its own program.

The example above is a great example of when you should use an `inline if` expression, since each branch is just a constant value:

```rue
fn size(number: Int) -> String {
    inline if number > 100 { "large" } else { "small" }
}
```

However, since both branches are always evaluated, this can lead to logic errors or higher runtime costs if you're not careful. In particular, if either branch can raise an error, it will raise even when the condition doesn't select it. The `inline_if_may_raise` [lint](/docs/lints.md) warns about this.

## If Statement

To reduce the amount of indentation, you can use an `if` statement (an `if` without an `else` branch) to exit the function early if the condition is met. Its block must end with a `return` or `raise`:

```rue
fn first_or_zero(list: List<Int>) -> Int {
    if list is nil {
        return 0;
    }

    list.first
}
```

Type guards in the condition of an `if` statement narrow the type for the rest of the block after it. In this case, `list` is known to not be `nil` after the `if` statement, so `list.first` can be accessed.

## Return

You can use a `return` statement to exit the current function early and return a value:

```rue
fn clamp(value: Int) -> Int {
    if value > 100 {
        return 100;
    }

    value
}
```

If the function doesn't return a value, you can write `return;` on its own.

:::note
A `return` statement can only be used directly in a function body, or in the block of an `if` statement. Inside of an expression (such as a branch of an `if` expression), the block must end with its value instead.
:::

## Raise

You can use a `raise` statement to immediately exit the program with an error:

```rue
fn main(list: List<Int>) -> Int {
    if list is nil {
        raise "List is empty";
    }

    list.first
}
```

This will cause the program to fail with the message "List is empty". The message is optional, so you can also write `raise;` on its own.

:::info
Error messages are omitted when compiling normally, to reduce the size of the compiled program. They are only included when compiling in debug mode, such as with `rue build --debug` or `rue test`.
:::

## Assert

The `assert` statement is a shorthand for `raise` inside of an `if` statement:

```rue
fn main(value: Int) -> Int {
    assert value > 0;
    value * 2
}
```

It's useful for checking conditions or types at runtime and raising an error if they are not met. Like an `if` statement, type guards in an `assert` narrow the type of values for the rest of the block.

In debug mode, the error includes the location of the assertion that failed, such as `"assertion failed at main.rue:2:5"`.
