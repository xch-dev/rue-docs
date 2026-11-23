---
slug: /formatting
---

# Formatting

Rue has a built-in code formatter, which formats your code in a consistent style, similar to `rustfmt` for Rust. It keeps your comments, and breaks up long lines so they fit within the maximum width.

You can format every file in the project with:

```bash
rue fmt
```

Or specific files, directories, or glob patterns:

```bash
rue fmt puzzles/main.rue 'tests/**/*.rue'
```

Files with syntax errors are skipped, since they can't be formatted reliably.

## Checking Formatting

To check that files are formatted without changing them (for example, in CI), use `--check`:

```bash
rue fmt --check
```

This lists every file that needs to be formatted, and fails if there are any.

## Options

The formatter can be configured in the `[formatter]` section of [`Rue.toml`](/docs/projects.md#manifest):

```toml
[formatter]
max_width = 100
indent_width = 4
single_quote = false
```

| Key            | Default | Description                                                                                                   |
| -------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| `max_width`    | `100`   | The maximum width of a line before it's broken up.                                                            |
| `indent_width` | `4`     | The number of spaces used for each level of indentation.                                                      |
| `single_quote` | `false` | Whether strings are written with `'` rather than `"` when neither needs fewer escapes. See [Quotes](#quotes). |

## Quotes

Strings can be written with either `"` or `'`, and mean the same thing either way. The formatter writes each string with the quote that needs fewer escapes, so a string that contains `"` is written with `'`, and the other way around:

```rue
fn greeting() -> String {
    "it's"
}

fn quoted() -> String {
    'say "hi"'
}
```

When both quotes need the same number of escapes, it uses `"`, or `'` if `single_quote = true`. It only changes the quotes and the escapes of the quote characters, never the value of the string, and leaves other escapes as they're written.

## Editor Integration

The [language server](/docs/installation.md#editor-support) can also format files, so you can use your editor's format command, or enable format on save. It uses the same options as `rue fmt`.
