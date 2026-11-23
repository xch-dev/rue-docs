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

To choose between several branches by the type of a value, a [`match`](/docs/match.md) expression is often shorter than a chain of `else if` type guards.

## Inline If

If you don't need to narrow the type, you can use an `inline if` expression to evaluate both branches up front, and return the result of the branch that matches the condition. This can be an important optimization to reduce the size and cost of the compiled program, since it avoids wrapping each branch in its own program.

The example above is a great example of when you should use an `inline if` expression, since each branch is just a constant value:

```rue
fn size(number: Int) -> String {
    inline if number > 100 { "large" } else { "small" }
}
```

However, since both branches are always evaluated, this can lead to logic errors or higher runtime costs if you're not careful. In particular, if either branch can raise an error, it will raise even when the condition doesn't select it. The `inline_if_may_raise` [lint](/docs/lints.md) warns about this.

For the same reason, an `inline if` doesn't narrow types, either in its branches or after it when it's used as a [statement](#if-statement).

## If Statement

An `if` can also be used as a statement anywhere in a block, to do something only when a condition is met. Its `else` branch is optional, as is the `else` at the end of an `else if` chain. Each branch is a block that can `return` from the function, `raise` an error, or fall through to the rest of the block:

```rue
struct Limit {
    max: Int,
}

fn spend(amount: Int, limit: Limit | nil) -> Int {
    if limit is Limit {
        assert amount <= limit.max, "over the limit";
    }

    amount
}
```

Returning early is useful to reduce the amount of indentation:

```rue
fn first_or_zero(list: List<Int>) -> Int {
    if list is nil {
        return 0;
    }

    list.first
}
```

Type guards in the condition narrow the type for the rest of the block after the statement, based on the branches that fall through to it. In this case, `list` is known to not be `nil` after the `if` statement, since the only branch where it is `nil` returns, so `list.first` can be accessed.

This works for a whole chain of branches too. Here, the rest of the block only sees the `(Bytes32, Int)` values, since the branch for `nil` returns:

```rue
fn price(item: (Bytes32, Int) | nil, discount: Int) -> Int {
    if item is nil {
        return 0;
    } else if discount > item.rest {
        raise "discount too large";
    }

    item.rest - discount
}
```

If every branch returns or raises, the statement ends the block, and the `unreachable_code` lint reports any code after it:

```rue
fn sign(value: Int) -> Int {
    if value > 0 {
        return 1;
    } else if value < 0 {
        return -1;
    } else {
        return 0;
    }
}
```

The branches of an `if` statement can't end with a value, since it wouldn't be used. However, an `if` that is the last expression of a function body is the function's value, so it can mix the two, with some branches that `return` and others that end with a value:

```rue
fn half(value: Int) -> Int {
    if value % 2 != 0 {
        return 0;
    } else {
        value / 2
    }
}
```

A [`match`](/docs/match.md#match-statement) can be used as a statement in the same way.

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
A `return` statement can be used in a function body, in the branches of an `if` or `match` statement, and in the branches of the `if` or `match` that a function body ends with. It can't be used inside of an expression, such as a block whose value is assigned to a binding, since it would only exit that block rather than the function.
:::

## Raise

You can use a `raise` statement to immediately exit the program with an error:

```rue
fn main(list: List<Int>) -> Int {
    if list is nil {
        raise "List is empty";
    } else {
        list.first
    }
}
```

This will cause the program to fail with the message "List is empty". The message is optional, so you can also write `raise;` on its own.

:::info
Error messages are omitted when compiling normally, to reduce the size of the compiled program. They are only included when compiling in debug mode, such as with `rue build --debug` or `rue test`.
:::

## Assert

The `assert` statement raises an error if a condition isn't met:

```rue
fn main(value: Int) -> Int {
    assert value > 0;
    value * 2
}
```

It's useful for checking conditions or types at runtime and raising an error if they are not met. Like an `if` statement, type guards in an `assert` narrow the type of values for the rest of the block.

In debug mode, the error includes the location of the assertion that failed, such as `"assertion failed at main.rue:2:5"`.

You can add a message after the condition, separated by a comma. It can be any value, which is included in the error in debug mode:

```rue
fn withdraw(balance: Int, amount: Int) -> Int {
    assert balance >= amount, ["insufficient balance", balance, amount];
    balance - amount
}
```

If `withdraw(10, 25)` is called in a debug build, it raises `("assertion failed at main.rue:2:5" ("insufficient balance" 10 25))`. The message is only evaluated when the assertion fails, and it's left out entirely when compiling normally, so the release build is the same with or without it. Type guards in the condition narrow the message too, so it sees the values that the condition is false for.

An `if` statement that only raises can be written as an `assert` of the opposite condition, which the `manual_assert` [lint](/docs/lints.md) suggests. For example, `if value > 100 { raise "too large"; }` can be written as `assert !(value > 100), "too large";`, or more simply `assert value <= 100, "too large";`.

## Conditions That Never Finish

A condition whose type is `Never`, such as a call to a function that always raises, never finishes, so none of the branches that depend on it are ever evaluated. When it's the condition of an `assert`, or the first condition of an `if` statement, the `unreachable_code` [lint](/docs/lints.md) reports the code after the statement, since it can never be reached.
