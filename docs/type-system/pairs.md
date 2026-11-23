---
slug: /pairs
---

# Pairs and Lists

A pair is one of two fundamental data types in [CLVM](https://chialisp.com/clvm/). Put simply, a pair is a container that holds two values. The values themselves are called `first` and `rest`.

For example, let's say you have the following pair:

```rue
fn main() -> (Int, Int) {
    (1, 2)
}
```

The type of a pair is written the same way as the value, so this has the type `(Int, Int)`.

You can access the inner values like so:

```rue
fn sum(value: (Int, Int)) -> Int {
    value.first + value.rest
}
```

## Lists

A list isn't a special type, it's instead made up of a chain of pairs (terminating in `nil`).

Here are some examples of lists:

```rue
fn main() -> (List<Int>, (List<Int>, List<Int>)) {
    let empty: List<Int> = nil;
    let one_item = (1, nil);
    let two_items = (1, (2, nil));
    (empty, (one_item, two_items))
}
```

There is a special syntax for constructing list values that yields the same result:

```rue
fn main() -> (List<Int>, (List<Int>, List<Int>)) {
    let empty: List<Int> = [];
    let one_item = [1];
    let two_items = [1, 2];
    (empty, (one_item, two_items))
}
```

You can use the spread operator to insert the items of an existing list. A spread can go anywhere in the list, and a list can have more than one:

```rue
fn prepend(list: List<Int>) -> List<Int> {
    [1, 2, ...list]
}

fn surround(a: List<Int>, b: List<Int>) -> List<Int> {
    [...a, 0, ...b]
}

test fn spreads_lists() {
    assert deep_equal(surround([1, 2], [3]), [1, 2, 0, 3]);
}
```

A spread as the last item is used as the rest of the list as is, so it costs nothing. A spread before other items has to copy the items of its list in front of the items after it, which costs more at runtime. (A spread [`for` expression](/docs/loops.md#spreading) is the exception, since it builds its items directly in front of them.)

Finally, there is a builtin recursive list type defined as such:

```rue
type List<T> = nil | (T, List<T>);
```

This type is general enough to allow a list of arbitrary or unknown length. To access the items of a `List`, you first need to check that it isn't `nil` with a [type guard](/docs/type-system/guards.md):

```rue
fn first_or_zero(list: List<Int>) -> Int {
    if list is nil {
        return 0;
    }

    list.first
}
```

:::info
CLVM doesn't have loops, so going through a list means recursion: each call handles the first item, and calls itself again with the rest of the list until it reaches `nil`. A [`for` expression](/docs/loops.md) writes this recursion for you, to build a new list from the items, filter them or fold them into a single value.
:::

The prelude also has a few functions for working with lists:

| Function                                           | Description                                    |
| -------------------------------------------------- | ---------------------------------------------- |
| `length<T>(list: List<T>) -> Int`                  | The number of items in the list.               |
| `reverse<T>(list: List<T>) -> List<T>`             | The list's items in the opposite order.        |
| `contains(list: List<Bytes>, item: Bytes) -> Bool` | Whether any of the items is equal to the item. |

```rue
test fn list_functions() {
    let items: List<Bytes> = ["a", "b", "c"];
    assert length(items) == 3;
    assert deep_equal(reverse(items), ["c", "b", "a"]);
    assert contains(items, "b");
}
```

### List Types

If you know the exact length of a list, you can write its type with the list syntax as well. For example, `[Int, Bytes]` is the same as `(Int, (Bytes, nil))`.

A list type can end with a spread type, which is used as the rest of the list instead of `nil`. For example, `[Int, ...List<Bytes>]` is a list that starts with an `Int`, followed by any number of `Bytes` values.

## Alternating Lists

An alternating list is a list that alternates between two types. It is defined as such:

```rue
type AlternatingList<T, U> = nil | (T, (U, AlternatingList<T, U>));
```

This is useful for representing alternating sequences of two types, such as the arguments to BLS opcodes.

## Any

Any is defined recursively with a type alias as well:

```rue
type Any = Atom | (Any, Any);
```

It allows any combination of nested atoms and pairs, which sufficiently covers all possible CLVM values. Every value (including structs and functions) can be assigned to `Any` without a cast.

To do anything useful with an `Any` value, you need to narrow it first with a [type guard](/docs/type-system/guards.md), such as `value is Bytes` or `value is (Any, Any)`.
