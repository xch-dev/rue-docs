# Signature Puzzle

In this tutorial, we'll create a puzzle that locks coins with a public key and requires a signature from the corresponding secret key to be spent.

Before we get started, make sure you have [installed Rue](/docs/installation.md) and Rust.

This was last tested with the following versions:

- **Rue**: 0.6.0
- **Wallet SDK**: 0.32.0

:::info
This is for educational purposes only. While it's secure, there are standard puzzles that accomplish the same thing (with more interoperability with wallets).
:::

## BLS Signatures

In the previous tutorial, we showed how to lock up a coin (albeit insecurely) with a password. If you think about it, what we really wanted to do is prove that we own the coin without giving away the password required to spend it.

This is what BLS signatures are for. You have a secret key that you don't share with anyone else, and a public key that's stored on the blockchain publicly. You can create signatures using the secret key, to prove ownership of the public key without revealing the secret key. This also lets you prevent anyone else from changing the output of the transaction, since you can sign a specific message (in this case, the hash of the conditions).

## Creating the Puzzle

First, we'll create a new project:

```bash
rue init
```

Open it in your editor of choice. You should see a `puzzles` directory with a `main.rue` file containing a simple "hello world" program.

You can replace the contents of `main.rue` with the following:

```rue
fn main(
    public_key: PublicKey,
    conditions: List<Condition>,
) -> List<Condition> {
    let agg_sig = AggSigMe {
        public_key,
        message: tree_hash(conditions),
    };

    [agg_sig, ...conditions]
}
```

This program will prepend the list of conditions with an `AGG_SIG_ME` condition. The Chia blockchain's consensus rules will use this to verify that the curried public key has signed off on the hash of the list of conditions. If the conditions are altered, or if the spend doesn't include a valid signature, it will be invalid.

## Setup the Simulator

To test out our puzzle in a simulator, we can setup a Rust project and the [Chia Wallet SDK](https://crates.io/crates/chia-wallet-sdk).

Create a new Rust project in the same directory:

```bash
cargo init --lib
```

And install a couple dependencies:

```bash
cargo add chia-wallet-sdk anyhow
```

Clear the contents of `lib.rs` and define the curried argument type and solution type for the puzzle as structs:

```rust
use chia_wallet_sdk::prelude::*;

#[derive(Debug, Clone, ToClvm, FromClvm)]
#[clvm(curry)]
pub struct SignatureArgs {
    pub public_key: PublicKey,
}

#[derive(Debug, Clone, ToClvm, FromClvm)]
#[clvm(list)]
pub struct SignatureSolution<T> {
    pub conditions: Conditions<T>,
}

compile_rue!(SignatureArgs = SIGNATURE_MOD, ".");
```

This is going to automatically compile `SIGNATURE_MOD` every time we run the Rust code. In production, we'd usually hard code the serialized puzzle and its hash, but this is a shortcut to make development easier.

Now we can start writing a test below:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    use anyhow::Result;

    #[test]
    fn test_signature() -> Result<()> {
        // Test will go here

        Ok(())
    }
}
```

Let's fill this in. Start by creating a `SpendContext` and `Simulator` so that we can create and spend coins in a simulated environment:

```rust
let mut ctx = SpendContext::new();
let mut sim = Simulator::new();
```

Then we want to create a standard coin that we can spend in order to create our custom signature coin:

```rust
let alice = sim.bls(1);
let alice_p2 = StandardLayer::new(alice.pk);
```

Then we'll curry the puzzle with the public key we want to lock the coin with and create a coin with its puzzle hash:

```rust
let puzzle = ctx.curry(SignatureArgs {
    public_key: alice.pk,
})?;

let puzzle_hash = ctx.tree_hash(puzzle).into();

alice_p2.spend(
    &mut ctx,
    alice.coin,
    Conditions::new().create_coin(puzzle_hash, 1, Memos::None),
)?;

let coin = Coin::new(alice.coin.coin_id(), puzzle_hash, 1);
```

Now that we have a coin with the signature puzzle, we can construct a solution and spend it. In this case, let's just send a coin back to Alice:

```rust
let solution = ctx.alloc(&SignatureSolution {
    conditions: Conditions::new().create_coin(alice.puzzle_hash, 1, Memos::None),
})?;

ctx.spend(coin, Spend::new(puzzle, solution))?;
```

To complete the test, we should actually execute the transactions on the simulator:

```rust
sim.spend_coins(ctx.take(), &[alice.sk])?;
```

If everything worked, you should be able to run `cargo test` and see the test pass! Conveniently, the generation of signatures is handled by `spend_coins` automatically. In an actual application, you will most likely have to handle this yourself.

<details>
  <summary>Checkpoint (lib.rs)</summary>

Putting it all together, we get:

```rust title="lib.rs"
use chia_wallet_sdk::prelude::*;

#[derive(Debug, Clone, ToClvm, FromClvm)]
#[clvm(curry)]
pub struct SignatureArgs {
    pub public_key: PublicKey,
}

#[derive(Debug, Clone, ToClvm, FromClvm)]
#[clvm(list)]
pub struct SignatureSolution<T> {
    pub conditions: Conditions<T>,
}

compile_rue!(SignatureArgs = SIGNATURE_MOD, ".");

