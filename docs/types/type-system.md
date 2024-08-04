---
slug: /type-system
---

# Type System

## Builtin Types

Rue has a structural type system, which is similar to [duck typing](https://en.wikipedia.org/wiki/Duck_typing). One key difference is that types with different semantics must be cast, even if they have the same structure.

### Any

Makes no assumption about the structure of the value. Anything can be assigned to `Any`.

```rue
let value: Any = (14, 32);
```

### List

Represents a recursive structure of nested pairs.

```rue
let value: List<Int> = [1, 2, 3];
```

### Bytes

Any atomic CLVM value can be represented as `Bytes`. However, only strings and hex literals are treated as `Bytes` by default.

```rue
let hex: Bytes = 0xFACE;
let string: Bytes = "Hello";
```

When you add byte values together, they will be concatenated.

### Bytes32

When an atomic value is exactly 32 bytes in length, it can be represented as `Bytes32`. This enhances type safety of things such as sha256 hashes.

```rue
let hash: Bytes32 = 0x38b1cec180a0bc0f5ec91097cec51971df126e3b18af54ddba4a3e4a36f9c285;
```

### PublicKey

When an atomic value is exactly 48 bytes in length, it can be represented as `PublicKey`.

More specifically, `PublicKey` is a [BLS12-381](https://en.wikipedia.org/wiki/BLS_digital_signature#BLS12-381) G1Element.

```rue
let pk: PublicKey = 0xb3596acaa39f19956f77b84cef87a684ea0fec711e6ec9e55df3cffd4a6e05d3e2da842433dccb6042ee35c14d892206;
```

When you add public keys together, it will call the CLVM `g1_add` operator (formerly known as `point_add`).

### Int

Any atomic CLVM value can be represents as `Int`.

```rue
let num: Int = 42;
```

You can perform standard arithmetic on integers, as well as bitwise math:

```rue
let a: Int = ((42 * 34) / 8 + 9 - -10) % 16;
let b: Int = ((100 >> 3) << 2) & 420 | ~6;
```

### Bool

A boolean is either `true` or `false`.

```rue
let flag: Bool = true;
```

You can use logical operators on booleans:

```rue
let value: Bool = (true && false) || true;
```

### nil

The simplest type of them all, `nil` only has one value:

```rue
let value: nil = nil;
```

## Inference

In many cases, the type of variables can be inferred based on their value.

For example:

```rue
let value = 42;
```

Here, `value` is known to be `Int` even though it wasn't specified. It's generally cleaner to omit the type in places where it's obvious.

## Casting

### Structural Cast

You can cast the type of a value with the `as` keyword. This can only be done as long as both types are structurally related.

For example, casting an `Int` to `Bytes` is fine since both of them are atomic values:

```rue
let value = 42;
let bytes = 42 as Bytes;
```

You can cast more complicated types such as pairs:

```rue
let pair = ("Hello, ", "world!");
let casted = pair as (Int, Int);
```

However, this is **not** allowed, since the structure would differ (and this could cause runtime errors):

```rue
let pair = (42, 34);
let num = pair as Int; // Type error
```

### Reinterpret Cast

Sometimes, you need to change the type of a variable without the type system getting in the way.

:::warning
This is unsafe and could result in hard to debug issues at runtime if you are not careful. It should be scrutinized when auditing Rue code.
:::

There is a built in function called `cast` which will do this:

```rue
let pair = (42, 34);
let num = cast::<Int>(pair); // Ok
```
