---
slug: /aliases
---

# Aliases

A type alias allows you to reuse complex types multiple times without having to repeat yourself.

For example:

```rue
type MathOp = fn(a: Int, b: Int) -> Int;

fn adder(a: Int, b: Int) -> Int {
    a + b
}

fn get_adder() -> MathOp {
    adder
}
```

An alias is just another name for the type, so it can be assigned to and from the original type without a cast.

## Generic Aliases

A type alias can have [generic](/docs/type-system/generics.md) type parameters, which are substituted when the alias is used:

```rue
type Pair<T> = (T, T);

fn swap(pair: Pair<Int>) -> Pair<Int> {
    (pair.rest, pair.first)
}
```

## Recursion

You can use type aliases for recursive type definitions:

```rue
type Tree = Int | (Tree, Tree);

fn sum_tree(tree: Tree) -> Int {
    if tree is Int {
        return tree;
    }

    sum_tree(tree.first) + sum_tree(tree.rest)
}
```

The type system is equipped to handle recursive types like this, and they are quite useful for modeling complex CLVM values. Builtin types such as `List` and `Any` are defined this way.

However, a type must pass through a pair before it refers to itself. A type that refers to itself directly (or through a union, or another alias) without any nesting is an error, since it doesn't describe any actual value:

```rue
// Error: Type `Value` refers to itself without passing through a pair
type Value = Value | Int;
```
