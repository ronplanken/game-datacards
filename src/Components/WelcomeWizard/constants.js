// WelcomeWizard v2.0.0 Configuration

export const WIZARD_VERSION = "2.0.0";

// Step configuration
export const WIZARD_STEPS = [
  { key: 0, id: "welcome", title: "Welcome", required: false },
  { key: 1, id: "game-system", title: "Choose Your Game", required: true },
  { key: 2, id: "workspace", title: "Your Workspace", required: false },
  { key: 3, id: "adding-cards", title: "Adding Cards", required: false },
  { key: 4, id: "data-portability", title: "Import, Export & Print", required: false },
  { key: 5, id: "subscription", title: "Premium Options", required: false },
  { key: 6, id: "cloud-sync", title: "Cloud Sync", required: false },
  { key: 7, id: "explore-more", title: "Explore More", required: false },
  { key: 8, id: "complete", title: "Get Started", required: false },
];

// Game system/datasource configuration
export const GAME_SYSTEMS = [
  {
    id: "40k-10e",
    title: "Warhammer 40K",
    subtitle: "10th Edition",
    description: "Community-maintained datacards for 10th edition games",
    color: "#dc2626",
    tag: "Popular",
  },
  {
    id: "aos",
    title: "Age of Sigmar",
    subtitle: "4th Edition",
    description: "Community-maintained warscrolls and unit cards",
    color: "#ca8a04",
    tag: "New",
  },
  {
    id: "40k-10e-cp",
    title: "Combat Patrol",
    subtitle: "10th Edition",
    description: "Simplified cards for Combat Patrol game mode",
    color: "#0891b2",
    tag: null,
  },
  {
    id: "necromunda",
    title: "Necromunda",
    subtitle: null,
    description: "Fighter cards for skirmish games",
    color: "#a05236",
    tag: null,
  },
  {
    id: "basic",
    title: "Basic Cards",
    subtitle: "Custom",
    description: "Create fully custom cards from scratch",
    color: "#6366f1",
    tag: null,
  },
  {
    id: "40k",
    title: "Wahapedia Import",
    subtitle: "9th Edition",
    description: "Import and customize cards from Wahapedia data",
    color: "#737373",
    tag: "Legacy",
  },
];

// Feature highlights for welcome step carousel
export const FEATURE_HIGHLIGHTS = [
  {
    id: "systems",
    title: "6 Game Systems",
    description: "Grimdark, Fantasy, Skirmish, and more",
    icon: "Gamepad2",
  },
  {
    id: "print",
    title: "Print-Ready Cards",
    description: "Export to PDF or print directly",
    icon: "Printer",
  },
  {
    id: "cloud",
    title: "Cloud Sync",
    description: "Access your cards from any device",
    icon: "Cloud",
  },
  {
    id: "community",
    title: "Community Content",
    description: "Browse and share custom datasources",
    icon: "Users",
  },
];

// Advanced features for "Explore More" step
export const ADVANCED_FEATURES = [
  {
    id: "marketplace",
    title: "Community Marketplace",
    description: "Browse and share custom datasources created by the community.",
    icon: "Store",
  },
  {
    id: "mobile",
    title: "Mobile Companion",
    description: "View your cards on the go. Perfect for game day reference.",
    icon: "Smartphone",
  },
];

// Import/Export tabs configuration
export const DATA_TABS = [
  {
    id: "import",
    title: "Import",
    items: [
      { label: "JSON Files", description: "Import Game Datacards format" },
      { label: "GW App Format", description: "Import from Warhammer App" },
    ],
  },
  {
    id: "export",
    title: "Export",
    items: [
      { label: "JSON", description: "Backup or share your cards" },
      { label: "GW App", description: "Export for Warhammer App" },
      { label: "PNG Images", description: "Export cards as images" },
      { label: "Datasource", description: "Share as custom datasource" },
    ],
  },
  {
    id: "print",
    title: "Print",
    items: [
      { label: "Paper Sizes", description: "A4, A5, Letter, Half-Letter" },
      { label: "Orientation", description: "Portrait or Landscape" },
      { label: "Layout", description: "Customize cards per page" },
    ],
  },
];

// Sample tree data for workspace demo
export const DEMO_TREE_DATA = [
  {
    id: "cat-1",
    name: "My Army",
    type: "category",
    expanded: true,
    children: [
      { id: "card-1", name: "Captain in Terminator Armour", type: "card" },
      { id: "card-2", name: "Intercessor Squad", type: "card" },
      { id: "card-3", name: "Redemptor Dreadnought", type: "card" },
    ],
  },
  {
    id: "cat-2",
    name: "Characters",
    type: "category",
    expanded: false,
    children: [
      { id: "card-4", name: "Chaplain", type: "card" },
      { id: "card-5", name: "Librarian", type: "card" },
    ],
  },
];

// Sample card data for editor demo
export const DEMO_CARD_DATA = {
  name: "Intercessor Squad",
  movement: 6,
  toughness: 4,
  save: 3,
  wounds: 2,
  leadership: 6,
  objectiveControl: 2,
};
