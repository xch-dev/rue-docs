---
slug: /builtins
---

# Builtins

There are a number of built-in functions and types. These are intrinsic to the language and are used to implement the standard library, but can and should also be used in your code.

## Types

You can click on each of these types to go to their corresponding page and learn more:

1. [**Atom**](/docs/type-system/atoms.md#atom)
2. [**Bytes**](/docs/type-system/atoms.md#bytes)
3. [**Bytes32**](/docs/type-system/atoms.md#bytes32)
4. [**PublicKey**](/docs/type-system/atoms.md#publickey)
5. [**Int**](/docs/type-system/atoms.md#int)
6. [**Bool**](/docs/type-system/atoms.md#bool)
7. [**Any**](/docs/type-system/pairs.md#any)
8. [**List**](/docs/type-system/pairs.md#lists)

## Functions

### `sha256`

Calculates the [SHA-256](https://en.wikipedia.org/wiki/SHA-2) hash of the bytes provided. This hash is calculated at runtime.

For example:

```rue
let hash = sha256("hello");
```

### `sha256_inline`

The same as `sha256`, except the value will be calculated at compile time and inserted into the program. In some rare scenario, this may be an important optimization to avoid hashing the same large constant value many times. However, in most cases, you should just use the regular `sha256` function.

For example:

```rue
let hash = sha256_inline("hello");
```

### `calculate_coin_id`

A builtin CLVM opcode for hashing the parent coin id, puzzle hash, and amount of a coin into its coin id. See the [Security](/docs/security.md#untrusted-values) section for an explanation of why this opcode exists. Essentially, it adds runtime checks to make sure that the length of the parent coin id and puzzle hash are 32.

For example:

```rue
calculate_coin_id(parent_coin_id, puzzle_hash, amount)
```

### `substr`

Returns a substring of a byte value, given a range of indices.

For example:

```rue
substr("hello", 1, 4)
```

This would return `"ell"`
