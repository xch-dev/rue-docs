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
      label: "Definitions",
      items: [
        "definitions/let-bindings",
        "definitions/constants",
        "definitions/functions",
      ],
      collapsed: false,
    },
    {
      type: "category",
      label: "Types",
      items: [
        "types/type-system",
        "types/type-checking",
        "types/pair-types",
        "types/structs",
        "types/enums",
        "types/type-aliases",
      ],
      collapsed: false,
    },
  ],
};

export default sidebars;
