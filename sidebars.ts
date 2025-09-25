import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docs: [
    "installation",
    "functions",
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
    "security",
  ],
};

export default sidebars;
