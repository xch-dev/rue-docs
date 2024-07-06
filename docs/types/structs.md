---
slug: /structs
---

# Structs

A struct allows you to define a type which can contain multiple fields.

Here is a simple example:

```rue
struct Point {
    x: Int,
    y: Int,
}

fun main() -> Int {
    let point = Point {
        x: 42,
        y: 34,
    };

    assert !is_origin(point);

    point.x * point.y
}

fun is_origin(point: Point) -> Bool {
    point.x == 0 && point.y == 0
}
```
