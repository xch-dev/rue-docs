---
slug: /type-aliases
---

# Type Aliases

A type alias is simply a way to define a named shorthand for a longer type.

This is an example:

```rue
type Point = (Int, Int);

fun main() -> Int {
    let point: Point = (42, 34);
    point.first + point.rest
}
```
