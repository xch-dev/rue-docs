---
slug: /builtins
---

# Builtins

There are a number of built-in types, functions, and constants. These are intrinsic to the language and are used to implement the [standard library](/docs/standard-library.md), but can and should also be used in your code. Unlike the standard library, builtins are always available, even with `std = false`.

Most builtin functions compile directly to a CLVM operator. They can only be called directly, rather than being used as a value.

A few builtins depend on which version of mainnet you target. `modpow` and `keccak256` are only available after hard fork 2, so they're an error unless the `hard_fork_2` [compiler option](/docs/projects.md#targeting-mainnet) is on (`hard_fork_2 = true` in `Rue.toml`, or `--hard-fork-2`). Until hard fork 2, mainnet also limits the length of the operands of some arithmetic builtins, which the `operand_limits` option targets (see [Operand Limits](#operand-limits)).

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
13. [**Never**](/docs/type-system/atoms.md#never)
14. [**Any**](/docs/type-system/pairs.md#any)
15. [**List**](/docs/type-system/pairs.md#lists)
16. [**AlternatingList**](/docs/type-system/pairs.md#alternating-lists)

## Constants

| Constant      | Type        | Description                                                       |
| ------------- | ----------- | ----------------------------------------------------------------- |
| `INFINITY_G1` | `PublicKey` | The BLS G1 point at infinity, which is the identity for addition. |
| `INFINITY_G2` | `Signature` | The BLS G2 point at infinity, which is the identity for addition. |

## Casting

### `unchecked_cast`

Changes the type of a value to the given type, without any checks. See [Unchecked Casts](/docs/type-system/casting.md#unchecked-casts).

```rue
fn main(value: Any) -> Int {
    unchecked_cast::<Int>(value)
}
```

## Hashing

### `sha256`

Calculates the [SHA-256](https://en.wikipedia.org/wiki/SHA-2) hash of the bytes provided.

```rue
fn main() -> Bytes32 {
    sha256("hello")
}
```

There's also a variant with the spread syntax that allows you to hash the concatenation of a list of values that is computed at runtime:

```rue
fn main(list: List<Bytes>) -> Bytes32 {
    sha256(...list)
}
```

This saves CLVM cost compared to concatenating the values first, since the `sha256` operator accepts multiple arguments.

### `sha256_inline`

The same as `sha256`, but it takes a single value rather than a spread, and the hash is calculated at compile time if the value is constant, and the result is inserted into the program. Its use is discouraged (because hard coding 32 bytes is costly in CLVM) unless you have a very large constant value that you want to avoid hashing at runtime. See also [Const Expressions](/docs/constants.md#const-expressions).

### `keccak256`

Calculates the [Keccak-256](https://en.wikipedia.org/wiki/SHA-3) hash of the bytes provided. Like `sha256`, it supports the spread syntax.

```rue hard_fork_2
fn main() -> Bytes32 {
    keccak256("hello")
}
```

Mainnet only has a `keccak256` operator after hard fork 2, so this needs the `hard_fork_2` [compiler option](/docs/projects.md#targeting-mainnet). Without it, use [`keccak256_verify`](#keccak256_verify) to check a hash instead.

### `keccak256_inline`

The same as `keccak256`, but it takes a single value rather than a spread, and it's calculated at compile time if the value is constant, like `sha256_inline`. It also needs `hard_fork_2`, even when the value is constant.

### `keccak256_verify`

Raises an error unless the Keccak-256 hash of a value is the given hash, and returns `nil` otherwise. Like the [verifications](#verifications), it can be called as a statement:

```rue
fn main(value: Bytes, hash: Bytes32) -> Bytes {
    keccak256_verify(value, hash);
    value
}
```

Unlike `keccak256`, this works before hard fork 2, since it's compiled to a check inside of a softfork guard, which mainnet can already run. With `hard_fork_2`, it's still compiled inside the softfork guard, so `assert keccak256(value) == hash;` does the same check more directly, and the `needless_keccak256_verify` [lint](/docs/lints.md) suggests writing it that way. The lint is allowed by default, and warns by default when `hard_fork_2` is on.

### `coinid`

Calculates the coin id of a coin from its parent coin id, puzzle hash, and amount. It uses a CLVM opcode that also checks that the parent coin id and puzzle hash are each 32 bytes long, and that the amount is a valid coin amount. See the [Security](/docs/security.md#untrusted-values) section for why this matters.

```rue
fn main(parent_coin_id: Bytes32, puzzle_hash: Bytes32, amount: Int) -> Bytes32 {
    coinid(parent_coin_id, puzzle_hash, amount)
}
```

## Bytes

### `concat`

Concatenates a list of `Bytes` values. This is what the `+` operator on bytes uses internally, but it's useful when the list is computed at runtime:

```rue
fn main(list: List<Bytes>) -> Bytes {
    concat(list)
}
```

To get a single byte or a range of bytes out of a value, index or slice it, such as `value[0]` or `value[1..4]`. See [Indexing and Slicing](/docs/type-system/atoms.md#indexing-and-slicing).

## Arithmetic

### `divmod`

Computes both `numerator / denominator` and `numerator % denominator` and returns a pair of the results:

```rue
fn main() -> Int {
    let (quotient, remainder) = divmod(50, 3);
    quotient + remainder
}
```

### `modpow`

Computes `(base ^ exponent) % modulus`. The base may be negative, the exponent must not be, and the modulus must not be `0`. Mainnet only enables `modpow` after hard fork 2, so it needs the `hard_fork_2` [compiler option](/docs/projects.md#targeting-mainnet):

```rue hard_fork_2
fn main() -> Int {
    modpow(5, 50, 45)
}
```

### `sum`, `difference`, `product`

Computes the sum, difference, or product of a list of `Int` values. These are what the `+`, `-`, and `*` operators use internally, but are useful when the list is computed at runtime:

```rue
fn main(list: List<Int>) -> Int {
    sum(list)
}
```

The `difference` of a list subtracts each of the rest of the values from the first one. The `sum` and `difference` of an empty list are `0`, and the `product` of an empty list is `1`.

These builtins, like `concat`, `any`, `all`, `g1_sum`, `g1_difference`, `g2_sum` and `g2_difference`, take the list itself as their only argument, so spreading it into them (`sum(...values)`) is an error. Pass the list as it is (`sum(values)`), or build one if you have separate values (`sum([first, ...rest])`). The compiler suggests both fixes.

### Operand Limits

Until hard fork 2, mainnet runs programs with a `LIMITS` flag, which makes some operators fail when an operand is too long (counting any leading zero bytes):

- `*` and `product` fail if an operand is longer than 256 bytes, or if the running product is longer than 1024 bytes.
- `/`, `%` and `divmod` fail if the dividend is longer than 256 bytes, or the divisor is longer than 1024 bytes.
- `modpow` fails if the base, exponent or modulus is longer than 256 bytes.
- Multiplying a `PublicKey` or `Signature` by an `Int` (`g1_multiply` and `g2_multiply` in CLVM) fails if the scalar is longer than 1024 bytes.

By default, Rue targets CLVM without `LIMITS`, so these operators are treated as unable to fail because of an operand's length (and `/`, `%` and `divmod` only fail when dividing by zero). A program compiled that way can pass its tests and still fail on mainnet before hard fork 2 when an operand exceeds a limit, and the optimizer may change whether a release build hits a limit. If your puzzle can be given long operands, turn on the `operand_limits` [compiler option](/docs/projects.md#targeting-mainnet) (`operand_limits = true` in `Rue.toml`, or `--operand-limits`). Then release builds fail under `LIMITS` exactly when debug builds do, and `rue test` runs with `LIMITS`. It can't be combined with `hard_fork_2`, which removes `LIMITS`.

### `any`, `all`

Returns whether any or all of a list of `Bool` values are `true`. These are what the `|` and `&` operators on booleans use internally.

## BLS

### `pubkey_for_exp`

Maps an exponent (secret key) to a G1 point (public key). The exponent can be an `Int`, or a `Bytes32` value which is interpreted as an integer:

```rue
fn main(secret_key: Bytes32) -> PublicKey {
    pubkey_for_exp(secret_key)
}
```

### `g1_sum`, `g1_difference`

Adds or subtracts a list of public keys. These are what the `+` and `-` operators on `PublicKey` use internally.

### `g2_sum`, `g2_difference`

Adds or subtracts a list of signatures. These are what the `+` and `-` operators on `Signature` use internally.

### `g1_map`

Hashes the data to a BLS public key, with SHA-256 and ExpandMsgXmd:

```rue
fn main() -> PublicKey {
    g1_map("hello")
}
```

You can also specify an optional DST (domain separation tag) parameter:

```rue
fn main() -> PublicKey {
    g1_map("hello", "dst")
}
```

### `g2_map`

Hashes the data to a BLS signature, with SHA-256 and ExpandMsgXmd. Like `g1_map`, it accepts an optional DST parameter:

```rue
fn main() -> Signature {
    g2_map("hello")
}
```

## Verifications

The following builtins return `nil` on success, and raise an error if they fail:

1. `bls_pairing_identity`
2. `bls_verify`
3. `secp256k1_verify`
4. `secp256r1_verify`

You can think of these like specialized `assert` statements, since they will raise if the verification fails, and continue on if not. They can be called as a statement.

The compiler will pick the most efficient way to insert these verifications into your program without disrupting its behavior at runtime. For example, references to `nil` after a verification can be replaced with the verification itself (since it returns `nil` anyways), and multiple verifications can be grouped together with the `all` operator.

### `bls_pairing_identity`

Accepts a flattened sequence of public key and signature pairs, and verifies that the pairing of all pairs is the identity. Otherwise, this will raise.

```rue
fn main(public_key: PublicKey, signature: Signature) {
    bls_pairing_identity(public_key, signature);
}
```

You can also spread an `AlternatingList<PublicKey, Signature>` instead:

```rue
fn main(pairs: AlternatingList<PublicKey, Signature>) {
    bls_pairing_identity(...pairs);
}
```

### `bls_verify`

Accepts a signature followed by a flattened sequence of public key and message pairs, and verifies that the aggregate signature is valid. Otherwise, this will raise.

```rue
fn main(signature: Signature, public_key: PublicKey, message: Bytes) {
    bls_verify(signature, public_key, message);
}
```

You can also spread an `AlternatingList<PublicKey, Bytes>` after the signature:

```rue
fn main(signature: Signature, pairs: AlternatingList<PublicKey, Bytes>) {
    bls_verify(signature, ...pairs);
}
```

### `secp256k1_verify`

Verifies a signature that uses the secp256k1 curve, given the public key, the message hash, and the signature:

```rue
fn main(public_key: K1PublicKey, message_hash: Bytes32, signature: K1Signature) {
    secp256k1_verify(public_key, message_hash, signature);
}
```

### `secp256r1_verify`

Verifies a signature that uses the secp256r1 curve, given the public key, the message hash, and the signature:

```rue
fn main(public_key: R1PublicKey, message_hash: Bytes32, signature: R1Signature) {
    secp256r1_verify(public_key, message_hash, signature);
}
```

With the `hard_fork_2` [compiler option](/docs/projects.md#targeting-mainnet), `secp256k1_verify` and `secp256r1_verify` are compiled to the 1-byte opcodes that hard fork 2 adds for them. Otherwise, they're compiled to the 4-byte opcodes that encode their cost. Both behave the same, but the 1-byte opcodes make the program shorter.
