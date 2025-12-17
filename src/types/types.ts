type Wh40k10eCardType = "datasheet" | "stratagem" | "secondary" | "psychic" | "enhancement" | "DataCard" | "rule";
type AosCardType = "warscroll" | "spell";
type NecromundaCardType = "ganger" | "vehicle" | "empty-ganger" | "empty-vehicle";
type DataSourceListItemType = "category" | "list" | "header" | "allied" | "role";

export type CardDisplayType = "print" | "viewer";
export type CardDisplayProps = {
  type?: CardDisplayType;
  card?: Card;
  cardScaling?: number;
  printPadding?: number;
};

export type Warhammer40K10eCardDisplayProps = CardDisplayProps & {
  side?;
  backgrounds?;
};

export type Card = {
  /**
   * props used in CardDisplay and Viewer
   */
  uuid: string;
  cardType: Wh40k10eCardType | AosCardType | NecromundaCardType;
  loreName: string;
  variant: "full";
  faction_id: string;
  source: "40k-10e" | "40k" | "basic" | "necromunda" | "aos";
  useCustomColours: boolean;
  customHeaderColour: string;
  customBannerColour: string;
  /**
   * props used in CategoryTree
   */
  isCustom?: boolean;
  id: string;
  name: string;
};

export type DataSourceListItem = {
  /**
   * props used in DataSourceList
   */
  type: DataSourceListItemType;
  name: string;
  id: string;
  faction_id;
  allied;
  role;
  legends;
  nonBase;
  detachment;
  points?: PointCost[];
};

type PointCost = {
  cost: number;
};

export type CategoryType = "category" | "list";

export type Category = {
  uuid: string;
  cards: Card[];
  closed?: boolean;
  name: string;
  type: CategoryType;
  parentId?: string;
};
export type CardStorageState = {
  categories: Category[];
};

export type CardStorageContextType = {
  cardStorage: CardStorageState;
  activeCard: Card;
  updateActiveCard: (card, noUpdate?: boolean) => void;
  setActiveCard: (card?: Card) => void;
  activeCategory: Category;
  cardUpdated;
  saveActiveCard: () => void;
  setActiveCategory: (cat: Category) => void;
  addCardToCategory: (card: Card, category?: Category["uuid"]) => void;
  removeCardFromCategory: (cardId: string, cat: string) => void;
  importCategory: (category: Category, categories?: Category[]) => void;
  renameCategory: (cateoryId: string, catroryName: string) => void;
  removeCategory: (categoryName: string) => void;
  addCategory: (categoryName: string, type?: CategoryType) => void;
  addSubCategory: (categoryName: string, parentId: string) => void;
  getSubCategories: (parentId: string) => Category[];
  updateCategory: (category: Category, id: string) => void;
  saveCard: (updatedCard: Card, category: Category) => void;
};

export type DataSourceStorageContextType = {
  dataSource;
  selectedFaction;
  updateSelectedFaction;
  clearSelectedFaction;
};

export type SettingsStorageContextType = {
  settings;
  updateSettings;
};

export type UserContextType = {};

export type BasicData = {
  version;
  lastUpdated;
  lastCheckedForUpdate;
  noDatasheetOptions?: boolean;
  noStratagemOptions?: boolean;
  noSecondaryOptions?: boolean;
  noPsychicOptions?: boolean;
  noSubfactionOptions?: boolean;
  noFactionOptions?: boolean;
  genericData?;
  data: Faction[];
};

export type Faction = {
  id: string;
  link: string;
  name: string;
  datasheets: Datasheet[];
  stratagems?: unknown[];
  secondaries?: unknown[];
  psychicpowers?: unknown[];
};

type Datasheet = {};

export type DatasheetWargear = {
  datasheet_id;
  is_index_wargear;
  wargear_id;
}[];
