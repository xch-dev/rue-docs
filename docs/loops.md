---
slug: /loops
---

# Loops

CLVM doesn't have loops, so going through the items of a [list](/docs/type-system/pairs.md#lists) means calling a function recursively: each call handles the first item, and calls itself again with the rest of the list until it reaches `nil`. A `for` expression writes that recursion for you. It builds a new list from the items, filters them, folds them into a single value, or checks each of them.

## For Expressions

A `for` expression evaluates its body once for each item in a list, and its value is a list of the results, in the same order:

```rue
fn doubled(values: List<Int>) -> List<Int> {
    for value in values { value * 2 }
}

test fn doubles_each_item() {
    assert deep_equal(doubled([1, 2, 3]), [2, 4, 6]);
}
```

The item (`value` here) is a binding that's only in scope in the body. Its type is the type of the list's items, so you don't need to write it.

The body can use any binding from around the `for`, such as a parameter:

```rue
fn scaled(values: List<Int>, factor: Int) -> List<Int> {
    for value in values { value * factor }
}
```

## Filtering

You can add an `if` with a condition after the list, to only keep the items that pass it. The body is only evaluated for those items:

```rue
fn positive(values: List<Int>) -> List<Int> {
    for value in values if value > 0 { value }
}

test fn keeps_positive_items() {
    assert deep_equal(positive([3, -1, 0, 7]), [3, 7]);
}
```

The condition can be a [type guard](/docs/type-system/guards.md), which narrows the item in the body. For example, this picks the amounts of the `CreateCoin` conditions out of a list of conditions:

```rue
fn created_amounts(conditions: List<Condition>) -> List<Int> {
    for condition in conditions if condition is CreateCoin { condition.amount }
}

test fn picks_create_coin_amounts() {
    let conditions = [
        CreateCoin { puzzle_hash: sha256("a"), amount: 100 },
        ReserveFee { amount: 5 },
        CreateCoin { puzzle_hash: sha256("b"), amount: 50 },
    ];

    assert deep_equal(created_amounts(conditions), [100, 50]);
}
```

The item is narrowed in the body, so if the body is just the item, the result is a list of the narrowed type: `for condition in conditions if condition is CreateCoin { condition }` is a `List<CreateCoin>`.

## Folding

A `fold` combines the items into a single value, rather than building a list. It names an accumulator and gives its initial value, and the body's value is the new accumulator:

```rue
fn total(values: List<Int>) -> Int {
    for value in values fold sum = 0 { sum + value }
}

test fn adds_up_the_items() {
    assert total([1, 2, 3]) == 6;
    assert total([]) == 0;
}
```

The fold goes from the right, starting at the end of the list. The accumulator is the result for the rest of the list after the item, and the initial value is the result for an empty list, so it's only evaluated at the end of the list. This means a fold that builds a list keeps the items in the same order:

```rue
fn evens(values: List<Int>) -> List<Int> {
    for value in values fold kept: List<Int> = nil {
        if value % 2 == 0 {
            [value, ...kept]
        } else {
            kept
        }
    }
}

test fn keeps_the_order() {
    assert deep_equal(evens([1, 2, 3, 4]), [2, 4]);
}
```

The type of the accumulator is inferred from the initial value. Above, the initial value is `nil`, whose type is just `nil`, so the accumulator is given a type with `fold kept: List<Int> = nil`. Where the `for` is already expected to be a list, such as the return value of a function that returns a `List<Int>`, the type can be left out.

A fold can also have a filter, which skips the items that don't pass it:

```rue
fn created_total(conditions: List<Condition>) -> Int {
    for condition in conditions if condition is CreateCoin fold total = 0 {
        total + condition.amount
    }
}
```

### Stopping Early

Since the accumulator is the result for the rest of the list, the rest of the list is only gone through if the body uses it. This lets a search stop at the first match, by putting the accumulator on the right of `||`:

```rue
fn has_puzzle_hash(puzzle_hashes: List<Bytes32>, target: Bytes32) -> Bool {
    for puzzle_hash in puzzle_hashes fold found = false { puzzle_hash == target || found }
}
```

Written the other way around, `found || puzzle_hash == target` goes through the whole list before comparing any of the items.

## Loops

A `for` whose value isn't used is a loop. It runs the body for each item without building a list. This is useful for checking each item with an `assert`:

```rue
fn check_amounts(amounts: List<Int>) -> Int {
    for amount in amounts {
        assert amount > 0;
    }

    sum(amounts)
}

test fn checks_each_amount() {
    assert check_amounts([1, 2, 3]) == 6;
}
```

A `for` is a loop when it's a statement in the middle of a block, when its body has no value (it only has statements), or when its body's value is `nil`, such as a call to a function with no return type, and no list is expected. The body of a loop can also be another loop:

