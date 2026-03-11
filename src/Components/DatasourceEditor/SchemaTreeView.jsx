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
} from "lucide-react";

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
 * Renders a single field definition node.
 * Enum fields with options are collapsible to reveal the option values.
 */
const FieldNode = ({ field, depth }) => {
  const [open, setOpen] = useState(false);
  const badgeClass = TYPE_BADGE_CLASSES[field.type] || "schema-type-badge";
  const hasOptions = field.type === "enum" && Array.isArray(field.options) && field.options.length > 0;

  return (
    <div className="schema-tree-node">
      <button
        className={`schema-tree-node-header schema-tree-field ${hasOptions ? "expandable" : ""}`}
        style={{ paddingLeft: 12 + depth * 16 }}
        onClick={() => hasOptions && setOpen(!open)}
        aria-expanded={hasOptions ? open : undefined}>
        {hasOptions ? (
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
        {field.required && <span className="schema-tree-required">required</span>}
      </button>
      {open && hasOptions && (
        <div className="schema-tree-children">
          {field.options.map((opt) => (
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
          {schema.stats.allowMultipleProfiles && (
            <div className="schema-tree-node">
              <div className="schema-tree-node-header schema-tree-flag" style={{ paddingLeft: 12 + 1 * 16 }}>
                <span className="schema-tree-chevron-spacer" />
                <span className="schema-tree-flag-label">Multiple profiles enabled</span>
              </div>
            </div>
          )}
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
              {weaponType.hasKeywords && (
                <div className="schema-tree-node">
                  <div className="schema-tree-node-header schema-tree-flag" style={{ paddingLeft: 12 + 2 * 16 }}>
                    <span className="schema-tree-chevron-spacer" />
                    <span className="schema-tree-flag-label">Weapon keywords enabled</span>
                  </div>
                </div>
              )}
              {weaponType.hasProfiles && (
                <div className="schema-tree-node">
                  <div className="schema-tree-node-header schema-tree-flag" style={{ paddingLeft: 12 + 2 * 16 }}>
                    <span className="schema-tree-chevron-spacer" />
                    <span className="schema-tree-flag-label">Weapon profiles enabled</span>
                  </div>
                </div>
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
          {schema.abilities.categories?.map((cat) => (
            <div key={cat.key} className="schema-tree-node">
              <div className="schema-tree-node-header schema-tree-field" style={{ paddingLeft: 12 + 1 * 16 }}>
                <span className="schema-tree-chevron-spacer" />
                <span className="schema-tree-field-key">{cat.key}</span>
                {cat.label && <span className="schema-tree-field-label">{cat.label}</span>}
                <span className="schema-type-badge string">{cat.format}</span>
              </div>
            </div>
          ))}
          {schema.abilities.hasInvulnerableSave && (
            <div className="schema-tree-node">
              <div className="schema-tree-node-header schema-tree-flag" style={{ paddingLeft: 12 + 1 * 16 }}>
                <span className="schema-tree-chevron-spacer" />
                <span className="schema-tree-flag-label">Invulnerable save enabled</span>
              </div>
            </div>
          )}
          {schema.abilities.hasDamagedAbility && (
            <div className="schema-tree-node">
              <div className="schema-tree-node-header schema-tree-flag" style={{ paddingLeft: 12 + 1 * 16 }}>
                <span className="schema-tree-chevron-spacer" />
                <span className="schema-tree-flag-label">Damaged profile enabled</span>
              </div>
            </div>
          )}
        </TreeNode>
      )}

      {/* Metadata section */}
      {schema.metadata && (
        <TreeNode label="Card Properties" icon={Settings} defaultOpen={true} depth={0}>
          {schema.metadata.hasKeywords && (
            <div className="schema-tree-node">
              <div className="schema-tree-node-header schema-tree-flag" style={{ paddingLeft: 12 + 1 * 16 }}>
                <span className="schema-tree-chevron-spacer" />
                <span className="schema-tree-flag-label">Keywords enabled</span>
              </div>
            </div>
          )}
          {schema.metadata.hasFactionKeywords && (
            <div className="schema-tree-node">
              <div className="schema-tree-node-header schema-tree-flag" style={{ paddingLeft: 12 + 1 * 16 }}>
                <span className="schema-tree-chevron-spacer" />
                <span className="schema-tree-flag-label">Faction keywords enabled</span>
              </div>
            </div>
          )}
          {schema.metadata.hasPoints && (
            <div className="schema-tree-node">
              <div className="schema-tree-node-header schema-tree-flag" style={{ paddingLeft: 12 + 1 * 16 }}>
                <span className="schema-tree-chevron-spacer" />
                <span className="schema-tree-flag-label">Points ({schema.metadata.pointsFormat || "per-unit"})</span>
              </div>
            </div>
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
          {schema.rules.allowMultiple && (
            <div className="schema-tree-node">
              <div className="schema-tree-node-header schema-tree-flag" style={{ paddingLeft: 12 + 1 * 16 }}>
                <span className="schema-tree-chevron-spacer" />
                <span className="schema-tree-flag-label">Multiple entries allowed</span>
              </div>
            </div>
          )}
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
          {schema.keywords.allowMultiple && (
            <div className="schema-tree-node">
              <div className="schema-tree-node-header schema-tree-flag" style={{ paddingLeft: 12 + 1 * 16 }}>
                <span className="schema-tree-chevron-spacer" />
                <span className="schema-tree-flag-label">Multiple entries allowed</span>
              </div>
            </div>
          )}
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
 * Schema tree visualization for the center panel.
 * Shows the selected card type's full schema structure, or a datasource overview.
 */
export const SchemaTreeView = ({ selectedItem, activeDatasource }) => {
  if (!selectedItem || !activeDatasource) return null;

  // Datasource parent selected: show overview
  if (selectedItem.type === "datasource") {
    return (
      <div className="schema-tree-container">
        <DatasourceOverview datasource={activeDatasource} />
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
