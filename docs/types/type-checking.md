---
slug: /type-checking
---

# Type Checking

Types can be assigned or cast to different types so long as they have the same structure. However, sometimes you need to distinguish between and narrow types at runtime. This is when type checking comes in.

Type checks have the following form:

```rue
value is Type
```

They emit the code required to check the type at runtime, and return a `Bool` value.

## Structure

If you have a value of type `Any`, you can determine whether it's an atom or a pair.

For example:

```rue
fun count_atoms(value: Any) -> Int {
    if value is Bytes {
        1
    } else {
        let first = count_atoms(value.first);
        let rest = count_atoms(value.rest);
        first + rest
    }
}
```

## Length

You can check against a type with a fixed length:

```rue
fun calculate_coin_id(
    parent_coin_info: Bytes,
    puzzle_hash: Bytes,
    amount: Int,
) -> Bytes32 {
    assert parent_coin_info is Bytes32;
    assert puzzle_hash is Bytes32;
    sha256(parent_coin_info + puzzle_hash + amount as Bytes)
}
```

## Values

You can even check against a specific integer value:

```rue
let num: Any = 42;
assert num is 42;
```

Although if you have an `Int` already, you may as well just do a simple equality check:

```rue
let num = 42;
assert num == 42;
```

## Complex Checks

You can check against more complicated nested types as well:

```rue
struct Point {
    x: Int,
    y: Int,
}

let value: Any = 42;
assert !(value is Point);
```

## Union Narrowing

If you have a union of one or more values, you can check if it's one of the items in the union. This will narrow the type if it's not.

```rue
let value: Bytes32 | nil = nil;

if !(value is nil) {
    // value must be Bytes32
}
```

## Recursive Checks

You can check against recursive types only if it would disambiguate a union:

```rue
let list: List<Int> = [1, 2, 3];

assert value is (Int, List<Int>);
```

However, if you were to try to do this, it would fail since it's a recursive type:

```rue
let value: Any = 42;

assert value is List<Int>; // Type error
```

To achieve this, you can write your own recursive function to check instead:

```rue
fun is_int_list(value: Any) -> Bool {
    match value {
        (Int, Any) => is_int_list(value.rest),
        nil => true,
        _ => false,
    }
}
```
