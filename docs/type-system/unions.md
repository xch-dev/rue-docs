---
slug: /unions
---

# Unions

A union allows you to allow multiple distinct types to be assigned.

For example, either `Bytes32` or `nil`:

```rue
type Owner = Bytes32 | nil;
```

You can assign either of these types to `Owner`:

```rue
let owner: Owner = nil;
```

But you must narrow the type further through [Type Guards](/docs/type-system/guards.md) before assigning it to its individual types:

```rue
let maybe_owner: Owner = nil;

// This fails because the type is too broad
let owner: Bytes32 = maybe_owner;

// This will check at runtime, allowing the type to be narrowed
assert maybe_owner is Bytes32;

// And now this works because we know it's not nil
let owner: Bytes32 = maybe_owner;
```
