import { useState, useCallback, useMemo } from "react";
import ReactDOM from "react-dom";
import {
  ArrowLeft,
  BarChart3,
  Swords,
  Sparkles,
  Tag,
  Target,
  FileText,
  Shield,
  List,
  Layers,
  Crown,
  HeartCrack,
  Wrench,
  Users,
  ScrollText,
  WrapText,
} from "lucide-react";
import { useMobileList } from "../useMobileList";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { useCardEditorState } from "./useCardEditorState";
import { resolveEditorSections } from "./editorSchemaResolvers";
import { getLocalizationSpec, mergeCard, projectCard } from "./localizedCard";
import { NameSection } from "./sections/NameSection";
import { StatsSection } from "./sections/StatsSection";
import { WeaponsSection } from "./sections/WeaponsSection";
import { AbilitiesSection } from "./sections/AbilitiesSection";
import { KeywordsSection } from "./sections/KeywordsSection";
import { PointsSection } from "./sections/PointsSection";
import { FieldsSection } from "./sections/FieldsSection";
import { InvulSection } from "./sections/InvulSection";
import { RulesListSection } from "./sections/RulesListSection";
import { CustomSectionsEditor } from "./sections/CustomSectionsEditor";
import { FieldCollectionSection } from "./sections/FieldCollectionSection";
import { PrimarchSection } from "./sections/PrimarchSection";
import { DamagedSection } from "./sections/DamagedSection";
import { StringListSection } from "./sections/StringListSection";
import { TextFieldSection } from "./sections/TextFieldSection";
import { LeaderInfoSection } from "./sections/LeaderInfoSection";
import { WargearOptionsSection } from "./sections/WargearOptionsSection";
import { StylingSection } from "./sections/StylingSection";
import { DrillDownView } from "./shared/DrillDownView";
import { WeaponListView } from "./weapons/WeaponListView";
import { WeaponProfileEditor } from "./weapons/WeaponProfileEditor";
import { getWeaponsArray } from "./weapons/weaponHelpers";
import "./MobileCardEditor.css";

const SECTION_COMPONENTS = {
  name: NameSection,
  stats: StatsSection,
  weapons: WeaponsSection,
  abilities: AbilitiesSection,
  keywords: KeywordsSection,
  points: PointsSection,
  fields: FieldsSection,
  invul: InvulSection,
  rulesList: RulesListSection,
  customSections: CustomSectionsEditor,
  fieldCollection: FieldCollectionSection,
  primarch: PrimarchSection,
  damaged: DamagedSection,
  stringList: StringListSection,
  textField: TextFieldSection,
  leaderInfo: LeaderInfoSection,
  wargearOptions: WargearOptionsSection,
  styling: StylingSection,
};

const SECTION_ICONS = {
  stats: BarChart3,
  weapons: Swords,
  abilities: Sparkles,
  keywords: Tag,
  points: Target,
  fields: FileText,
  invul: Shield,
  rulesList: List,
  customSections: Layers,
  fieldCollection: List,
  primarch: Crown,
  damaged: HeartCrack,
  stringList: Wrench,
  textField: ScrollText,
  leaderInfo: Users,
  wargearOptions: Wrench,
  styling: WrapText,
};

