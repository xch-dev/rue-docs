---
slug: /modules
---

# Modules

Modules are a way to organize your code into separate files and namespaces.

## File Structure

Every `.rue` file in a [project](/docs/projects.md) is a module, and every directory is a module that contains the files and directories inside of it. The name of a file's module is its name without the `.rue` extension.

For example, take the following project:

```
puzzles
├── main.rue
├── utils.rue
└── conditions
    ├── create.rue
    └── messages.rue
```

The rules for how they can reference each other are:

1. Each file can reference the other files and directories in the same directory by name.
2. Each file can reference the parent of its directory with `super`.
3. Each file can reference the root of the project with `project`.
4. Only items that are marked with `export` can be referenced from another module.

So in this example, `main.rue` can reference `utils` and `conditions::create`, and `create.rue` can reference `messages` directly and `utils` with `super::utils` or `project::utils`.

## Exports

Items (such as functions, constants, structs, and type aliases) are private to the module they're declared in by default. To make one visible to other modules, mark it with `export`:

```rue
export fn greet(name: String) -> String {
    "Hello, " + name + "!"
}
```

:::note
Exporting a function also makes it an [entrypoint](/docs/functions.md#exported-functions) that can be compiled with `rue build --export`, from any file in the project. `rue build --all` only builds the exports of `main.rue`.
:::

## Paths

You can reference exported symbols and types from other modules by using the module name followed by the path to the symbol or type:

```rue ignore
fn main() -> String {
    utils::greet("Alice")
}
```

In this case, we are referencing the `greet` function from the `utils` module.

A path can also start with `super`, which is the parent module, or `project`, which is the root of the project: the [entrypoint](/docs/projects.md#manifest) directory, or the file itself when you compile a single file. Since `project` names the same module wherever it's written, it's useful for reaching an item from deep inside of the project:

```rue ignore
fn main() -> Bytes32 {
    project::conditions::create::coin_id()
}
```

Paths work the same way in types and imports, such as `coin: project::utils::Coin` or `import project::utils::greet;`.

A module can share its name with a function, constant, or type, since modules are in a separate namespace. The path decides which one you mean:

```rue
mod fee {
    export const RATE: Int = 3;
}

fn fee(amount: Int) -> Int {
    amount * fee::RATE / 100
}

fn main() -> Int {
    fee(1000)
}
```

A module isn't a value, so it can't be assigned to a binding or passed to a function. Use one of its items instead, such as `utils::greet`.

## Imports

Instead of referencing by path every time, you can import symbols and types from other modules into the current scope so that they can be referenced directly:

```rue ignore
import utils::greet;

fn main() -> String {
    greet("Alice")
}
```

You can import multiple items at once:

```rue ignore
import utils::{exclaim, greet};

fn main() -> String {
    exclaim(greet("Alice"))
}
```

You can also import all of the exported items from a module by using the `*` wildcard:

```rue ignore
import utils::*;

fn main() -> String {
    exclaim(greet("Alice"))
}
```

If a glob import brings in two different items with the same name, using that name is an error, since it's ambiguous. A named import, or an item declared in the module itself, takes precedence over a glob import, so you can resolve the ambiguity by importing the one you want by name:

```rue ignore
import utils::*;
import conditions::create::greet;
```

Here, `greet` refers to `conditions::create::greet`, even if `utils` also exports a `greet`. Importing a name that's also declared in the same module is an error, though.

Importing a module itself (such as `import std::singleton;`) lets you refer to its items with a shorter path.

A name can refer to both a symbol (such as a function or constant) and a type (such as a struct or type alias) at the same time, since they are in separate namespaces. Importing the name imports both.

## Re-exports

It's possible to re-export items, which makes them available to other modules as if they were declared in the current module:

```rue ignore
export conditions::*;
export utils::greet;
```

This is how the standard library's prelude makes everything available in one place.

Only exported items can be re-exported. Re-exporting a private item (such as `export super::helper;` where `helper` isn't exported) is an error, and a glob re-export (such as `export super::*;`) only re-exports the items that are already exported.

## Module Blocks

You can also create a module inside of a file by using the `mod` keyword followed by the name of the module:

```rue
mod math {
    export fn add(a: Int, b: Int) -> Int {
        a + b
    }
}

fn main() -> Int {
    math::add(42, 34)
}
```

Like files, only the items a module block exports are visible outside of it.

A module block only sees its own items, the [prelude](/docs/standard-library.md#prelude) and builtins, and the module it's declared in as `super` (along with `project`). It doesn't see the other items of the enclosing module by name, so reference them with `super::name`, or import them:

```rue
const LIMIT: Int = 100;

mod math {
    import super::LIMIT;

    export fn clamp(value: Int) -> Int {
        if value > LIMIT {
            LIMIT
        } else {
            value
        }
    }
}

fn main() -> Int {
    math::clamp(250)
}
```

A module can reference the private items of the modules it's declared in, so `LIMIT` doesn't need to be exported here. To bring in everything from the enclosing module, use `import super::*;`.

:::warning
If the enclosing module declares an item with the same name as a prelude item or builtin (such as its own `sha256` function), a module block that uses the bare name gets the prelude item or builtin instead. The `prelude_over_enclosing_item` [lint](/docs/lints.md) warns about this, and suggests `super::name` if you meant the enclosing module's item.
:::
