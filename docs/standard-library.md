---
slug: /standard-library
---

# Standard Library

Rue comes with a standard library, which is written in Rue itself. It provides types for the conditions a puzzle can output, functions for tree hashing and currying, and other common utilities.

The standard library is included by default, and can be disabled by setting `std = false` in the [`Rue.toml`](/docs/projects.md#compiler) manifest. Like any other code, only the parts you use are included in the compiled program.

## Prelude

The items most commonly used in puzzles are in the prelude, which is available in every file without importing anything. This includes all of the [conditions](#conditions), [condition opcodes](#opcodes), [message flags](#message-flags), [tree hashing](#tree-hashing) functions, [merkle proofs](#merkle-proofs), [list functions](#lists), and [utilities](#utilities).

## Modules

Everything in the standard library can also be referenced with a path through the `std` module, including a few modules that aren't part of the prelude:

| Module                 | Contents                                                             |
| ---------------------- | -------------------------------------------------------------------- |
| `std::conditions`      | The `types`, `opcodes` and `message_flags` modules for conditions.   |
| `std::tree_hash`       | `tree_hash`, `tree_hash_atom`, and `tree_hash_pair`.                 |
| `std::curry_tree_hash` | `curry_tree_hash`.                                                   |
| `std::list`            | `length`, `reverse`, and `contains`.                                 |
| `std::merkle`          | `MerkleProof`, `calculate_merkle_root`, and `simplify_merkle_proof`. |
| `std::utils`           | `deep_equal`.                                                        |
| `std::offer`           | `NotarizedPayment` and `Payment`, for settlement payments in offers. |
| `std::singleton`       | `SingletonStruct` and the singleton lineage proofs.                  |

For example:

```rue
import std::singleton::LineageProof;

fn main(proof: LineageProof) -> Int {
    proof.parent_amount
}
```

## Conditions

A puzzle outputs a list of conditions, which tell the blockchain what the spend should do (such as creating coins) and what must be true for the spend to be valid (such as signatures and announcements). The standard library defines them as variants of the `Condition` [enum](/docs/type-system/enums.md), whose discriminants are the condition opcodes.

The variants are also exported by their own names, so `CreateCoin { ... }` is the same as `Condition::CreateCoin { ... }`. For example, this puzzle requires a signature on the conditions, and then outputs them:

```rue
fn main(public_key: PublicKey, conditions: List<Condition>) -> List<Condition> {
    let agg_sig = AggSigMe { public_key, message: tree_hash(conditions) };
    [agg_sig, ...conditions]
}
```

Since each condition is a variant, you don't need to specify its opcode when creating one, and you can tell the conditions apart with a [type guard](/docs/type-system/guards.md) or a [`match`](/docs/match.md). A `match` over a `Condition` has to handle every variant, or have a `_` arm for the rest:

```rue
fn spent_amount(conditions: List<Condition>) -> Int {
    for condition in conditions fold total = 0 {
        match condition {
            CreateCoin { amount } => total + amount,
            ReserveFee { amount } => total + amount,
            _ => total,
        }
    }
}

test fn spent() {
    let conditions = [
        CreateCoin { puzzle_hash: sha256("puzzle"), amount: 100 },
        ReserveFee { amount: 5 },
        AssertMyAmount { amount: 105 },
    ];
    assert spent_amount(conditions) == 105;
}
```

The opcode isn't a field of the condition. If you need it, such as to handle raw conditions, cast the condition to a pair and read the first part:

```rue
fn opcode(condition: Condition) -> Int {
    let (opcode, _) = condition as (Int, Any);
    opcode
}

test fn opcodes() {
    assert opcode(ReserveFee { amount: 1 }) == RESERVE_FEE;
}
```

These are the variants, with their opcodes and fields:

| Variant                       | Opcode | Fields                                                                |
| ----------------------------- | ------ | --------------------------------------------------------------------- |
| `Remark`                      | `1`    | `...rest: Any = nil`                                                  |
| `AggSigParent`                | `43`   | `public_key: PublicKey`, `message: Bytes`                             |
| `AggSigPuzzle`                | `44`   | `public_key: PublicKey`, `message: Bytes`                             |
| `AggSigAmount`                | `45`   | `public_key: PublicKey`, `message: Bytes`                             |
| `AggSigPuzzleAmount`          | `46`   | `public_key: PublicKey`, `message: Bytes`                             |
| `AggSigParentAmount`          | `47`   | `public_key: PublicKey`, `message: Bytes`                             |
| `AggSigParentPuzzle`          | `48`   | `public_key: PublicKey`, `message: Bytes`                             |
| `AggSigUnsafe`                | `49`   | `public_key: PublicKey`, `message: Bytes`                             |
| `AggSigMe`                    | `50`   | `public_key: PublicKey`, `message: Bytes`                             |
| `CreateCoin`                  | `51`   | `puzzle_hash: Bytes32`, `amount: Int`, `...memos: Memos \| nil = nil` |
| `ReserveFee`                  | `52`   | `amount: Int`                                                         |
| `CreateCoinAnnouncement`      | `60`   | `message: Bytes`                                                      |
| `AssertCoinAnnouncement`      | `61`   | `id: Bytes32`                                                         |
| `CreatePuzzleAnnouncement`    | `62`   | `message: Bytes`                                                      |
| `AssertPuzzleAnnouncement`    | `63`   | `id: Bytes32`                                                         |
| `AssertConcurrentSpend`       | `64`   | `coin_id: Bytes32`                                                    |
| `AssertConcurrentPuzzle`      | `65`   | `puzzle_hash: Bytes32`                                                |
| `SendMessage`                 | `66`   | `mode: Int`, `message: Bytes`, `...receiver: List<Bytes \| Int>`      |
| `ReceiveMessage`              | `67`   | `mode: Int`, `message: Bytes`, `...sender: List<Bytes \| Int>`        |
| `AssertMyCoinId`              | `70`   | `coin_id: Bytes32`                                                    |
| `AssertMyParentId`            | `71`   | `parent_id: Bytes32`                                                  |
| `AssertMyPuzzleHash`          | `72`   | `puzzle_hash: Bytes32`                                                |
| `AssertMyAmount`              | `73`   | `amount: Int`                                                         |
| `AssertMyBirthSeconds`        | `74`   | `seconds: Int`                                                        |
| `AssertMyBirthHeight`         | `75`   | `height: Int`                                                         |
| `AssertEphemeral`             | `76`   | None                                                                  |
| `AssertSecondsRelative`       | `80`   | `seconds: Int`                                                        |
| `AssertSecondsAbsolute`       | `81`   | `seconds: Int`                                                        |
| `AssertHeightRelative`        | `82`   | `height: Int`                                                         |
| `AssertHeightAbsolute`        | `83`   | `height: Int`                                                         |
| `AssertBeforeSecondsRelative` | `84`   | `seconds: Int`                                                        |
| `AssertBeforeSecondsAbsolute` | `85`   | `seconds: Int`                                                        |
| `AssertBeforeHeightRelative`  | `86`   | `height: Int`                                                         |
| `AssertBeforeHeightAbsolute`  | `87`   | `height: Int`                                                         |
| `Softfork`                    | `90`   | `cost: Int`, `...args: List<Any>`                                     |

A condition without fields, such as `AssertEphemeral`, is declared with empty braces, so it's written as `AssertEphemeral {}`, like the others.

The memos of a `CreateCoin` condition are wrapped in a `Memos` struct, which has a single `value: Any` field:

```rue
fn main(puzzle_hash: Bytes32) -> CreateCoin {
    CreateCoin { puzzle_hash, amount: 1, memos: Memos { value: [puzzle_hash] } }
}
```

See the [Chia documentation](https://docs.chia.net/conditions/) for what each condition does.

### Opcodes

The opcode of each condition is also available as a constant, named in `SCREAMING_SNAKE_CASE` (such as `CREATE_COIN`, which is `51`). This is useful when working with raw conditions.

### Message Flags

The `mode` of a `SendMessage` or `ReceiveMessage` condition specifies which parts of the sender and receiver coins are committed to. The following constants can be combined with the `|` operator:

| Constant          | Value      |
| ----------------- | ---------- |
| `SENDER_COIN`     | `0b111000` |
| `SENDER_PARENT`   | `0b100000` |
| `SENDER_PUZZLE`   | `0b010000` |
| `SENDER_AMOUNT`   | `0b001000` |
| `RECEIVER_COIN`   | `0b000111` |
| `RECEIVER_PARENT` | `0b000100` |
| `RECEIVER_PUZZLE` | `0b000010` |
| `RECEIVER_AMOUNT` | `0b000001` |

For example:

```rue
fn main(puzzle_hash: Bytes32) -> SendMessage {
    SendMessage { mode: SENDER_COIN | RECEIVER_PUZZLE, message: "hello", receiver: [puzzle_hash] }
}
```

## Tree Hashing

The tree hash of a value is the standard way to hash CLVM values, and the tree hash of a program is its puzzle hash.

| Function                                                   | Description                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `tree_hash(value: Any) -> Bytes32`                         | Computes the tree hash of any value, recursively.                              |
| `tree_hash_atom(value: Bytes) -> Bytes32`                  | Computes the tree hash of an atom.                                             |
| `tree_hash_pair(first: Bytes32, rest: Bytes32) -> Bytes32` | Computes the tree hash of a pair, given the tree hashes of its first and rest. |

If you already know that a value is an atom, or have the tree hashes of the values in a pair, `tree_hash_atom` and `tree_hash_pair` are much cheaper than `tree_hash`.

### Currying

`curry_tree_hash(mod_hash: Bytes32, parameters: List<Bytes32>) -> Bytes32` computes the puzzle hash of a program with the given parameters curried in, given the tree hash of the program and the tree hash of each parameter.

This is how a puzzle can calculate the puzzle hash of another puzzle (or a new version of itself), without needing to reveal the whole program:

```rue
fn main(mod_hash: Bytes32, owner: Bytes32) -> Bytes32 {
    curry_tree_hash(mod_hash, [tree_hash_atom(mod_hash), tree_hash_atom(owner)])
}
```

## Merkle Proofs

| Item                                                                                                  | Description                                                                        |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `MerkleProof`                                                                                         | A struct with a `path: Int`, followed by the list of sibling `hashes` up the tree. |
| `calculate_merkle_root(path: Int, current_hash: Bytes32, additional_steps: List<Bytes32>) -> Bytes32` | Computes the root of a merkle tree, given the hash of a node and its siblings.     |
| `simplify_merkle_proof(leaf: Bytes32, proof: MerkleProof) -> Bytes32`                                 | Computes the root of a merkle tree, given a leaf value and a proof.                |

## Lists

| Function                                           | Description                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------- |
| `length<T>(list: List<T>) -> Int`                  | Returns the number of items in the list.                          |
| `reverse<T>(list: List<T>) -> List<T>`             | Returns the items of the list in the opposite order.              |
| `contains(list: List<Bytes>, item: Bytes) -> Bool` | Returns whether any item of the list is equal to `item`, by `==`. |

Each of these walks the whole list, so its cost grows with the length of the list. `contains` compares atoms, so it works with lists of `Bytes`, `Bytes32` and `String`, but a list of `Int` needs a cast, as in `contains(values as List<Bytes>, 2 as Bytes)`. Lists are joined with [spreads](/docs/type-system/pairs.md#lists), as in `[...a, ...b]`, and most other list operations are a [`for` expression](/docs/loops.md).

```rue
test fn lists() {
    let hashes = [sha256("a"), sha256("b")];
    assert length(hashes) == 2;
    assert contains(hashes, sha256("b"));
    assert deep_equal(reverse([1, 2, 3]), [3, 2, 1]);
}
```

If your program defines its own function with the same name as one of these, such as `contains`, its own function is used instead.

## Utilities

| Function                             | Description                                                         |
| ------------------------------------ | ------------------------------------------------------------------- |
| `deep_equal(a: Any, b: Any) -> Bool` | Returns whether two values are structurally equal, including pairs. |

## Offers

The `std::offer` module contains types for the settlement payments puzzle, which is used by offers:

| Struct             | Fields                                                          |
| ------------------ | --------------------------------------------------------------- |
| `NotarizedPayment` | `nonce: Bytes32`, `...payments: List<Payment>`                  |
| `Payment`          | `puzzle_hash: Bytes32`, `amount: Int`, `...memos: Memos \| nil` |

## Singletons

The `std::singleton` module contains types used by the singleton puzzle:

| Item              | Description                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `SingletonStruct` | The singleton's `mod_hash`, `launcher_id`, and `...launcher_puzzle_hash`.                                                  |
| `LineageProof`    | Proves the parent was the same singleton, with `parent_parent_coin_info`, `parent_inner_puzzle_hash`, and `parent_amount`. |
| `EveProof`        | Proves the parent was the launcher, with `parent_parent_coin_info` and `parent_amount`.                                    |
| `Proof`           | A union of `LineageProof` and `EveProof`.                                                                                  |

See the [singleton example](https://github.com/xch-dev/rue/blob/main/examples/puzzles/singleton.rue) for how these are used.