#[cfg(test)]
mod tests {
    use super::*;

    use anyhow::Result;

    #[test]
    fn test_signature() -> Result<()> {
        let mut ctx = SpendContext::new();
        let mut sim = Simulator::new();

        let alice = sim.bls(1);
        let alice_p2 = StandardLayer::new(alice.pk);

        let puzzle = ctx.curry(SignatureArgs {
            public_key: alice.pk,
        })?;

        let puzzle_hash = ctx.tree_hash(puzzle).into();

        alice_p2.spend(
            &mut ctx,
            alice.coin,
            Conditions::new().create_coin(puzzle_hash, 1, Memos::None),
        )?;

        let coin = Coin::new(alice.coin.coin_id(), puzzle_hash, 1);

        let solution = ctx.alloc(&SignatureSolution {
            conditions: Conditions::new().create_coin(alice.puzzle_hash, 1, Memos::None),
        })?;

        ctx.spend(coin, Spend::new(puzzle, solution))?;

        sim.spend_coins(ctx.take(), &[alice.sk])?;

        Ok(())
    }
}
```

</details>

## Delegated Puzzles

The previous example is perfectly secure, and is a variation of a standard Chialisp puzzle known as [p2_delegated_conditions](https://github.com/Chia-Network/chia_puzzles/blob/main/puzzles/p2_delegated_conditions.clsp). The term "delegated" means that you are delegating the output of the transaction to something else. In this case, a list of conditions.

In most cases this is sufficient. However, sometimes you want to sign an arbitrary puzzle (which could still just be a list of conditions if desired) which can be spent in multiple ways, to give more flexibility to whoever submits the final spend bundle. You can use a delegated puzzle to do this.

So, we can modify the puzzle in `main.rue` to use a delegated puzzle instead:

```rue
fn main(
    public_key: PublicKey,
    delegated_puzzle: fn(...solution: Any) -> List<Condition>,
    delegated_solution: Any,
) -> List<Condition> {
    let agg_sig = AggSigMe {
        public_key,
        message: tree_hash(delegated_puzzle),
    };

    let conditions = delegated_puzzle(...delegated_solution);

    [agg_sig, ...conditions]
}
```

You're essentially passing both a delegated puzzle and its solution into the solution of the main puzzle. The output of the delegated puzzle is the conditions, like before, but the tree hash of the delegated puzzle itself is what is being signed.

Next, let's update the Rust code to match. First, update the solution struct:

```rust
#[derive(Debug, Clone, ToClvm, FromClvm)]
#[clvm(list)]
pub struct SignatureSolution<P, S> {
    pub delegated_puzzle: P,
    pub delegated_solution: S,
}
```

And you'll need to construct a delegated spend and pass it into the solution instead of the conditions themselves:

```rust
let delegated_spend =
    ctx.delegated_spend(Conditions::new().create_coin(alice.puzzle_hash, 1, Memos::None))?;

let solution = ctx.alloc(&SignatureSolution {
    delegated_puzzle: delegated_spend.puzzle,
    delegated_solution: delegated_spend.solution,
})?;
```

If you run `cargo test`, the test should still pass. Now we have a variation of the standard Chialisp [p2_delegated_puzzle](https://github.com/Chia-Network/chia_puzzles/blob/55896b5c40de85e557871d526d56d366c6534dac/puzzles/p2_delegated_puzzle.clsp).

<details>
  <summary>Checkpoint (lib.rs)</summary>

Putting it all together, we get:

```rust title="lib.rs"
use chia_wallet_sdk::prelude::*;

#[derive(Debug, Clone, ToClvm, FromClvm)]
#[clvm(curry)]
pub struct SignatureArgs {
    pub public_key: PublicKey,
}

#[derive(Debug, Clone, ToClvm, FromClvm)]
#[clvm(list)]
pub struct SignatureSolution<P, S> {
    pub delegated_puzzle: P,
    pub delegated_solution: S,
}

compile_rue!(SignatureArgs = SIGNATURE_MOD, ".");

#[cfg(test)]
mod tests {
    use super::*;

    use anyhow::Result;

    #[test]
    fn test_signature() -> Result<()> {
        let mut ctx = SpendContext::new();
        let mut sim = Simulator::new();

        let alice = sim.bls(1);
        let alice_p2 = StandardLayer::new(alice.pk);

        let puzzle = ctx.curry(SignatureArgs {
            public_key: alice.pk,
        })?;

        let puzzle_hash = ctx.tree_hash(puzzle).into();

        alice_p2.spend(
            &mut ctx,
            alice.coin,
            Conditions::new().create_coin(puzzle_hash, 1, Memos::None),
        )?;

        let coin = Coin::new(alice.coin.coin_id(), puzzle_hash, 1);

        let delegated_spend =
            ctx.delegated_spend(Conditions::new().create_coin(alice.puzzle_hash, 1, Memos::None))?;

        let solution = ctx.alloc(&SignatureSolution {
            delegated_puzzle: delegated_spend.puzzle,
            delegated_solution: delegated_spend.solution,
        })?;

        ctx.spend(coin, Spend::new(puzzle, solution))?;

        sim.spend_coins(ctx.take(), &[alice.sk])?;

        Ok(())
    }
}
```

</details>
