type Wh40k10eCardType = "datasheet" | "stratagem" | "secondary" | "psychic" | "enhancement"
type AosCardType = "warscroll" | "spell"
type NecromundaCardType = "ganger" | "vehicle" | "empty-ganger" | "empty-vehicle"

export type CardDisplayType =  "print" | "viewer"
export type CardDisplayProps = {
  type?: CardDisplayType;
  card?: Card;
  cardScaling?: number;
  printPadding?: number;
}

export type Card = {
    uuid: string,
    cardType: Wh40k10eCardType | AosCardType | NecromundaCardType
    loreName: string
    variant: "full"
    faction_id: string
    source: "40k-10e" | "40k" | "basic" | "necromunda" | "aos" 
    useCustomColours: boolean
    customHeaderColour: string
    customBannerColour: string
}

export type CategoryType = "category" | "list"

export type Category = {
    uuid: string
    cards: Card[]
    closed?: boolean
    name: string
    type: CategoryType
    parentId?: string

}
export type CardStorageState = {
    categories : Category[]
}