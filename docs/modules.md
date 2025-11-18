# Modules

Modules are a way to organize your code into separate files.

## File Structure

As long as you have a `main.rue` file in the root of your project, the compiler will automatically include all of the `.rue` files adjacent to it (including subdirectories) in the compilation.

All files are modules and can reference each other by name:

1. Each file includes every other adjacent file or directory in its scope.
2. Each directory's module automatically exports all of its children.
3. Each file has access to the parent directory's module with `super`.

If there is no `main.rue` file, then each file ending in `.rue` will be compiled completely independently, rather than as a single program.

## Paths

You can reference exported symbols and types from other modules by using the module name followed by the path to the symbol or type.

```rue
fn main() -> String {
    utils::greet("Alice")
}
```

In this case, we are referencing the `greet` function from the `utils` module.

## Imports

Instead of referencing by path every time, you can import symbols and types from other modules into the current scope so that they can be referenced directly.

```rue
import utils::greet;

fn main() -> String {
    greet("Alice")
}
```

You can import multiple paths:

```rue
import utils::{greet, exclaim};

fn main() -> String {
    exclaim(greet("Alice"))
}
```

You can also import all symbols and types from a module by using the `*` wildcard:

```rue
import utils::*;

fn main() -> String {
    exclaim(greet("Alice"))
}
```

Finally, it's possible to re-export things that you import:

```rue
export utils::*;
```

## Module Block

You can create a module by using the `mod` keyword followed by the name of the module. This is here for completeness more than anything, since most of the time you'll want to use multiple files instead.

```rue
mod utils {
    export fn add(a: Int, b: Int) -> Int {
        a + b
    }
}

fn main() -> Int {
    utils::add(42, 34)
}
```
