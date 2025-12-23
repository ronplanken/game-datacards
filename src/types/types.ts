type Wh40k10eCardType = "datasheet" | "stratagem" | "secondary" | "psychic" | "enhancement" | "DataCard" | "rule";
type AosCardType = "warscroll" | "spell";
type NecromundaCardType = "ganger" | "vehicle" | "empty-ganger" | "empty-vehicle";
type DataSourceListItemType = "category" | "list" | "header" | "allied" | "role";

export type CardDisplayType = "print" | "viewer";

/**
 * Basic props used for CardDisplay and subclasses
 */
export type CardDisplayProps = {
  type?: CardDisplayType;
  card?: Card;
  cardScaling?: number;
  printPadding?: number;
};
/**
 *  Warhammer40K10e cards have additional props attached.
 */
export type Warhammer40K10eCardDisplayProps = CardDisplayProps & {
  side?;
  backgrounds?;
};

/**
 * Basic Card type.
 */
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

/**
 * Elements that populate the DataSourceList
 */
export type DataSourceListItem = {
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

/**
 * Categories are used to populate the
 */
export type Category = {
  uuid: string;
  cards: Card[];
  closed?: boolean;
  name: string;
  type: CategoryType;
  parentId?: string;
};

/**
 * useCardStorage hook provides data in this shape.
 */
export type CardStorageState = {
  categories: Category[];
};

/**
 * CardStorageContextType describes the data and actions provided by useCardStorage hook
 *
 * @property {CardStorageState}  cardStorage    - main card storage contents
 * @property {Card|undefined} activeCard        - currently displayed card (if any)
 * @property {function} updateActiveCard        - change currently loaded card
 * @property {function} setActiveCard           - setActiveCard
 * @property {function} saveActiveCard          - saves currently active card
 * @property {any} cardUpdated                  - TODO
 * @property {function} saveCard                - saves a card
 * @property {function} addCardToCategory       - adds a card to a category
 * @property {function} activeCategory          - currently active category
 * @property {function} setActiveCategory       - setActiveCategory
 * @property {function} removeCardFromCategory  - removes a card from a category
 * @property {function} importCategory          - importCategory
 * @property {function} renameCategory          - renames a category
 * @property {function} removeCategory          - removes a category from the storage
 * @property {function} addCategory             - adds a category to the storage
 * @property {function} addSubCategory          - adds a subcategory to an existing category
 * @property {function} getSubCategories        - returns subcategories of an existing category
 * @property {function} updateCategory          - updates a category
 * @export
 */
export type CardStorageContextType = {
  cardStorage: CardStorageState;
  activeCard: Card;
  updateActiveCard: (card, noUpdate?: boolean) => void;
  setActiveCard: (card?: Card) => void;
  activeCategory: Category;
  cardUpdated;
  saveCard: (card: Card, categoryId?: Category["uuid"]) => void;
  saveActiveCard: () => void;
  setActiveCategory: (cat: Category) => void;
  addCardToCategory: (card: Card, categoryId?: Category["uuid"]) => void;
  removeCardFromCategory: (cardId: string, cat: string) => void;
  importCategory: (category: Category, categories?: Category[]) => void;
  renameCategory: (cateoryId: string, catroryName: string) => void;
  removeCategory: (categoryName: string) => void;
  addCategory: (categoryName: string, type?: CategoryType) => void;
  addSubCategory: (categoryName: string, parentId: string) => void;
  getSubCategories: (parentId: string) => Category[];
  updateCategory: (category: Category, id: string) => void;
};

/**
 * api surface for @see{@link useDataSourceStorage} hook
 *
 * @export
 * @typedef {DataSourceStorageContextType}
 */
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
