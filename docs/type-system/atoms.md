---
slug: /atoms
---

# Atoms

An atom is one of two fundamental data types in [CLVM](https://chialisp.com/clvm/). Put simply, atom values represent a sequence of bytes.

There are multiple types of atoms:

1. **Atom** - has no semantic meaning
2. **Bytes** - explicitly treated as bytes
3. **Bytes32** - a `Bytes` value with a length of 32
4. **PublicKey** - a [BLS12-381](https://en.wikipedia.org/wiki/BLS_digital_signature) public key with a length of 48 bytes
5. **Signature** - a [BLS12-381](https://en.wikipedia.org/wiki/BLS_digital_signature) signature with a length of 96 bytes
6. **K1PublicKey** - a secp256k1 public key with a length of 33 bytes
7. **K1Signature** - a secp256k1 signature with a length of 64 bytes
8. **R1PublicKey** - a secp256r1 public key with a length of 33 bytes
9. **R1Signature** - a secp256r1 signature with a length of 64 bytes
10. **Int** - a signed integer of arbitrary size
11. **Bool** - either `true` or `false`

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
assert value is Bytes32;
```

This will emit code at runtime to check that the value has a length of 32.

:::danger
`Bytes32` can only guarantee the length of trusted values. See the [Security](/docs/security.md#untrusted-values) page for more details.
:::

## PublicKey

The `PublicKey` type represents a [BLS12-381](https://en.wikipedia.org/wiki/BLS_digital_signature) public key (also commonly referred to as a G1 element).

An atom must be 48 bytes long to be compatible with `PublicKey`, although there is typically no harm done by not verifying the length at runtime before using it in conditions or BLS opcodes, as long as it's not directly concatenated with other bytes.

## Signature

The `Signature` type represents a [BLS12-381](https://en.wikipedia.org/wiki/BLS_digital_signature) signature (also commonly referred to as a G2 element).

An atom must be 96 bytes long to be compatible with `Signature`, although there is typically no harm done by not verifying the length at runtime before using it in conditions or BLS opcodes, as long as it's not directly concatenated with other bytes.

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

The `Int` type represents any integer value, positive or negative. You can use arithmetic and comparison operators with integers.

You can construct a value that is compatible with `Int` by using integer literals such as `42`.

You can also cast other atom types to `Int` when needed.

## Bool

`Bool` is simply a union of the literal values `true` and `false`. You can use logical operators with boolean values.

## Representation

Because the various atom types differ solely by semantic meaning, there can be overlap in their CLVM representation. This is important to know when you need to differentiate between different values at runtime.

For example, the values `nil`, `false`, `0`, `""`, and `[]` all have the same runtime representation (even though each of them are semantically different and would require a cast to one another).

## Value Types

In most languages, the type of literal values is general enough to cover all other values. For example, `42` would have the type `Int`. This is for a few reasons:

1. It allows for reassignment to variables whose type is inferred
2. It allows multiple branches of conditional expressions to have the same type
3. It prevents the type of object fields from being too strict

However, in Rue it's not possible to reassign to a variable, and we can use union types to alleviate some of the frustration that would be caused by a type being too specific.

Thus, every literal value has a corresponding type - for example, `42` has the type `42`. This can be surprising in some situations, but it's also important to make the language work.

It allows for more efficient type checking, disambiguation of values at runtime, and preventing certain logic errors at compile time.
