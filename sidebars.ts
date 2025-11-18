import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docs: [
    "installation",
    {
      type: "category",
      label: "Tutorials",
      items: ["tutorials/password"],
    },
    "functions",
    "control-flow",
    "bindings",
    "constants",
    {
      type: "category",
      label: "Type System",
      items: [
        "type-system/atoms",
        "type-system/pairs",
        "type-system/structs",
        "type-system/aliases",
        "type-system/unions",
        "type-system/guards",
      ],
    },
    "operators",
    "builtins",
    "debugging",
    "security",
  ],
};

export default sidebars;
