---
slug: /hello-world
---

# Hello World

The simplest example of a program in Rue is the classic hello world example.

Write the following program in a file named `hello.rue`:

```rue title="hello.rue"
fun main() -> Bytes {
    "Hello, world!"
}
```

Now, run the following command to run the file:

```bash
rue build hello.rue --run
```
