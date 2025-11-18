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
4. [**String**](/docs/type-system/atoms.md#string)
5. [**PublicKey**](/docs/type-system/atoms.md#publickey)
6. [**Signature**](/docs/type-system/atoms.md#signature)
7. [**K1PublicKey**](/docs/type-system/atoms.md#k1publickey)
8. [**K1Signature**](/docs/type-system/atoms.md#k1signature)
9. [**R1PublicKey**](/docs/type-system/atoms.md#r1publickey)
10. [**R1Signature**](/docs/type-system/atoms.md#r1signature)
11. [**Int**](/docs/type-system/atoms.md#int)
12. [**Bool**](/docs/type-system/atoms.md#bool)
13. [**Any**](/docs/type-system/pairs.md#any)
14. [**List**](/docs/type-system/pairs.md#lists)
15. [**AlternatingList**](/docs/type-system/pairs.md#alternating-lists)

## Functions

### `sha256`

Calculates the [SHA-256](https://en.wikipedia.org/wiki/SHA-2) hash of the bytes provided. While this hashes the value at runtime, there is also a `sha256_inline` builtin that allows you to hash a constant value at compile time and insert the result into the program. Its use is discouraged (because hard coding 32 bytes is costly in CLVM) unless you have a very large constant value that you want to avoid hashing multiple times.

For example:

```rue
let hash = sha256("hello");
```

There's also a variant with the spread syntax that allows you to hash a list of arguments that is computed at runtime (rather than a static list):

```rue
let hash = sha256(...list);
```

Note that this prevents the compiler from being able to fold the arguments into a constant at compile time. However, it saves CLVM cost by not having to recursively concatenate the arguments.

### `keccak256`

Calculates the [Keccak-256](https://en.wikipedia.org/wiki/SHA-3) hash of the bytes provided. While this hashes the value at runtime, there is also a `keccak256_inline` builtin that allows you to hash a constant value at compile time and insert the result into the program. Its use is discouraged (because hard coding 32 bytes is costly in CLVM) unless you have a very large constant value that you want to avoid hashing multiple times.

For example:

```rue
let hash = keccak256("hello");
```

There's also a variant with the spread syntax that allows you to hash a list of arguments that is computed at runtime (rather than a static list):

```rue
let hash = keccak256(...list);
```

Note that this prevents the compiler from being able to fold the arguments into a constant at compile time. However, it saves CLVM cost by not having to recursively concatenate the arguments.

### `coinid`

A builtin CLVM opcode for hashing the parent coin id, puzzle hash, and amount of a coin into its coin id. See the [Security](/docs/security.md#untrusted-values) section for an explanation of why this opcode exists. Essentially, it adds runtime checks to make sure that the length of the parent coin id and puzzle hash are 32.

For example:

```rue
coinid(parent_coin_id, puzzle_hash, amount)
```

### `substr`

Returns a substring of a byte value, given a range of indices. Note that if either index is out of bounds, this will raise an error.

For example:

```rue
substr("hello", 1, 4)
```

This would return `"ell"`

The end index is optional, and defaults to the length of the string:

```rue
substr("hello", 1)
```

### `g1_map`

Hashes the data to a BLS public key, with sha256 and ExpandMsgXmd.

For example:

```rue
g1_map("hello")
```

You can also specify an optional DST parameter:

```rue
g1_map("hello", "dst")
```

### `g2_map`

Hashes the data to a BLS signature, with sha256 and ExpandMsgXmd.

For example:

```rue
g2_map("hello")
```

You can also specify an optional DST parameter:

```rue
g2_map("hello", "dst")
```

### `pubkey_for_exp`

Maps an exponent (secret key) to a G1 point (public key).

For example:

```rue
pubkey_for_exp("hello")
```

### `modpow`

Computes `(base ^ exponent) % modulus`. Base may be negative, exponent must not be, modulus must not be 0.

For example:

```rue
modpow(5, 50, 45)
```

### `divmod`

Computes both `numerator / denominator` and `numerator % denominator` and returns a pair of the results.

For example:

```rue
let (quotient, remainder) = divmod(50, 3);
```

## Operator Optimizations

Similarly to [sha256](#sha256) and [keccak256](#keccak256), the following builtin functions are provided to optimize the use of operators on lists of arguments:

1. `concat` (the `+` operator on bytes)
2. `sum` (the `+` operator on integers)
3. `difference` (the `-` operator on integers)
4. `product` (the `*` operator on integers)
5. `any` (the `|` operator on booleans)
6. `all` (the `&` operator on booleans)
7. `g1_sum` (the `+` operator on BLS public keys)
8. `g1_difference` (the `-` operator on BLS public keys)
9. `g2_sum` (the `+` operator on BLS signatures)
10. `g2_difference` (the `-` operator on BLS signatures)

## Verifications

The following CLVM operators return `nil` on success, and raise if they fail:

1. `bls_pairing_identity`
2. `bls_verify`
3. `secp256k1_verify`
4. `secp256r1_verify`

You can think of these like specialized `assert` statements, since they will raise if the verification fails, and continue on if not. Rue provides these as builtin functions that can be called as a statement.

These are automatically optimized such that ordinary references to `nil` after the verification statements in the block are replaced with the verification expression (since it returns `nil` anyways). If there aren't any possible substitutions, the rest of the block will be wrapped in a cons pair, with the verifications happening first, and then unwrapped back into the expression value of the block. And finally, if multiple verifications need to be done in a group, the `all` operator will be used, since it will always return `nil` as well.

All of this is to say that the compiler will pick the most efficient way to insert these verifications into your program without disrupting its behavior at runtime.

### `bls_pairing_identity`

Accepts a flattened sequence of public key and signature pairs, and verifies that the pairing of all pairs is the identity. Otherwise, this will raise.

For example:

```rue
bls_pairing_identity(
    0xa3050a67e4771030dade87560e175206a1a93c44461619de07a4e50bfe11ef80f8eaa4956f4648b7ff26c6551dd6ee90,
    0xa6242cc5b80eb338a96b41035738eb9973d2c0f892fc52e47e55fc288da1a595a3577b0f995be3d2f4ff71b1948181840e95e79f176f657ade50780f1d77179e82133987025bdeaf37b0052c7dee524a17746b3270eb18a18701ab8157049734,
    0xae0154514ac83b8efea5b2eee425fc41ead032bb04b8a977eff85e80f9dd8940833c0d7d85921bf18fe84f639f417cca,
    0xa446e176d5aba64e9714fab391b917ea6be087e3d11c5b6bf1fa15d87bf267cfc8dbd479cd2f5a94b78f4ca9aa77850810078fb439e70559c2ea0bbddc5a1b749f5d50a6b466adb1ccd67a62a351997b9a81309b3bddff6168051dc74432d5d5,
    0xb066ce9e6484fe574ed55003449fae4d08652f85de45d718c2397c667cd80ed5571458d58c7d28b101ab1ef986973e77,
    0x8708f12e05766a8ecbba88e978b9236d4bf998b33f6924258ec9a333190df64a050fe15b9085608c2277f032845c523e16cc1d2dbd4457cd431d18b1419fe45a098205482ee4d41915506f2687778103f32f3cac3ce6cca176d002fffd756860,
    0xb7f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6bb,
    0xac168cd0efa5188f370bbe566dfbbb8c8c69a985e7cad8eed7b136ebdcd6338f1d5781e8fd340963fa96a5704a3b7b15046be60b3d17ec1f962191e90b39b36b5ff81548e0baf6f6564f83dbe50258df62f271fdba7a042ed530eeb6a15b794c,
);
```

You can use the spread syntax to verify a list of pairs.

### `bls_verify`

Accepts a signature followed by a flattened sequence of public key and message pairs, and verifies that the aggregate signature is valid. Otherwise, this will raise.

For example:

```rue
bls_verify(
    0x80c37921e62092ef55f85f9eccb21bd80cfaafc0bce9cbdd6999b1a8cabadc8f23720f0261efafaf53cbcc74580b9432007b66d824668900a94934f184bc41bf9ccf9ec141c6f7da610aa7296cd0a181ae8fe176b607aa4c367f15ee0cb985d7,
    0x8b202593319bce41b090f3309986de59861ab1e2ff32aef871d83f9aac232c7253c01f1f649c6f69879c441286319de4,
    0x39cb1950dba19a7bee9924b5bd2b29f190ffe4ef,
);
```

You can use the spread syntax to verify a list of pairs.

### `secp256k1_verify`

Verifies a signature that uses the secp256r1 curve against its message hash and signature.

For example:

```rue
secp256k1_verify(
    0x02390b19842e100324163334b16947f66125b76d4fa4a11b9ccdde9b7398e64076,
    0x85932e4d075615be881398cc765f9f78204033f0ef5f832ac37e732f5f0cbda2,
    0x481477e62a1d02268127ae89cc58929e09ad5d30229721965ae35965d098a5f630205a7e69f4cb8084f16c7407ed7312994ffbf87ba5eb1aee16682dd324943e,
);

```

### `secp256r1_verify`

Verifies a signature that uses the secp256r1 curve against its message hash and signature.

For example:

```rue
secp256r1_verify(
    0x033e1a1b2ccbc35883c60fdfc3f4a02175096ade6271fe85517ca5772594bbd0dc,
    0x85932e4d075615be881398cc765f9f78204033f0ef5f832ac37e732f5f0cbda2,
    0xeae2f488080919bd0a7069c24cdd9c6ce2db423861b0c9d4236cdadbd0005f6d8f3709e6eb19249fd9c8bea664aba35218e67ea4b0f2239488dc3147f336e1e6,
);
```