export const MobileCardEditor = ({ isOpen, onClose, card, cardUuid, gameSystem, schema, factionColours }) => {
  const [drillDown, setDrillDown] = useState(null);
  const { updateCardData } = useMobileList();
  const { settings } = useSettingsStorage();

  // Multi-language datasources (40k-11e) store every displayable string as a
  // language-keyed object. The sections below all read and write plain strings,
  // so the editor works on a projection of the card in the active card language
  // and folds each change back in, leaving the other languages untouched.
  const language = settings?.language || "en";
  const localizationSpec = useMemo(() => getLocalizationSpec(card, gameSystem), [card, gameSystem]);
  const editableCard = useMemo(
    () => (localizationSpec ? projectCard(card, localizationSpec, language) : card),
    [card, localizationSpec, language],
  );

  const toStoredCard = useCallback(
    (edited) => (localizationSpec ? mergeCard(edited, localizationSpec, language) : edited),
    [localizationSpec, language],
  );

  const handleSave = useCallback(
    (updatedCard) => {
      updateCardData?.(cardUuid, toStoredCard(updatedCard));
    },
    [updateCardData, cardUuid, toStoredCard],
  );

  const { localCard, updateField, updateFields, replaceCard } = useCardEditorState(editableCard, handleSave);

  const sections = useMemo(() => resolveEditorSections(localCard, gameSystem, schema), [localCard, gameSystem, schema]);

  if (!isOpen || !localCard) return null;

  const handleDrillDownClose = () => {
    if (drillDown?.view === "weaponProfile") {
      setDrillDown({
        view: "weaponList",
        weaponTypeKey: drillDown.weaponTypeKey,
        config: drillDown.config,
      });
    } else {
      setDrillDown(null);
    }
  };

  const handleClose = () => {
    setDrillDown(null);
    onClose(toStoredCard(localCard));
  };

  const bannerColour = factionColours?.banner || "#1a1d2e";
  const headerColour = factionColours?.header || "#2a2d3e";
  const modalRoot = document.getElementById("modal-root");

  return ReactDOM.createPortal(
    <>
      <div className="mobile-editor-backdrop" onClick={handleClose} />
      <div
        className="mobile-editor"
        style={{
          "--me-banner": bannerColour,
          "--me-header": headerColour,
        }}>
        <div className="mobile-editor-header">
          <button className="mobile-editor-back" onClick={handleClose} type="button">
            <ArrowLeft size={20} />
          </button>
          <span className="mobile-editor-header-title">{localCard.name}</span>
          <span className="mobile-editor-header-badge">EDITING</span>
        </div>

        <div className="mobile-editor-content">
          {sections.map((section, index) => {
            const Component = SECTION_COMPONENTS[section.type];
            if (!Component) return null;
            const Icon = SECTION_ICONS[section.type];
            return (
              <div
                key={section.key}
                className="mobile-editor-section-entrance"
                style={{ animationDelay: `${index * 40}ms` }}>
                <Component
                  card={localCard}
                  config={section.config}
                  label={section.label}
                  icon={Icon}
                  updateField={updateField}
                  updateFields={updateFields}
                  replaceCard={replaceCard}
                  onDrillDown={setDrillDown}
                />
              </div>
            );
          })}
        </div>

        {/* Weapon drill-down views */}
        <DrillDownView
          isOpen={drillDown?.view === "weaponList"}
          onClose={handleDrillDownClose}
          title={drillDown?.config?.label || "Weapons"}>
          {drillDown?.view === "weaponList" && (
            <WeaponListView
              card={localCard}
              weaponTypeKey={drillDown.weaponTypeKey}
              config={drillDown.config}
              updateField={updateField}
              replaceCard={replaceCard}
              onEditWeapon={(weaponIndex, profileIndex) =>
                setDrillDown({
                  ...drillDown,
                  view: "weaponProfile",
                  weaponIndex,
                  profileIndex: profileIndex ?? 0,
                })
              }
            />
          )}
        </DrillDownView>

        <DrillDownView
          isOpen={drillDown?.view === "weaponProfile"}
          onClose={handleDrillDownClose}
          title={getDrillDownWeaponName(localCard, drillDown)}>
          {drillDown?.view === "weaponProfile" && (
            <WeaponProfileEditor
              card={localCard}
              weaponTypeKey={drillDown.weaponTypeKey}
              weaponIndex={drillDown.weaponIndex}
              profileIndex={drillDown.profileIndex}
              config={drillDown.config}
              updateField={updateField}
              replaceCard={replaceCard}
              onSelectProfile={(pIndex) => setDrillDown({ ...drillDown, profileIndex: pIndex })}
            />
          )}
        </DrillDownView>
      </div>
    </>,
    modalRoot,
  );
};

function getDrillDownWeaponName(card, drillDown) {
  if (!drillDown || drillDown.view !== "weaponProfile") return "Weapon";
  const weapons = getWeaponsArray(card, drillDown.weaponTypeKey, drillDown.config?.format);
  const weapon = weapons?.[drillDown.weaponIndex];
  if (!weapon) return "Weapon";
  if (weapon.profiles?.[drillDown.profileIndex]) {
    return weapon.profiles[drillDown.profileIndex].name || weapon.name || "Weapon";
  }
  return weapon.name || "Weapon";
}