```rue
fn check_distinct(a: Int, b: Int) {
    assert a != b;
}

fn check_all(xs: List<Int>, ys: List<Int>) -> Int {
    for x in xs { for y in ys { check_distinct(x, y) } }

    length(xs) * length(ys)
}

test fn checks_every_combination() {
    assert check_all([1, 2], [3, 4, 5]) == 6;
}
```

If the body of a loop does have a value, it's computed for each item and thrown away, and the compiler warns about it as an unused value.

## Several Lists

A `for` can go through several lists together, separated by commas. It takes an item from each list on every step:

```rue
fn pairwise_sums(xs: List<Int>, ys: List<Int>) -> List<Int> {
    for x in xs, y in ys { x + y }
}

test fn adds_items_in_the_same_position() {
    assert deep_equal(pairwise_sums([1, 2, 3], [10, 20, 30]), [11, 22, 33]);
}
```

The `for` ends when the first list does, and ignores whatever is left of the other lists. If another list runs out before the first one does, the program fails, so put the list that's known to be the shortest first, or check the lengths beforehand. This applies to every kind of `for`, including filters, folds and loops, even if the item of the shorter list isn't used.

A filter and a fold see the items of every list:

```rue
fn paid_to(puzzle_hashes: List<Bytes32>, amounts: List<Int>, target: Bytes32) -> Int {
    for puzzle_hash in puzzle_hashes, amount in amounts if puzzle_hash == target fold total = 0 {
        total + amount
    }
}
```

Each list is evaluated before any of the items are in scope, so a list can't refer to another list's item.

## The Rest of the List

You can name the rest of the list after the item, by writing a second binding after a comma. It's the list that follows the current item, which is `nil` for the last item:

```rue
fn has_duplicates(values: List<Bytes>) -> Bool {
    for value, rest in values fold found = false { contains(rest, value) || found }
}

test fn finds_duplicates() {
    assert has_duplicates(["a", "b", "a"]);
    assert !has_duplicates(["a", "b", "c"]);
}
```

This works for each list in a `for` over several lists, as in `for a, a_rest in xs, b in ys`.

## Patterns

The item can be any [destructuring pattern](/docs/bindings.md#destructuring), the same as a `let` binding:

```rue
struct Payment {
    puzzle_hash: Bytes32,
    amount: Int,
}

fn amounts(payments: List<Payment>) -> List<Int> {
    for { amount } in payments { amount }
}

fn products(pairs: List<(Int, Int)>) -> List<Int> {
    for (a, b) in pairs { a * b }
}
```

If you don't need the item, start its name with an underscore (or use `_`), as in `for _item in list fold count = 0 { count + 1 }`.

## Spreading

A `for` is a list, so you can [spread](/docs/type-system/pairs.md#lists) it into a list literal along with other items. The `for` builds its items directly onto the items after it, without copying the list:

```rue
fn with_header(values: List<Int>) -> List<Int> {
    [0, ...for value in values { value * 2 }, 100]
}

test fn spreads_the_items() {
    assert deep_equal(with_header([1, 2]), [0, 2, 4, 100]);
}
```

Putting a `for` in brackets without spreading it, as in `[for value in values { value * 2 }]`, makes a list with one item, which is the list the `for` built. That's almost always a mistake, so the `bracketed_for` [lint](/docs/lints.md) warns about it, and suggests removing the brackets or spreading the `for`. It doesn't warn where a list of lists is expected, such as in a function that returns `List<List<Int>>`.

## How Loops Compile

Each `for` compiles to its own recursive function, which calls itself with the rest of the list (or lists). Any values from around the `for` that the body uses are passed along to it, as you would with the extra parameters of a function written by hand. A value from outside the `for` is evaluated once, before the loop starts, rather than once for each item.

The compiled function is usually as small as, or smaller than, the recursive function you'd write by hand, so there's rarely a reason not to use a `for` to go through a list.

There are a few things that a `for` can't do, which still need a recursive [function](/docs/functions.md):

- A fold always goes from the right. To build a list in reverse order, or to carry a value from the start of the list to the end, write the recursion by hand. The prelude's `reverse` function reverses a list.
- A `for` only goes through lists. To repeat something a number of times, or to walk a tree, write a recursive function.
- The body can't `return` from the function the `for` is in. It can `raise`, or fail an `assert`, which stops the whole program.

## Gotchas

- A struct initializer in the header of a `for` (as the list, the filter or the fold's initial value) needs to be wrapped in parentheses, since a `{` after a name starts the body, the same as in the condition of an `if`.
- A fold over several lists goes through all of them, even if the body doesn't use the accumulator, so that it fails when another list runs out. This means a search over several lists doesn't stop at the first match.
- Since a `for` over several lists can fail, the `inline_value_may_fail` [lint](/docs/lints.md) warns about an `inline let` of one that isn't always used, since its check would be skipped where it isn't.
- A function with no return type can't end with a `for` whose body has a value, since that's a list rather than a loop. End it with a `;` to make it a statement.
- `in` and `fold` are only keywords in the header of a `for`, so you can still use them as names elsewhere. `for` is reserved.
