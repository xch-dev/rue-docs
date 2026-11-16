import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docs: [
    "installation",
    "projects",
    {
      type: "category",
      label: "Tutorials",
      items: ["tutorials/password", "tutorials/signature"],
    },
    {
      type: "category",
      label: "Language",
      collapsed: false,
      items: [
        "functions",
        "bindings",
        "constants",
        "control-flow",
        "operators",
        "modules",
      ],
    },
    {
      type: "category",
      label: "Type System",
      collapsed: false,
      items: [
        "type-system/atoms",
        "type-system/pairs",
        "type-system/structs",
        "type-system/aliases",
        "type-system/unions",
        "type-system/guards",
        "type-system/generics",
        "type-system/casting",
      ],
    },
    "standard-library",
    "builtins",
    {
      type: "category",
      label: "Tooling",
      collapsed: false,
      items: ["cli", "testing", "debugging", "lints", "formatting"],
    },
    "security",
  ],
};

export default sidebars;
