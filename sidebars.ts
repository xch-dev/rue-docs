import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: "category",
      label: "Getting Started",
      items: ["getting-started/installation", "getting-started/hello-world"],
      collapsed: false,
    },
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
      collapsed: false,
    },
    "security",
  ],
};

export default sidebars;
