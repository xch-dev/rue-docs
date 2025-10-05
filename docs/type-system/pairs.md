---
slug: /pairs
---

# Pairs

A pair is one of two fundamental data types in [CLVM](https://chialisp.com/clvm/). Put simply, a pair is a container that holds two values. The values themselves are called `first` and `rest`.

For example, let's say you have the following pair:

```rue
let value = (1, 2);
```

You can access the inner values like so:

```rue
let first = value.first;
let rest = value.rest;
```

## Lists

A list isn't a special type, it's instead made up of a chain of pairs (terminating in `nil`).

Here are some examples of lists:

```rue
let empty = nil;
let one_item = (1, nil);
let two_items = (1, (2, nil));
```

There is a special syntax for constructing list values that yields the same result:

```rue
let empty = [];
let one_item = [1];
let two_items = [1, 2];
```

Finally, there is a builtin recursive list type defined as such:

```rue
type List<T> = nil | (T, List<T>);
```

This type is general enough to allow a list of arbitrary or unknown length. However, you can also explicitly write a sequence of nested pairs as a type if you want to.

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

It allows any combination of nested atoms and pairs, which sufficiently covers all possible CLVM values.

:::note
Due to the way the type system is designed, structs require casting when assigned to other types. So it may currently be required to explicitly cast values that contain structs to `Any`. This requirement will be lifted in the future.
:::
