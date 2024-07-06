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

:::info
You don't need to use `return` at the end of a function. Everything in Rue must return a value, including functions, so this is implied.
:::

Now, run the following command to run the file:

```bash
rue build hello.rue --run
```

You should see `"Hello, world!"` printed in the console.
