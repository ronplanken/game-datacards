import { lazy } from "react";

export const helpCategories = [
  {
    key: "datasource-editor",
    label: "Datasource Editor",
    icon: "Database",
    description: "Create custom card structures for any tabletop game. Define stats, weapons, abilities, and more.",
    sections: [
      {
        key: "getting-started",
        label: "Getting Started",
        component: lazy(() => import("./content/datasource/getting-started.mdx")),
      },
      {
        key: "creating-a-datasource",
        label: "Creating a Datasource",
        component: lazy(() => import("./content/datasource/creating-a-datasource.mdx")),
      },
      {
        key: "base-systems",
        label: "Base Systems",
        component: lazy(() => import("./content/datasource/base-systems.mdx")),
      },
      {
        key: "the-workspace",
        label: "The Workspace",
        component: lazy(() => import("./content/datasource/the-workspace.mdx")),
      },
      {
        key: "card-types",
        label: "Card Types",
        component: lazy(() => import("./content/datasource/card-types.mdx")),
      },
      {
        key: "defining-fields",
        label: "Defining Fields",
        component: lazy(() => import("./content/datasource/defining-fields.mdx")),
      },
      {
        key: "stats-and-profiles",
        label: "Stats and Profiles",
        component: lazy(() => import("./content/datasource/stats-and-profiles.mdx")),
      },
      {
        key: "weapons",
        label: "Weapons",
        component: lazy(() => import("./content/datasource/weapons.mdx")),
      },
      {
        key: "abilities",
        label: "Abilities",
        component: lazy(() => import("./content/datasource/abilities.mdx")),
      },
      {
        key: "sections",
        label: "Sections",
        component: lazy(() => import("./content/datasource/sections.mdx")),
      },
      {
        key: "metadata",
        label: "Metadata",
        component: lazy(() => import("./content/datasource/metadata.mdx")),
      },
      {
        key: "working-with-cards",
        label: "Working with Cards",
        component: lazy(() => import("./content/datasource/working-with-cards.mdx")),
      },
      {
        key: "card-preview",
        label: "Card Preview",
        component: lazy(() => import("./content/datasource/card-preview.mdx")),
      },
      {
        key: "import-and-export",
        label: "Import and Export",
        component: lazy(() => import("./content/datasource/import-and-export.mdx")),
      },
      {
        key: "tips",
        label: "Tips",
        component: lazy(() => import("./content/datasource/tips.mdx")),
      },
    ],
  },
  {
    key: "card-designer",
    label: "Card Designer",
    icon: "PenTool",
    description: "Design custom card templates with a canvas editor. Bind data, add elements, and create layouts.",
    sections: [
      {
        key: "getting-started",
        label: "Getting Started",
        component: lazy(() => import("./content/designer/getting-started.mdx")),
      },
      {
        key: "creating-a-template",
        label: "Creating a Template",
        component: lazy(() => import("./content/designer/creating-a-template.mdx")),
      },
      {
        key: "the-workspace",
        label: "The Workspace",
        component: lazy(() => import("./content/designer/the-workspace.mdx")),
      },
      {
        key: "elements",
        label: "Elements",
        component: lazy(() => import("./content/designer/elements.mdx")),
      },
      {
        key: "layers-and-depth",
        label: "Layers and Depth",
        component: lazy(() => import("./content/designer/layers-and-depth.mdx")),
      },
      {
        key: "frames-and-auto-layout",
        label: "Frames and Auto-Layout",
        component: lazy(() => import("./content/designer/frames-and-auto-layout.mdx")),
      },
      {
        key: "data-binding",
        label: "Data Binding",
        component: lazy(() => import("./content/designer/data-binding.mdx")),
      },
      {
        key: "repeater-frames",
        label: "Repeater Frames",
        component: lazy(() => import("./content/designer/repeater-frames.mdx")),
      },
      {
        key: "grid-and-alignment",
        label: "Grid and Alignment",
        component: lazy(() => import("./content/designer/grid-and-alignment.mdx")),
      },
      {
        key: "keyboard-shortcuts",
        label: "Keyboard Shortcuts",
        component: lazy(() => import("./content/designer/keyboard-shortcuts.mdx")),
      },
      {
        key: "saving-and-managing",
        label: "Saving and Managing",
        component: lazy(() => import("./content/designer/saving-and-managing.mdx")),
      },
      {
        key: "template-presets",
        label: "Template Presets",
        component: lazy(() => import("./content/designer/template-presets.mdx")),
      },
      {
        key: "template-sharing",
        label: "Template Sharing",
        component: lazy(() => import("./content/designer/template-sharing.mdx")),
      },
    ],
  },
  {
    key: "subscriptions",
    label: "Subscriptions",
    icon: "CreditCard",
    description: "Plans, pricing, account management, and what each tier includes.",
    sections: [
      {
        key: "plans-and-pricing",
        label: "Plans and Pricing",
        component: lazy(() => import("./content/subscriptions/plans-and-pricing.mdx")),
      },
      {
        key: "managing-your-plan",
        label: "Managing Your Plan",
        component: lazy(() => import("./content/subscriptions/managing-your-plan.mdx")),
      },
      {
        key: "accounts-and-auth",
        label: "Accounts and Authentication",
        component: lazy(() => import("./content/subscriptions/accounts-and-auth.mdx")),
      },
    ],
  },
  {
    key: "cloud-sync",
    label: "Cloud Sync",
    icon: "Cloud",
    description: "Sync categories, datasources, and templates across devices. Publish to the community.",
    sections: [
      {
        key: "how-sync-works",
        label: "How Sync Works",
        component: lazy(() => import("./content/cloud-sync/how-sync-works.mdx")),
      },
      {
        key: "enabling-and-disabling",
        label: "Enabling and Disabling",
        component: lazy(() => import("./content/cloud-sync/enabling-and-disabling.mdx")),
      },
      {
        key: "conflicts",
        label: "Resolving Conflicts",
        component: lazy(() => import("./content/cloud-sync/conflicts.mdx")),
      },
      {
        key: "datasource-publishing",
        label: "Datasource Publishing",
        component: lazy(() => import("./content/cloud-sync/datasource-publishing.mdx")),
      },
    ],
  },
  {
    key: "troubleshooting",
    label: "Troubleshooting",
    icon: "Wrench",
    description: "Fix common issues with data, sync, printing, and the app.",
    sections: [
      {
        key: "data-and-storage",
        label: "Data and Storage",
        component: lazy(() => import("./content/troubleshooting/data-and-storage.mdx")),
      },
      {
        key: "sync-issues",
        label: "Sync Issues",
        component: lazy(() => import("./content/troubleshooting/sync-issues.mdx")),
      },
      {
        key: "printing",
        label: "Printing",
        component: lazy(() => import("./content/troubleshooting/printing.mdx")),
      },
      {
        key: "common-issues",
        label: "Common Issues",
        component: lazy(() => import("./content/troubleshooting/common-issues.mdx")),
      },
    ],
  },
];

export const allSections = helpCategories.flatMap((c) => c.sections.map((s) => ({ ...s, category: c.key })));

export function getCategory(categoryKey) {
  return helpCategories.find((c) => c.key === categoryKey);
}

export function getSection(categoryKey, sectionKey) {
  const cat = getCategory(categoryKey);
  return cat?.sections.find((s) => s.key === sectionKey);
}

export function getSectionNeighbors(categoryKey, sectionKey) {
  const idx = allSections.findIndex((s) => s.category === categoryKey && s.key === sectionKey);
  return {
    prev: idx > 0 ? allSections[idx - 1] : null,
    next: idx < allSections.length - 1 ? allSections[idx + 1] : null,
  };
}
