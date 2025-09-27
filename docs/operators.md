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
| `*` | `2 * 2` | Multiplies two `Int` values and return the product.    |
| `/` | `4 / 2` | Divides two `Int` values and returns the quotient.     |
| `%` | `3 % 2` | Divides two `Int` values and returns the remainder.    |

:::note
The `+` operator can be used with `Bytes` values to concatenate them together.

The `+`, `-`, and `*` operators can be used with `PublicKey` or `Signature` values to perform the corresponding BLS math operations (ie point addition, subtraction, or multiplication).
:::

### Unary

| Op  | Example | Description                                        |
| --- | ------- | -------------------------------------------------- |
| `+` | `+42`   | An unnecessary no-op.                              |
| `-` | `-42`   | Returns the negative equivalent of an `Int` value. |

:::note
The `-` operator can be used with `PublicKey` or `Signature` values to negate them.
:::

## Bitwise

| Op   | Example     | Description                                             |
| ---- | ----------- | ------------------------------------------------------- |
| `<<` | `42 << 2`   | Shifts the bits of the left hand side to the left.      |
| `>>` | `42 >> 2`   | Shifts the bits of the left hand side to the right.     |
| `~`  | `~42`       | Performs a bitwise NOT on the bits of the `Int` value.  |
| `&`  | `42 & 100`  | Performs a bitwise AND on the bits of the `Int` values. |
| `\|` | `42 \| 100` | Performs a bitwise OR on the bits of the `Int` values.  |
| `^`  | `42 ^ 100`  | Performs a bitwise XOR on the bits of the `Int` values. |

## Logical

| Op     | Example           | Description                                       |
| ------ | ----------------- | ------------------------------------------------- |
| `!`    | `!true`           | Returns `true` if `false`, and `false` if `true`. |
| `&&`   | `true && false`   | Lazy evaluates if both `Bool` values are `true`.  |
| `\|\|` | `true \|\| false` | Lazy evaluates if either `Bool` value is `true`.  |
| `&`    | `true & false`    | Returns whether both `Bool` values are `true`.    |
| `\|`   | `true \| false`   | Returns whether either `Bool` value is `true`.    |

## Comparison

| Op   | Example  | Description                                                  |
| ---- | -------- | ------------------------------------------------------------ |
| `<`  | `1 < 2`  | If the left side is less than the right side.                |
| `>`  | `1 > 2`  | If the left side is greater than the right side.             |
| `<=` | `1 <= 2` | If the left side is less than or equal to the right side.    |
| `>=` | `1 >= 2` | If the left side is greater than or equal to the right side. |

:::note
The comparison operators can also be used with `Bytes` values, and the special byte-specific `>s` operator is used to implement this in [CLVM](https://chialisp.com/operators/#comparison).
:::

## Equality

| Op   | Example  | Description                                      |
| ---- | -------- | ------------------------------------------------ |
| `==` | `1 == 2` | If the left side is equal to the right side.     |
| `!=` | `1 != 2` | If the left side is not equal to the right side. |
