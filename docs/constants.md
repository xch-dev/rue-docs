---
slug: /constants
---

# Constants

Constants allow you to write a value a single time, give it a name, and then reuse it throughout your program.

They are similar to [Bindings](/docs/bindings.md), which the primary difference being that they are defined at the top level of the program and are order independent. They will live for and be reused for the entire lifecycle of the `main` function.

As a simple example, you might want to reuse a string multiple times:

```rue
const GREET: Bytes = "Hello, ";

fn main(person_a: Bytes, person_b: Bytes) -> (Bytes, Bytes) {
    (GREET + person_a, GREET + person_b)
}
```

## Inline Constants

You can mark a constant as `inline`, which forces its value to be inserted everywhere it's referenced rather than being defined a single time and reused.

As an example, this will behave the same as if you had written the string multiple times:

```rue
inline const GREET: Bytes = "Hello, ";

fn main(person_a: Bytes, person_b: Bytes) -> (Bytes, Bytes) {
    (GREET + person_a, GREET + person_b)
}
```

This should be used sparingly, since it can come with either a performance hit, an increase in compiled output size, or both.

:::tip
The compiler will automatically inline constants if they are only referenced a single time. You almost never need to explicitly mark them as `inline`.
:::
