---
slug: /pair-types
---

# Pair Types

A pair has two values, a `first` and `rest`. You can create a pair like this:

```rue
let pair = (42, 34);
```

## Lists

Pairs can be nested arbitrarily:

```rue
let chain = (100, (200, (300, nil)));
```

In fact, the above structure is identical to a nil-terminated list with those items.

```rue
let chain = [100, 200, 300];
```

These both have the following type:

```rue
(Int, (Int, (Int, nil)))
```

Which can be assigned to the recursive type `List<Int>`.
