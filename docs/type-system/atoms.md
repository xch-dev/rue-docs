---
slug: /atoms
---

# Atoms

An atom is one of two fundamental data types in [CLVM](https://chialisp.com/clvm/). Put simply, atom values represent a sequence of bytes.

There are multiple types of atoms:

1. **Atom** - has no semantic meaning
2. **Bytes** - explicitly treated as bytes
3. **Bytes32** - a `Bytes` value with a length of 32
4. **String** - a UTF-8 encoded string
5. **PublicKey** - a [BLS12-381](https://en.wikipedia.org/wiki/BLS_digital_signature) public key with a length of 48 bytes
6. **Signature** - a [BLS12-381](https://en.wikipedia.org/wiki/BLS_digital_signature) signature with a length of 96 bytes
7. **K1PublicKey** - a secp256k1 public key with a length of 33 bytes
8. **K1Signature** - a secp256k1 signature with a length of 64 bytes
9. **R1PublicKey** - a secp256r1 public key with a length of 33 bytes
10. **R1Signature** - a secp256r1 signature with a length of 64 bytes
11. **Int** - a signed integer of arbitrary size
12. **Bool** - either `true` or `false`

## Literals

| Literal | Example           | Type                                                                         |
| ------- | ----------------- | ---------------------------------------------------------------------------- |
| Integer | `42`, `1_000_000` | `Int`                                                                        |
| Hex     | `0xCAFE_F00D`     | `Bytes` (or `Bytes32`, `PublicKey`, or `Signature`, depending on the length) |
| Binary  | `0b101010`        | `Int`                                                                        |
| Octal   | `0o52`            | `Int`                                                                        |
| String  | `"Hello, world!"` | `String`                                                                     |
| Boolean | `true`, `false`   | `Bool`                                                                       |
| Nil     | `nil`             | `nil`                                                                        |

Underscores can be used anywhere in a number to make it easier to read. Hex literals with an odd number of digits are padded with a leading zero, so `0x1` is the same as `0x01`.

Strictly speaking, the type of a literal is more specific than shown here. See [Literal Types](#literal-types) below.

## Atom

The plain `Atom` type should be used when you don't care about the semantics of the value. Any other atom type can be assigned to `Atom` without requiring a cast, whereas a cast is required to go from `Atom` to anything else.

:::tip
In most cases, you should use a concrete atom type like `Bytes` instead of `Atom`, since it more clearly expresses the intent and prevents making mistakes.
:::

## Bytes

The `Bytes` type provides similar semantics to byte arrays or strings in other languages. If you add multiple `Bytes` values together, they will be concatenated. Other mathematical operations will yield a type error unless you cast to `Int` first. You should use `Bytes` when you don't know (or haven't checked) the length of the value.

There are a few ways to construct a value that is compatible with `Bytes`:

1. Hex literals - `0xCAFEF00D`
2. UTF-8 encoded string literals - `"Hello, world!"`
3. `nil`

You can also cast other atom types to `Bytes` when needed.

## Bytes32

The `Bytes32` type represents any `Bytes` value with a length of 32.

If a hex literal or string literal produces a value that is exactly 32 bytes, it will be compatible with this type automatically. However, if you have an atom with an unknown length, you will need to check the type first:

```rue
fn main(value: Bytes) -> Bytes32 {
    assert value is Bytes32;
    value
}
```

This will emit code at runtime to check that the value has a length of 32.

:::danger
`Bytes32` can only guarantee the length of trusted values. See the [Security](/docs/security.md#untrusted-values) page for more details.
:::

## String

The `String` type represents a UTF-8 encoded string. It's functionally equivalent to `Bytes` (and they can be assigned to each other without a cast), but provides a more descriptive name for working with text values, and hints to the compiler that the value is a string rather than a sequence of bytes (which is useful for error messages).

## PublicKey

The `PublicKey` type represents a [BLS12-381](https://en.wikipedia.org/wiki/BLS_digital_signature) public key (also commonly referred to as a G1 element).

An atom must be 48 bytes long to be compatible with `PublicKey`, although there is typically no harm done by not verifying the length at runtime before using it in conditions or BLS opcodes, as long as it's not directly concatenated with other bytes.

Public keys can be added, subtracted, negated, and multiplied by an `Int` with the [arithmetic operators](/docs/operators.md#arithmetic). The `INFINITY_G1` [builtin](/docs/builtins.md#constants) is the identity element.

## Signature

The `Signature` type represents a [BLS12-381](https://en.wikipedia.org/wiki/BLS_digital_signature) signature (also commonly referred to as a G2 element).

An atom must be 96 bytes long to be compatible with `Signature`, although there is typically no harm done by not verifying the length at runtime before using it in conditions or BLS opcodes, as long as it's not directly concatenated with other bytes.

Signatures support the same operators as public keys. The `INFINITY_G2` [builtin](/docs/builtins.md#constants) is the identity element.

## K1PublicKey

The `K1PublicKey` type represents a secp256k1 public key.

An atom must be 33 bytes long to be compatible with `K1PublicKey`, although there is typically no harm done by not verifying the length at runtime before using it in conditions or SECP opcodes, as long as it's not directly concatenated with other bytes.

## K1Signature

The `K1Signature` type represents a secp256k1 signature.

An atom must be 64 bytes long to be compatible with `K1Signature`, although there is typically no harm done by not verifying the length at runtime before using it in conditions or SECP opcodes, as long as it's not directly concatenated with other bytes.

## R1PublicKey

The `R1PublicKey` type represents a secp256r1 public key.

An atom must be 33 bytes long to be compatible with `R1PublicKey`, although there is typically no harm done by not verifying the length at runtime before using it in conditions or SECP opcodes, as long as it's not directly concatenated with other bytes.

## R1Signature

The `R1Signature` type represents a secp256r1 signature.

An atom must be 64 bytes long to be compatible with `R1Signature`, although there is typically no harm done by not verifying the length at runtime before using it in conditions or SECP opcodes, as long as it's not directly concatenated with other bytes.

## Int

The `Int` type represents any integer value, positive or negative. You can use arithmetic, bitwise, and comparison operators with integers.

You can construct a value that is compatible with `Int` by using integer literals such as `42`, as well as binary and octal literals.

You can also cast other atom types to `Int` when needed. For example, `0x05 as Int` is `5`.

:::warning
CLVM integers are stored as the shortest signed big-endian representation of their value. So a byte value like `0x00` or `0x80` is not the same as the integer `0` or `128` (which are `nil` and `0x0080` respectively). The `bytes_int_confusion` [lint](/docs/lints.md) warns when you cast a literal like this to `Int`.
:::

## Bool

`Bool` is simply a union of the literal values `true` and `false`. You can use logical operators with boolean values.

At runtime, `true` is represented as `1`, and `false` is represented as `nil`.

## Length

Every atom type has a `length` field (except for unions of atoms such as `Bool`, which need to be cast first), which returns the number of bytes in the value as an `Int`:

```rue
fn main(value: Bytes) -> Int {
    value.length
}
```

This compiles to the CLVM `strlen` operator.

## Representation

Because the various atom types differ solely by semantic meaning, there can be overlap in their CLVM representation. This is important to know when you need to differentiate between different values at runtime.

For example, the values `nil`, `false`, `0`, `""`, and `[]` all have the same runtime representation (even though each of them are semantically different and would require a cast to one another).

This is also why a type guard can't distinguish between `Int` and `nil`, since `0` and `nil` are the same value.

## Literal Types

In most languages, the type of literal values is general enough to cover all other values. For example, `42` would have the type `Int`. This is for a few reasons:

1. It allows for reassignment to variables whose type is inferred
2. It allows multiple branches of conditional expressions to have the same type
3. It prevents the type of object fields from being too strict

However, in Rue it's not possible to reassign to a variable, and we can use union types to alleviate some of the frustration that would be caused by a type being too specific.

Thus, every literal value has a corresponding type - for example, `42` has the type `42`. This can be surprising in some situations, but it's also important to make the language work. A literal type is assignable to its general type (such as `Int`), but not the other way around.

You can also write literal types yourself, which is useful for values that must be exactly one of a few options:

```rue
type Mode = 0 | 1 | 2;

fn main(mode: Mode) -> Bool {
    mode == 2
}
```

It allows for more efficient type checking, disambiguation of values at runtime, and preventing certain logic errors at compile time. For example, the `opcode` field of each [condition](/docs/standard-library.md#conditions) in the standard library has a literal type, which is how the type of a condition can be narrowed with a type guard.
