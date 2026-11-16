---
slug: /operators
---

# Operators

## Arithmetic

### Binary

| Op  | Example | Description                                            |
| --- | ------- | ------------------------------------------------------ |
| `+` | `1 + 2` | Adds two `Int` values and returns the sum.             |
| `-` | `1 - 2` | Subtracts two `Int` values and returns the difference. |
| `*` | `2 * 2` | Multiplies two `Int` values and returns the product.   |
| `/` | `4 / 2` | Divides two `Int` values and returns the quotient.     |
| `%` | `3 % 2` | Divides two `Int` values and returns the remainder.    |

Division rounds towards negative infinity, and the remainder has the same sign as the divisor. For example, `-200 / 3` is `-67`, and `-200 % 3` is `1`. You can use the [`divmod`](/docs/builtins.md#divmod) builtin to compute both at once.

:::note
The `+` operator can also be used with `Bytes` (or `String`) values to concatenate them together.

The `+` and `-` operators can be used with `PublicKey` or `Signature` values to perform BLS point addition and subtraction. The `*` operator can multiply a `PublicKey` or `Signature` by an `Int` scalar, with the point on the left (such as `public_key * 2`).
:::

### Unary

| Op  | Example | Description                                        |
| --- | ------- | -------------------------------------------------- |
| `+` | `+42`   | Has no effect, and is reported by a lint.          |
| `-` | `-42`   | Returns the negative equivalent of an `Int` value. |

:::note
The `-` operator can be used with `PublicKey` or `Signature` values to negate them.
:::

## Bitwise

| Op    | Example     | Description                                                                         |
| ----- | ----------- | ----------------------------------------------------------------------------------- |
| `<<`  | `42 << 2`   | Shifts the bits of the left hand side to the left.                                  |
| `>>`  | `42 >> 2`   | Shifts the bits of the left hand side to the right, preserving the sign.            |
| `>>>` | `42 >>> 2`  | Shifts the bits of the left hand side to the right, treating them as unsigned bits. |
| `~`   | `~42`       | Performs a bitwise NOT on the bits of the `Int` value.                              |
| `&`   | `42 & 100`  | Performs a bitwise AND on the bits of the `Int` values.                             |
| `\|`  | `42 \| 100` | Performs a bitwise OR on the bits of the `Int` values.                              |
| `^`   | `42 ^ 100`  | Performs a bitwise XOR on the bits of the `Int` values.                             |

:::info
The `>>>` operator is a logical shift. Since it treats the value as unsigned, shifting a negative number gives a positive result (for example, `-50 >>> 1` is `103`). It's useful for walking the bits of a path, such as in a merkle proof.
:::

## Logical

| Op     | Example           | Description                                                                              |
| ------ | ----------------- | ---------------------------------------------------------------------------------------- |
| `!`    | `!true`           | Returns `true` if `false`, and `false` if `true`.                                        |
| `&&`   | `true && false`   | Returns whether both `Bool` values are `true`, only evaluating the right side if needed. |
| `\|\|` | `true \|\| false` | Returns whether either `Bool` value is `true`, only evaluating the right side if needed. |
| `&`    | `true & false`    | Returns whether both `Bool` values are `true`, always evaluating both.                   |
| `\|`   | `true \| false`   | Returns whether either `Bool` value is `true`, always evaluating both.                   |

The `&&` and `||` operators short-circuit, so the right side is only evaluated if it's needed to determine the result. This makes them safe to use when the right side depends on the left side, such as `value is Int && value > 5`. However, short-circuiting requires extra branching in the generated code.

The `&` and `|` operators on `Bool` values are compiled to the CLVM `all` and `any` operators, which always evaluate both sides. They are cheaper when both sides are simple and can't raise an error.

## Comparison

| Op   | Example  | Description                                                  |
| ---- | -------- | ------------------------------------------------------------ |
| `<`  | `1 < 2`  | If the left side is less than the right side.                |
| `>`  | `1 > 2`  | If the left side is greater than the right side.             |
| `<=` | `1 <= 2` | If the left side is less than or equal to the right side.    |
| `>=` | `1 >= 2` | If the left side is greater than or equal to the right side. |

:::note
The comparison operators can also be used with `Bytes` values, which compares them lexicographically. The byte-specific `>s` operator is used to implement this in [CLVM](https://chialisp.com/operators/#comparison).
:::

## Equality

| Op   | Example  | Description                                      |
| ---- | -------- | ------------------------------------------------ |
| `==` | `1 == 2` | If the left side is equal to the right side.     |
| `!=` | `1 != 2` | If the left side is not equal to the right side. |

Both sides must be atoms of the same kind, such as `Int`, `Bytes`, `Bool`, `PublicKey`, or `Signature`. Atoms are compared by their bytes, so an `Int` and a `Bytes` value need to be cast to the same type before they can be compared.

To compare structs, pairs, or lists, use the [`deep_equal`](/docs/standard-library.md#utilities) function from the standard library, or compare their tree hashes.

## Precedence

Operators are listed from highest to lowest precedence. Operators with the same precedence are evaluated from left to right.

| Operators                   | Description                        |
| --------------------------- | ---------------------------------- |
| `f()`, `.field`, `as`, `is` | Calls, field access, casts, guards |
| `!`, `-`, `+`, `~` (prefix) | Unary operators                    |
| `*`, `/`, `%`               | Multiplicative                     |
| `+`, `-`                    | Additive                           |
| `<<`, `>>`, `>>>`           | Shifts                             |
| `&`                         | Bitwise or logical AND             |
| `^`                         | Bitwise XOR                        |
| `\|`                        | Bitwise or logical OR              |
| `<`, `>`, `<=`, `>=`        | Comparison                         |
| `==`, `!=`                  | Equality                           |
| `&&`                        | Short-circuiting AND               |
| `\|\|`                      | Short-circuiting OR                |

:::tip
Since `is` and `as` bind more tightly than prefix operators, `!value is Int` is parsed as `!(value is Int)`. Writing the parentheses explicitly makes this easier to read.

Also, the type after `is` or `as` can be a union, so `value is Int | other` is read as a guard against the type `Int | other`. Use parentheses when combining a guard or cast with `|`, such as `(value is Int) | (other is Int)`.
:::
