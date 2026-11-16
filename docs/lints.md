---
slug: /lints
---

# Lints

Besides errors, which prevent a program from compiling, the compiler reports warnings about code that works but is likely to be a mistake, or could be written more simply. These are called lints.

Each lint can be configured to one of the following levels:

| Level    | Description                                                         |
| -------- | ------------------------------------------------------------------- |
| `allow`  | The lint isn't reported.                                            |
| `warn`   | The lint is reported as a warning.                                  |
| `deny`   | The lint is reported as an error, which fails compilation.          |
| `forbid` | Like `deny`, but attributes and later flags can't change the level. |

You can see every lint and its default level by running `rue lints`. Many lints come with a suggested fix, which the [language server](/docs/installation.md#editor-support) can apply for you as a quick fix.

## Lint Groups

Related lints are also in groups, which can be configured anywhere a lint can:

- `unused` contains every `unused_*` lint.
- `style` contains lints for code that works, but could be written more simply, such as `unnecessary_parens` and `collapsible_if`.
- `suspicious` contains lints for code that's likely to be a mistake, such as `self_comparison` and `unconditional_recursion`.

A group sets the level of every lint in it, including the ones that are allowed by default, so `style = "warn"` also enables `negated_condition` and `shadowed_binding`.

## Configuring Lints

### Rue.toml

Levels can be set in the `[lints]` section of `Rue.toml`:

```toml
[lints]
unused = "deny"
unused_binding = "allow"
unnecessary_cast = "allow"
```

The `[lints]` section goes alongside the `[compiler]` section, which every `Rue.toml` must have.

Within `Rue.toml`, a lint's own level takes precedence over the level of its group, regardless of the order they're written in. Here every `unused_*` lint is denied, except for `unused_binding`. The exception is a forbidden group, whose lints can't be set to any other level, so `unused = "forbid"` with `unused_binding = "allow"` is an error.

### Command Line

Levels can also be overridden for a single `rue build` or `rue test` with `-A`/`--allow`, `-W`/`--warn`, `-D`/`--deny` and `-F`/`--forbid`, which take precedence over `Rue.toml`:

```bash
rue build -D unused -A unused_import
```

Among the flags, a lint's own flag takes precedence over its group's, unless the group is forbidden. Otherwise, if a lint is passed more than once, the last flag wins, unless the lint is already forbidden in `Rue.toml` or by an earlier flag (which is an error).

### Attributes

Levels can also be set in the source code, with an `allow`, `warn`, `deny` or `forbid` attribute on an item (such as a function, constant, struct, type alias, import or module) or a statement. The attribute applies to everything inside of what it's attached to, and the innermost one takes precedence over any outer attributes and the project's levels, whether it names a lint or a group. An attribute can list multiple lints, separated by commas:

```rue
#[deny(unused_binding)]
mod strict {
    #[allow(unused_function, unused_parameter)]
    fn reserved(value: Int) -> Int {
        #[warn(unused_binding)]
        let unused = 1;
        42
    }
}
```

If an item or statement has more than one attribute for the same lint, the last one wins.

A `forbid` attribute works like `deny`, but nothing inside of it can change the lint's level. The same goes for lints forbidden in `Rue.toml` or on the command line. An attribute or flag that tries to change the level of a forbidden lint has no effect on it, and is reported as an error:

```rue
#[forbid(unused_binding)]
fn strict() -> Int {
    #[allow(unused_binding)] // Error: Cannot set lint `unused_binding` to `allow`
    let unused = 1;
    42
}
```

### Expectations

An `expect` attribute allows a lint like `allow` does, but also expects it to be reported inside of what it's attached to. If it never is, the attribute is reported with the `unfulfilled_lint_expectation` lint, so it doesn't stay around after the code it was written for changes:

```rue
fn main() -> Int {
    #[expect(unused_binding)]
    let unused = 1;
    42
}
```

An `expect` for a group is fulfilled by any lint in it, and like `allow`, it can't change a forbidden lint. Expectations aren't checked if there are any errors other than lints, since code that doesn't compile can't be fully linted.

### Inner Attributes

To set a level for a whole file, use an inner attribute (with a `!`) at the start of the file, before any items. Inner attributes can also go at the start of a `mod { ... }` body to apply to the whole module, where they come after the attributes on the `mod` itself, so they take precedence unless those forbid the lint. Attributes on the items inside still override them:

```rue
#![allow(unused_function)]

fn reserved() -> Int {
    0
}

#[warn(unused_function)]
fn checked() -> Int {
    1
}
```

## Naming Conventions

The `naming_convention` lint checks that names follow these conventions:

| Kind                                     | Convention                                                  | Example       |
| ---------------------------------------- | ----------------------------------------------------------- | ------------- |
| Functions, modules, and bindings         | `snake_case`                                                | `tree_hash`   |
| Structs, type aliases, and generic types | `UpperCamelCase`                                            | `CreateCoin`  |
| Constants                                | `SCREAMING_SNAKE_CASE`                                      | `CREATE_COIN` |
| Parameters and struct fields             | `snake_case`, `SCREAMING_SNAKE_CASE`, or `Title_Snake_Case` | `public_key`  |

Parameters and struct fields can also use `SCREAMING_SNAKE_CASE`, since curried parameters are conventionally written that way (such as `MOD_HASH`), or `Title_Snake_Case`, which is conventionally used for truths (such as `Ephemeral_State`). A leading underscore isn't considered part of the name.

## Unused Code

Names that start with an underscore are exempt from the `unused_*` lints. This is useful for parameters and struct fields that are only needed to match the layout of a value:

```rue
fn main(_curried_value: Bytes32, amount: Int) -> Int {
    amount
}
```

## List of Lints

### Unused

| Lint                  | Default | Description                                                                            |
| --------------------- | ------- | -------------------------------------------------------------------------------------- |
| `unused_function`     | warn    | Functions that are never used                                                          |
| `unused_constant`     | warn    | Constants that are never used                                                          |
| `unused_binding`      | warn    | Let bindings that are never used                                                       |
| `unused_parameter`    | warn    | Function parameters that are never used                                                |
| `unused_struct`       | warn    | Structs that are never used                                                            |
| `unused_type_alias`   | warn    | Type aliases that are never used                                                       |
| `unused_generic_type` | warn    | Generic type parameters that are never used                                            |
| `unused_import`       | warn    | Imports that are never used                                                            |
| `unused_value`        | warn    | Values returned by expression statements that are discarded                            |
| `unused_struct_field` | warn    | Struct fields that are never read, in structs whose values are only ever read by field |
| `unused_export`       | warn    | Exported items of a module that are only used inside of it                             |

### Style

| Lint                    | Default | Description                                                                                         |
| ----------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `empty_generics`        | warn    | Empty generic parameter or argument lists                                                           |
| `unnecessary_cast`      | warn    | Casts between types that are already compatible                                                     |
| `unnecessary_guard`     | warn    | Type guards between types that are already compatible                                               |
| `unnecessary_plus`      | warn    | Unary `+` operators, which have no effect                                                           |
| `unnecessary_return`    | warn    | `return` statements directly in a function body, which can end in an expression instead             |
| `bool_comparison`       | warn    | Comparisons with `true` or `false`, which can use the value or its negation instead                 |
| `needless_bool`         | warn    | `if` expressions that return `true` and `false`, which can use the condition instead                |
| `negated_condition`     | allow   | `if` expressions with a negated condition and an `else` branch, which can swap the branches instead |
| `collapsible_if`        | warn    | `else` blocks that only contain an `if` expression, which can be written as `else if`               |
| `manual_assert`         | warn    | `if` statements that only `raise`, which can be written as an `assert`                              |
| `needless_let_return`   | warn    | Blocks that end by returning a binding declared directly before, which can end in its value instead |
| `redundant_field_names` | warn    | Struct fields written as `name: name`, which can use the shorthand `name` instead                   |
| `unnecessary_parens`    | warn    | Parentheses that don't change how an expression is evaluated                                        |
| `naming_convention`     | warn    | Names that don't follow the naming convention for what they name                                    |
| `shadowed_binding`      | allow   | Bindings and parameters that shadow another binding or parameter with the same name                 |

### Suspicious

| Lint                      | Default | Description                                                                                      |
| ------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| `indistinguishable_guard` | warn    | Type guards that are always true at runtime                                                      |
| `constant_condition`      | warn    | Conditions that always evaluate to the same value                                                |
| `double_negation`         | warn    | Use of `--`, which could be confused with a decrement operator                                   |
| `unreachable_code`        | warn    | Code after a `return`, `raise` or other expression that never finishes, which is never evaluated |
| `inline_if_may_raise`     | warn    | `inline if` branches that can raise, even though both are always evaluated                       |
| `self_comparison`         | warn    | Comparisons and operations between an expression and itself, which always have the same result   |
| `identical_branches`      | warn    | `if` expressions whose branches are the same, so the condition has no effect                     |
| `duplicate_condition`     | warn    | Conditions in an `else if` chain, `&&` or `\|\|` that repeat an earlier one                      |
| `unconditional_recursion` | warn    | Functions that call themselves on every path, so they never return                               |
| `bytes_int_confusion`     | warn    | Casts of byte literals to `Int` whose value is negative or not in canonical form                 |

### Other

| Lint                           | Default | Description                                                                      |
| ------------------------------ | ------- | -------------------------------------------------------------------------------- |
| `debug_statement`              | allow   | `debug` statements, which shouldn't be left in a release build                   |
| `unknown_lint`                 | warn    | Lint names in attributes or `Rue.toml` that don't refer to a known lint or group |
| `unfulfilled_lint_expectation` | warn    | `expect` attributes whose lint is never reported inside of them                  |
