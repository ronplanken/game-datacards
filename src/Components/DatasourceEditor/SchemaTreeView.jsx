import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  BarChart3,
  Crosshair,
  Shield,
  Settings,
  List,
  FileText,
  Swords,
  BookOpen,
  Sparkles,
  Zap,
  Database,
  LayoutList,
  Palette,
  Info,
  Users,
} from "lucide-react";

const BASE_SYSTEM_LABELS = {
  "40k-10e": "Warhammer 40K 10th Edition",
  aos: "Age of Sigmar",
  blank: "Blank / Custom",
};

const BASETYPE_ICONS = {
  unit: Swords,
  rule: BookOpen,
  enhancement: Sparkles,
  stratagem: Zap,
};

const TYPE_BADGE_CLASSES = {
  string: "schema-type-badge string",
  richtext: "schema-type-badge richtext",
  enum: "schema-type-badge enum",
  boolean: "schema-type-badge boolean",
};

/**
 * A collapsible tree node with optional icon and children.
 */
const TreeNode = ({ label, icon: Icon, defaultOpen = false, children, badge, depth = 0 }) => {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = children != null;
  const connectorLeft = 12 + depth * 16 + 7;

  return (
    <div className={`schema-tree-node${depth === 0 ? " schema-tree-node-root" : ""}`}>
      <button
        className={`schema-tree-node-header ${hasChildren ? "expandable" : ""}`}
        style={{ paddingLeft: 12 + depth * 16 }}
        onClick={() => hasChildren && setOpen(!open)}
        aria-expanded={hasChildren ? open : undefined}>
        {hasChildren ? (
          open ? (
            <ChevronDown size={14} className="schema-tree-chevron" />
          ) : (
            <ChevronRight size={14} className="schema-tree-chevron" />
          )
        ) : (
          <span className="schema-tree-chevron-spacer" />
        )}
        {Icon && <Icon size={16} className="schema-tree-icon" />}
        <span className="schema-tree-label">{label}</span>
        {badge && <span className="schema-tree-badge">{badge}</span>}
      </button>
      {open && hasChildren && (
        <div className="schema-tree-children" style={{ "--tree-connector-left": `${connectorLeft}px` }}>
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * A leaf flag/info row inside the tree (used for "X enabled" or "X: value" lines).
 */
const FlagRow = ({ label, depth }) => (
  <div className="schema-tree-node">
    <div className="schema-tree-node-header schema-tree-flag" style={{ paddingLeft: 12 + depth * 16 }}>
      <span className="schema-tree-chevron-spacer" />
      <span className="schema-tree-flag-label">{label}</span>
    </div>
  </div>
);

/**
 * An expandable row that renders FieldNode-style content (key + label + type
 * badge as direct flex children, so the badge can right-align via
 * `margin-left: auto`) AND optionally contains tree children below.
 * Used for ability categories which have both a "row identity" (key/label/format)
 * and sub-flags (phase style, layout, etc.).
 */
const ExpandableFieldRow = ({ field, depth, children }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = children != null && (Array.isArray(children) ? children.some(Boolean) : true);
  const connectorLeft = 12 + depth * 16 + 7;

  return (
    <div className="schema-tree-node">
      <button
        className={`schema-tree-node-header schema-tree-field ${hasChildren ? "expandable" : ""}`}
        style={{ paddingLeft: 12 + depth * 16 }}
        onClick={() => hasChildren && setOpen(!open)}
        aria-expanded={hasChildren ? open : undefined}>
        {hasChildren ? (
          open ? (
            <ChevronDown size={14} className="schema-tree-chevron" />
          ) : (
            <ChevronRight size={14} className="schema-tree-chevron" />
          )
        ) : (
          <span className="schema-tree-chevron-spacer" />
        )}
        <span className="schema-tree-field-key">{field.key}</span>
        {field.label && field.label !== field.key && <span className="schema-tree-field-label">{field.label}</span>}
        {field.badge && <span className="schema-type-badge string">{field.badge}</span>}
      </button>
      {open && hasChildren && (
        <div className="schema-tree-children" style={{ "--tree-connector-left": `${connectorLeft}px` }}>
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Renders a single field definition node.
 * Enum fields with options are collapsible to reveal the option values.
 * Fields with extra flags (special, hideWhenEmpty) show those as sub-rows.
 */
const FieldNode = ({ field, depth }) => {
  const [open, setOpen] = useState(false);
  const badgeClass = TYPE_BADGE_CLASSES[field.type] || "schema-type-badge";
  const hasOptions = field.type === "enum" && Array.isArray(field.options) && field.options.length > 0;
  const extraFlags = [];
  if (field.special) extraFlags.push("Special field");
  if (field.hideWhenEmpty) extraFlags.push("Hide when empty");
  const expandable = hasOptions || extraFlags.length > 0;

  return (
    <div className="schema-tree-node">
      <button
        className={`schema-tree-node-header schema-tree-field ${expandable ? "expandable" : ""}`}
        style={{ paddingLeft: 12 + depth * 16 }}
        onClick={() => expandable && setOpen(!open)}
        aria-expanded={expandable ? open : undefined}>
        {expandable ? (
          open ? (
            <ChevronDown size={14} className="schema-tree-chevron" />
          ) : (
            <ChevronRight size={14} className="schema-tree-chevron" />
          )
        ) : (
          <span className="schema-tree-chevron-spacer" />
        )}
        <span className="schema-tree-field-key">{field.key}</span>
        {field.label && field.label !== field.key && <span className="schema-tree-field-label">{field.label}</span>}
        <span className={badgeClass}>{field.type}</span>
      </button>
      {open && expandable && (
        <div className="schema-tree-children">
          {extraFlags.map((flag) => (
            <FlagRow key={flag} label={flag} depth={depth + 1} />
          ))}
          {hasOptions &&
            field.options.map((opt) => (
              <div key={opt} className="schema-tree-node">
                <div
                  className="schema-tree-node-header schema-tree-enum-option"
                  style={{ paddingLeft: 12 + (depth + 1) * 16 }}>
                  <span className="schema-tree-chevron-spacer" />
                  <span className="schema-tree-enum-option-value">{opt}</span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

/**
 * Renders the schema tree for a unit card type.
 */
const UnitSchemaTree = ({ schema }) => {
  if (!schema) return null;

  return (
    <>
      {/* Stats section */}
      {schema.stats && (
        <TreeNode label={schema.stats.label || "Stats"} icon={BarChart3} defaultOpen={true} depth={0}>
          {schema.stats.fields?.map((field) => (
            <FieldNode key={field.key} field={field} depth={1} />
          ))}
          {schema.stats.allowMultipleProfiles && <FlagRow label="Multiple stat profiles enabled" depth={1} />}
        </TreeNode>
      )}

      {/* Weapon types section */}
      {schema.weaponTypes && (
        <TreeNode
          label={schema.weaponTypes.label || "Weapon Types"}
          icon={Crosshair}
          defaultOpen={true}
          badge={`${schema.weaponTypes.types?.length || 0}`}
          depth={0}>
          {schema.weaponTypes.types?.map((weaponType) => (
            <TreeNode key={weaponType.key} label={weaponType.label || weaponType.key} defaultOpen={false} depth={1}>
              {weaponType.columns?.map((col) => (
                <FieldNode key={col.key} field={col} depth={2} />
              ))}
              {weaponType.phaseStyle && <FlagRow label={`Phase style: ${weaponType.phaseStyle}`} depth={2} />}
              {weaponType.linkedAbilityCategory && (
                <FlagRow label={`Linked ability category: ${weaponType.linkedAbilityCategory}`} depth={2} />
              )}
              {weaponType.hasKeywords && <FlagRow label="Weapon keywords enabled" depth={2} />}
              {weaponType.hasProfiles && (
                <TreeNode label="Multiple profiles enabled" defaultOpen={false} depth={2}>
                  {weaponType.profileRelation && (
                    <FlagRow label={`Relation: ${weaponType.profileRelation}`} depth={3} />
                  )}
                  {weaponType.profileChildLabel && (
                    <FlagRow label={`Child label: ${weaponType.profileChildLabel}`} depth={3} />
                  )}
                </TreeNode>
              )}
            </TreeNode>
          ))}
        </TreeNode>
      )}

      {/* Abilities section */}
      {schema.abilities && (
        <TreeNode
          label={schema.abilities.label || "Abilities"}
          icon={Shield}
          defaultOpen={true}
          badge={`${schema.abilities.categories?.length || 0}`}
          depth={0}>
          {schema.abilities.categories?.map((cat) => {
            const subFlags = [];
            if (cat.phaseStyle) subFlags.push(`Phase style: ${cat.phaseStyle}`);
            if (cat.layout) subFlags.push(`Layout: ${cat.layout}`);
            if (cat.hasType) subFlags.push("Type pill enabled");
            if (cat.hasCost) subFlags.push("Cost chip enabled");
            if (cat.hasTriggerIcon) subFlags.push("Trigger icon enabled");
            return (
              <ExpandableFieldRow key={cat.key} field={{ key: cat.key, label: cat.label, badge: cat.format }} depth={1}>
                {subFlags.map((flag) => (
                  <FlagRow key={flag} label={flag} depth={2} />
                ))}
              </ExpandableFieldRow>
            );
          })}
          {schema.abilities.hasInvulnerableSave && <FlagRow label="Invulnerable save enabled" depth={1} />}
          {schema.abilities.hasDamagedAbility && <FlagRow label="Damaged profile enabled" depth={1} />}
        </TreeNode>
      )}

      {/* Sections */}
      {schema.sections && (
        <TreeNode
          label={schema.sections.label || "Sections"}
          icon={LayoutList}
          defaultOpen={true}
          badge={`${schema.sections.sections?.length || 0}`}
          depth={0}>
          {schema.sections.sections?.map((section) => (
            <div key={section.key} className="schema-tree-node">
              <div className="schema-tree-node-header schema-tree-field" style={{ paddingLeft: 12 + 1 * 16 }}>
                <span className="schema-tree-chevron-spacer" />
                <span className="schema-tree-field-key">{section.key}</span>
                {section.label && <span className="schema-tree-field-label">{section.label}</span>}
                <span className="schema-type-badge string">{section.format}</span>
              </div>
            </div>
          ))}
        </TreeNode>
      )}

      {/* Metadata section */}
      {schema.metadata && (
        <TreeNode label="Card Properties" icon={Settings} defaultOpen={true} depth={0}>
          {schema.metadata.hasKeywords && (
            <FlagRow label={`Keywords (${schema.metadata.keywordsLabel || "Keywords"})`} depth={1} />
          )}
          {schema.metadata.hasFactionKeywords && (
            <FlagRow label={`Faction keywords (${schema.metadata.factionKeywordsLabel || "Faction"})`} depth={1} />
          )}
          {schema.metadata.hasCombatRole && <FlagRow label="Combat Role badge enabled" depth={1} />}
          {schema.metadata.hasArmySlot && <FlagRow label="Army Slot badge enabled" depth={1} />}
          {schema.metadata.hasPoints && (
            <TreeNode label={`Points (${schema.metadata.pointsFormat || "per-unit"})`} defaultOpen={false} depth={1}>
              {schema.metadata.pointsLabel && <FlagRow label={`Label: ${schema.metadata.pointsLabel}`} depth={2} />}
            </TreeNode>
          )}
          {schema.metadata.bannerType && schema.metadata.bannerType !== "faction" && (
            <TreeNode label={`Banner: ${schema.metadata.bannerType}`} defaultOpen={false} depth={1}>
              {schema.metadata.bannerType === "custom" && schema.metadata.bannerCustomText && (
                <FlagRow label={`Text: ${schema.metadata.bannerCustomText}`} depth={2} />
              )}
            </TreeNode>
          )}
        </TreeNode>
      )}
    </>
  );
};

/**
 * Renders a generic fields-based schema tree (rule, enhancement, stratagem).
 */
const GenericSchemaTree = ({ schema, baseType }) => {
  if (!schema) return null;

  return (
    <>
      {/* Top-level fields */}
      {schema.fields && (
        <TreeNode label="Fields" icon={List} defaultOpen={true} badge={`${schema.fields.length}`} depth={0}>
          {schema.fields.map((field) => (
            <FieldNode key={field.key} field={field} depth={1} />
          ))}
        </TreeNode>
      )}

      {/* Rules collection (rule type) */}
      {schema.rules && (
        <TreeNode
          label={schema.rules.label || "Rules"}
          icon={FileText}
          defaultOpen={true}
          badge={`${schema.rules.fields?.length || 0}`}
          depth={0}>
          {schema.rules.fields?.map((field) => (
            <FieldNode key={field.key} field={field} depth={1} />
          ))}
          {schema.rules.allowMultiple && <FlagRow label="Multiple entries allowed" depth={1} />}
        </TreeNode>
      )}

      {/* Keywords collection (enhancement type) */}
      {schema.keywords && (
        <TreeNode
          label={schema.keywords.label || "Keywords"}
          icon={FileText}
          defaultOpen={true}
          badge={`${schema.keywords.fields?.length || 0}`}
          depth={0}>
          {schema.keywords.fields?.map((field) => (
            <FieldNode key={field.key} field={field} depth={1} />
          ))}
          {schema.keywords.allowMultiple && <FlagRow label="Multiple entries allowed" depth={1} />}
        </TreeNode>
      )}
    </>
  );
};

/**
 * Renders a datasource overview showing all card types with field counts.
 */
const DatasourceOverview = ({ datasource }) => {
  const cardTypes = datasource?.schema?.cardTypes || [];

  const getFieldCount = (cardType) => {
    const schema = cardType.schema;
    if (!schema) return 0;

    if (cardType.baseType === "unit") {
      let count = 0;
      count += schema.stats?.fields?.length || 0;
      schema.weaponTypes?.types?.forEach((wt) => {
        count += wt.columns?.length || 0;
      });
      count += schema.abilities?.categories?.length || 0;
      return count;
    }

    return schema.fields?.length || 0;
  };

  return (
    <div className="schema-tree-overview">
      <div className="schema-tree-overview-header">
        <Database size={16} className="schema-tree-icon" />
        <span className="schema-tree-overview-title">{datasource.name}</span>
      </div>
      <div className="schema-tree-overview-list">
        {cardTypes.map((ct) => {
          const Icon = BASETYPE_ICONS[ct.baseType] || BookOpen;
          const fieldCount = getFieldCount(ct);
          return (
            <div key={ct.key} className="schema-tree-overview-item">
              <Icon size={14} className="schema-tree-icon" />
              <span className="schema-tree-overview-item-label">{ct.label}</span>
              <span className="schema-tree-overview-item-type">{ct.baseType}</span>
              <span className="schema-tree-overview-item-count">
                {fieldCount} field{fieldCount !== 1 ? "s" : ""}
              </span>
            </div>
          );
        })}
        {cardTypes.length === 0 && (
          <div className="schema-tree-overview-empty">
            No card types defined. Use &ldquo;Add Card Type&rdquo; to get started.
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Renders the datasource-level settings (colours, system, glossary, factions)
 * as a collapsible tree, mirroring the card-type schema tree.
 */
const DatasourceSettingsTree = ({ datasource }) => {
  const schema = datasource?.schema || {};
  const colours = schema.colours || {};
  const glossary = schema.keywordGlossary || [];
  const factions = datasource?.data || [];
  const baseSystemLabel = BASE_SYSTEM_LABELS[schema.baseSystem] || schema.baseSystem || "Custom";

  return (
    <div className="schema-tree-content">
      <TreeNode label="Colours" icon={Palette} defaultOpen={true} depth={0}>
        {colours.header && <FlagRow label={`Header: ${colours.header}`} depth={1} />}
        {colours.banner && <FlagRow label={`Banner: ${colours.banner}`} depth={1} />}
        {colours.accent && <FlagRow label={`Accent: ${colours.accent}`} depth={1} />}
        {!colours.header && !colours.banner && !colours.accent && <FlagRow label="No colours set" depth={1} />}
      </TreeNode>

      <TreeNode label="System" icon={Info} defaultOpen={true} depth={0}>
        <FlagRow label={`Base system: ${baseSystemLabel}`} depth={1} />
        {datasource.version && <FlagRow label={`Version: ${datasource.version}`} depth={1} />}
        {datasource.author && <FlagRow label={`Author: ${datasource.author}`} depth={1} />}
      </TreeNode>

      <TreeNode label="Keyword Glossary" icon={BookOpen} defaultOpen={false} badge={`${glossary.length}`} depth={0}>
        {glossary.length === 0 && <FlagRow label="No keywords defined" depth={1} />}
        {glossary.map((entry, i) => {
          const scopes = Array.isArray(entry.appliesTo) ? entry.appliesTo : [];
          return (
            <TreeNode
              key={entry.key || entry.name || i}
              label={entry.name || entry.key || "Untitled keyword"}
              defaultOpen={false}
              depth={1}>
              <FlagRow label={`Match type: ${entry.matchType || "exact"}`} depth={2} />
              {scopes.length > 0 && <FlagRow label={`Applies to: ${scopes.join(", ")}`} depth={2} />}
              {scopes.includes("weapons") && (
                <FlagRow label={`Display: ${entry.displayMode || "explanation"}`} depth={2} />
              )}
            </TreeNode>
          );
        })}
      </TreeNode>

      <TreeNode label="Factions" icon={Users} defaultOpen={false} badge={`${factions.length}`} depth={0}>
        {factions.length === 0 && <FlagRow label="No factions defined" depth={1} />}
        {factions.map((faction) => (
          <FlagRow key={faction.id} label={faction.name || faction.id} depth={1} />
        ))}
      </TreeNode>
    </div>
  );
};

/**
 * Schema tree visualization for the center panel.
 * Shows the selected card type's full schema structure, or a datasource overview.
 */
export const SchemaTreeView = ({ selectedItem, activeDatasource }) => {
  if (!selectedItem || !activeDatasource) return null;

  // Datasource parent selected: show overview + settings tree
  if (selectedItem.type === "datasource") {
    return (
      <div className="schema-tree-container">
        <DatasourceOverview datasource={activeDatasource} />
        <DatasourceSettingsTree datasource={activeDatasource} />
      </div>
    );
  }

  // Card type selected: show schema tree
  if (selectedItem.type === "cardType" && selectedItem.data) {
    const cardType = selectedItem.data;
    const Icon = BASETYPE_ICONS[cardType.baseType] || BookOpen;

    return (
      <div className="schema-tree-container">
        <div className="schema-tree-header">
          <Icon size={16} className="schema-tree-icon" />
          <span className="schema-tree-header-title">{cardType.label}</span>
          <span className="schema-tree-overview-item-type">{cardType.baseType}</span>
        </div>
        <div className="schema-tree-content">
          {cardType.baseType === "unit" ? (
            <UnitSchemaTree schema={cardType.schema} />
          ) : (
            <GenericSchemaTree schema={cardType.schema} baseType={cardType.baseType} />
          )}
        </div>
      </div>
    );
  }

  return null;
};

export { TreeNode, FieldNode, UnitSchemaTree, GenericSchemaTree, DatasourceOverview };
