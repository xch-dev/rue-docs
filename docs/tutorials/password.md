# Password Puzzle

In this tutorial, we'll create a simple password puzzle that can be solved by providing the correct password. This is a great way to learn the basics of Rue, dip your toes in the coin set model, and actually create and spend a coin on the Chia blockchain.

Before we get started, make sure you have [installed Rue](/docs/installation.md) and Rust.

This was last tested with the following versions:

- **Rue**: 0.6.0
- **Wallet SDK**: 0.32.0

:::warning
This is for educational purposes only. It's not secure enough to be used in production, so we'll be using a local simulator instead.
:::

## Creating the Puzzle

First, we'll create a new project:

```bash
rue init
```

Open it in your editor of choice. You should see a `puzzles` directory with a `main.rue` file containing a simple "hello world" program.

You can replace the contents of `main.rue` with the following:

```rue
fn main(
    correct_password: String,
    password: String,
    conditions: List<Condition>,
) -> List<Condition> {
    assert password == correct_password;

    conditions
}
```

This program will check if the `password` is equal to the `correct_password`, and if it is, it will return the provided `conditions`. Otherwise, it will raise an error.

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

Clear the contents of `lib.rs` in the `src` directory, and define the curried argument type and solution type for the puzzle as structs:

```rust
use chia_wallet_sdk::prelude::*;

#[derive(Debug, Clone, ToClvm, FromClvm)]
#[clvm(curry)]
pub struct PasswordArgs {
    pub correct_password: String,
}

#[derive(Debug, Clone, ToClvm, FromClvm)]
#[clvm(list)]
pub struct PasswordSolution<T> {
    pub password: String,
    pub conditions: Conditions<T>,
}

compile_rue!(PasswordArgs = PASSWORD_MOD, ".");
```

This is going to automatically compile `PASSWORD_MOD` every time we run the Rust code. In production, we'd usually hard code the serialized puzzle and its hash, but this is a shortcut to make development easier.

