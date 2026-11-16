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
3. Only items that are marked with `export` can be referenced from another module.

So in this example, `main.rue` can reference `utils` and `conditions::create`, and `create.rue` can reference `messages` directly and `utils` with `super::utils`.

## Exports

Items (such as functions, constants, structs, and type aliases) are private to the module they're declared in by default. To make one visible to other modules, mark it with `export`:

```rue
export fn greet(name: String) -> String {
    "Hello, " + name + "!"
}
```

:::note
Exporting a function from `main.rue` also makes it an [entrypoint](/docs/functions.md#exported-functions) that can be compiled with `rue build --export`.
:::

## Paths

You can reference exported symbols and types from other modules by using the module name followed by the path to the symbol or type:

```rue
fn main() -> String {
    utils::greet("Alice")
}
```

In this case, we are referencing the `greet` function from the `utils` module.

## Imports

Instead of referencing by path every time, you can import symbols and types from other modules into the current scope so that they can be referenced directly:

```rue
import utils::greet;

fn main() -> String {
    greet("Alice")
}
```

You can import multiple items at once:

```rue
import utils::{greet, exclaim};

fn main() -> String {
    exclaim(greet("Alice"))
}
```

You can also import all of the exported items from a module by using the `*` wildcard:

```rue
import utils::*;

fn main() -> String {
    exclaim(greet("Alice"))
}
```

If a glob import brings in two different items with the same name, using that name is an error, since it's ambiguous. Importing a module itself (such as `import std::singleton;`) lets you refer to its items with a shorter path.

A name can refer to both a symbol (such as a function or constant) and a type (such as a struct or type alias) at the same time, since they are in separate namespaces. Importing the name imports both.

## Re-exports

It's possible to re-export items, which makes them available to other modules as if they were declared in the current module:

```rue
export utils::greet;
export conditions::*;
```

This is how the standard library's prelude makes everything available in one place.

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

A module block can reference the items in the scope it's declared in, as well as its own items. Like files, only the items it exports are visible outside of it.