Now we can start writing a test below:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    use anyhow::Result;

    #[test]
    fn test_password() -> Result<()> {
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

Then we want to create a standard coin that we can spend in order to create our custom password coin:

```rust
let alice = sim.bls(1);
let alice_p2 = StandardLayer::new(alice.pk);
```

Then we'll curry the puzzle with the correct password and create a coin with its puzzle hash:

```rust
let puzzle = ctx.curry(PasswordArgs {
    correct_password: "password".to_string(),
})?;

let puzzle_hash = ctx.tree_hash(puzzle).into();

alice_p2.spend(
    &mut ctx,
    alice.coin,
    Conditions::new().create_coin(puzzle_hash, 1, Memos::None),
)?;

let coin = Coin::new(alice.coin.coin_id(), puzzle_hash, 1);
```

Now that we have a coin with the password puzzle, we can construct a solution and spend it. In this case, let's just send a coin back to Alice:

```rust
let solution = ctx.alloc(&PasswordSolution {
    password: "password".to_string(),
    conditions: Conditions::new().create_coin(alice.puzzle_hash, 1, Memos::None),
})?;

ctx.spend(coin, Spend::new(puzzle, solution))?;
```

To complete the test, we should actually execute the transactions on the simulator:

```rust
sim.spend_coins(ctx.take(), &[alice.sk])?;
```

If everything worked, you should be able to run `cargo test` and see the test pass!

<details>
  <summary>Checkpoint (lib.rs)</summary>

Putting it all together, we get:

```rust title="lib.rs"
use chia_wallet_sdk::prelude::*;

#[derive(Debug, Clone, ToClvm, FromClvm)]
#[clvm(curry)]
pub struct PasswordArgs {
    pub correct_password: String,
}

#[derive(Debug, Clone, ToClvm, FromClvm)]
#[clvm(list)]
pub struct PasswordSolution<T> {
    pub password: String,
    pub conditions: Conditions<T>,
}

compile_rue!(PasswordArgs = PASSWORD_MOD, ".");

#[cfg(test)]
mod tests {
    use super::*;

    use anyhow::Result;

    #[test]
    fn test_password() -> Result<()> {
        let mut ctx = SpendContext::new();
        let mut sim = Simulator::new();

        let alice = sim.bls(1);
        let alice_p2 = StandardLayer::new(alice.pk);

        let puzzle = ctx.curry(PasswordArgs {
            correct_password: "password".to_string(),
        })?;

        let puzzle_hash = ctx.tree_hash(puzzle).into();

        alice_p2.spend(
            &mut ctx,
            alice.coin,
            Conditions::new().create_coin(puzzle_hash, 1, Memos::None),
        )?;

        let coin = Coin::new(alice.coin.coin_id(), puzzle_hash, 1);

        let solution = ctx.alloc(&PasswordSolution {
            password: "password".to_string(),
            conditions: Conditions::new().create_coin(alice.puzzle_hash, 1, Memos::None),
        })?;

        ctx.spend(coin, Spend::new(puzzle, solution))?;

        sim.spend_coins(ctx.take(), &[alice.sk])?;

        Ok(())
    }
}
```

</details>

## Hashing the Password

While this puzzle does technically work, it's wildly insecure and not useful for anything. The first issue is that the password is directly curried into the puzzle, which means that if you reveal the puzzle to someone, you're also revealing the password needed to spend it.

To solve this, we could curry the hash of the password instead of the password itself. This way, the password is not directly revealed in the puzzle, but we can still check that it's correct by hashing it and comparing the result.

Here's the new Rue puzzle:

```rue
fn main(
    password_hash: Bytes32,
    password: String,
    conditions: List<Condition>,
) -> List<Condition> {
    assert sha256(password) == password_hash;

    conditions
}
```

Next, we need to add `sha2` as a dependency in our Rust project:

```bash
cargo add sha2
```

We should update the Rust code to match. First, change the curried argument struct:

```rust
#[derive(Debug, Clone, ToClvm, FromClvm)]
#[clvm(curry)]
pub struct PasswordArgs {
    pub password_hash: Bytes32,
}
```

In the test, add `sha2` to the imports:

```rust
use sha2::{Digest, Sha256};
```

And update the currying of the puzzle:

```rust
let password_hash = <[u8; 32]>::from(Sha256::digest("password")).into();
let puzzle = ctx.curry(PasswordArgs { password_hash })?;
```

If you run `cargo test`, the test should still pass.

<details>
  <summary>Checkpoint (lib.rs)</summary>

Putting it all together, we get:

```rust title="lib.rs"
use chia_wallet_sdk::prelude::*;

#[derive(Debug, Clone, ToClvm, FromClvm)]
#[clvm(curry)]
pub struct PasswordArgs {
    pub password_hash: Bytes32,
}

#[derive(Debug, Clone, ToClvm, FromClvm)]
#[clvm(list)]
pub struct PasswordSolution<T> {
    pub password: String,
    pub conditions: Conditions<T>,
}

compile_rue!(PasswordArgs = PASSWORD_MOD, ".");

#[cfg(test)]
mod tests {
    use super::*;

    use anyhow::Result;
    use sha2::{Digest, Sha256};

    #[test]
    fn test_password() -> Result<()> {
        let mut ctx = SpendContext::new();
        let mut sim = Simulator::new();

        let alice = sim.bls(1);
        let alice_p2 = StandardLayer::new(alice.pk);

        let password_hash = <[u8; 32]>::from(Sha256::digest("password")).into();
        let puzzle = ctx.curry(PasswordArgs { password_hash })?;

        let puzzle_hash = ctx.tree_hash(puzzle).into();

        alice_p2.spend(
            &mut ctx,
            alice.coin,
            Conditions::new().create_coin(puzzle_hash, 1, Memos::None),
        )?;

        let coin = Coin::new(alice.coin.coin_id(), puzzle_hash, 1);

        let solution = ctx.alloc(&PasswordSolution {
            password: "password".to_string(),
            conditions: Conditions::new().create_coin(alice.puzzle_hash, 1, Memos::None),
        })?;

        ctx.spend(coin, Spend::new(puzzle, solution))?;

        sim.spend_coins(ctx.take(), &[alice.sk])?;

        Ok(())
    }
}
```

</details>

## This is Still Insecure

While this is a step in the right direction, it's still not secure enough. When you successfully spend the puzzle, you're permanently revealing the password to the whole world (since everything on the blockchain is public).

Because of this, someone (such as the farmer of a block) could intercept the transaction before it's included in a block, and change the solution to use the same password but different conditions. This would allow them to steal the funds contained within the coin.

Additionally, the password would only be good for one use, since any other coins with the same puzzle hash would be easily spent by anyone who sees the public password.

And lastly, a single sha256 hashed password is very easy to brute force and guess.

For these reasons, passwords are not a good way to secure your funds on the blockchain. But it's a good introduction into how coins work and the kinds of attacks you have to prepare for.

## Next Steps

In the [next tutorial](/docs/tutorials/signature.md), we'll create a puzzle that requires a signature from a specific public key to be spent. This fixes all of the security issues with the password puzzle and introduces the concept of BLS signatures and public keys.
