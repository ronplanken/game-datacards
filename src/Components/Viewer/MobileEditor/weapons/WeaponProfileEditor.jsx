import { Plus, Trash2 } from "lucide-react";
import { EditorTextField } from "../shared/EditorTextField";
import { EditorNumberField } from "../shared/EditorNumberField";
import { EditorSelectField } from "../shared/EditorSelectField";
import { EditorTagInput } from "../shared/EditorTagInput";
import { EditorToggle } from "../shared/EditorToggle";
import { getWeaponsArray, setWeaponsOnCard } from "./weaponHelpers";

// Columns that store arrays and need special handling
const ARRAY_COLUMNS = new Set(["abilities"]);

/**
 * Render a single weapon column input using the schema field type so enum
 * columns get a Select (matching desktop SchemaFieldEditor) while string /
 * richtext stay on the stat-cell EditorNumberField that already styles the
 * grid layout for stat-like values.
 */
const ColumnInput = ({ column, value, onChange }) => {
  if (column.type === "boolean") {
    return <EditorToggle label={column.label} checked={!!value} onChange={onChange} />;
  }
  if (column.type === "enum" && Array.isArray(column.options) && column.options.length > 0) {
    const options = column.options.map((opt) => ({ value: opt, label: opt }));
    return <EditorSelectField label={column.label} value={value} onChange={onChange} options={options} />;
  }
  if (column.type === "richtext") {
    return <EditorTextField label={column.label} value={value} onChange={onChange} multiline />;
  }
  return <EditorNumberField label={column.label} value={value} onChange={onChange} />;
};

export const WeaponProfileEditor = ({
  card,
  weaponTypeKey,
  weaponIndex,
  profileIndex,
  config,
  replaceCard,
  onSelectProfile,
}) => {
  const { format, columns, hasProfiles } = config;
  const weapons = getWeaponsArray(card, weaponTypeKey, format);

  const setWeapons = (updated) => {
    replaceCard(setWeaponsOnCard(card, weaponTypeKey, updated, format));
  };
  const weapon = weapons[weaponIndex];
  if (!weapon) return null;

  // 40k always uses profiles; custom uses profiles when its weapon type declares
  // hasProfiles=true. AoS and the flat custom fallback edit the weapon directly.
  const useProfiles = format === "40k" || (format === "custom" && hasProfiles);

  if (useProfiles) {
    return (
      <ProfileWeaponEditor
        weapons={weapons}
        weaponIndex={weaponIndex}
        profileIndex={profileIndex}
        columns={columns}
        config={config}
        setWeapons={setWeapons}
        onSelectProfile={onSelectProfile}
      />
    );
  }

  return (
    <FlatWeaponEditor
      weapons={weapons}
      weaponIndex={weaponIndex}
      columns={columns}
      config={config}
      setWeapons={setWeapons}
    />
  );
};

const ProfileWeaponEditor = ({ weapons, weaponIndex, profileIndex, columns, config, setWeapons, onSelectProfile }) => {
  const weapon = weapons[weaponIndex];
  const profiles = weapon.profiles || [];
  const profile = profiles[profileIndex];
  if (!profile) return null;

  const hasKeywords = config.hasKeywords !== false;
  const isParentChild = config.profileRelation === "parent-child";
  const childLabel = config.profileChildLabel || "Upgrade";

  const updateProfile = (field, value) => {
    const updatedProfiles = [...profiles];
    updatedProfiles[profileIndex] = { ...profile, [field]: value };
    const updatedWeapons = [...weapons];
    updatedWeapons[weaponIndex] = { ...weapon, profiles: updatedProfiles };
    setWeapons(updatedWeapons);
  };

  const addProfile = () => {
    const isUpgrade = isParentChild;
    const baseName = isUpgrade ? `${childLabel} ${profiles.length}` : `Profile ${profiles.length + 1}`;
    const blank = { name: baseName, active: true, keywords: [] };
    if (isUpgrade) blank.upgrade = true;
    columns?.forEach((col) => (blank[col.key] = ""));
    const updatedWeapons = [...weapons];
    updatedWeapons[weaponIndex] = { ...weapon, profiles: [...profiles, blank] };
    setWeapons(updatedWeapons);
  };

  const removeProfile = () => {
    if (profiles.length <= 1) return;
    const updatedProfiles = profiles.filter((_, i) => i !== profileIndex);
    const updatedWeapons = [...weapons];
    updatedWeapons[weaponIndex] = { ...weapon, profiles: updatedProfiles };
    setWeapons(updatedWeapons);
    const clampedIndex = Math.min(profileIndex, updatedProfiles.length - 1);
    onSelectProfile?.(clampedIndex);
  };

  // Parent-child shows the base flush and additional rows as indented upgrades;
  // mirror that visual rhythm on the add button label so editors know what
  // they'll create.
  const addButtonLabel = isParentChild
    ? profiles.length === 0
      ? "Add weapon"
      : `Add ${childLabel.toLowerCase()}`
    : "Add Profile";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <EditorTextField
        label="Name"
        value={profile.name}
        onChange={(value) => updateProfile("name", value)}
        placeholder="Weapon name"
      />

      <div className="mobile-editor-profile-grid">
        {columns?.map((col) => (
          <ColumnInput
            key={col.key}
            column={col}
            value={profile[col.key]}
            onChange={(value) => updateProfile(col.key, value)}
          />
        ))}
      </div>

      <EditorToggle
        label="Active"
        checked={profile.active !== false}
        onChange={(value) => updateProfile("active", value)}
      />

      {hasKeywords && (
        <EditorTagInput
          label="Keywords"
          tags={profile.keywords || []}
          onChange={(tags) => updateProfile("keywords", tags)}
        />
      )}

      {/* Profile management */}
      <div style={{ display: "flex", gap: 8 }}>
        <button className="mobile-editor-add-btn" onClick={addProfile} type="button" style={{ flex: 1 }}>
          <Plus size={14} />
          <span>{addButtonLabel}</span>
        </button>
        {profiles.length > 1 && (
          <button className="mobile-editor-profile-delete-btn" onClick={removeProfile} type="button">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Profile switcher */}
      {profiles.length > 1 && (
        <div className="mobile-editor-profile-switcher">
          <label className="mobile-editor-field-label">All Profiles ({profiles.length})</label>
          <div className="mobile-editor-profile-list">
            {profiles.map((p, i) => (
              <button
                key={i}
                type="button"
                className={`mobile-editor-profile-item${i === profileIndex ? " active" : ""}${
                  isParentChild && i > 0 ? " mobile-editor-profile-item--upgrade" : ""
                }`}
                onClick={() => onSelectProfile?.(i)}>
                <span className="mobile-editor-profile-item-name">{p.name || `Profile ${i + 1}`}</span>
                {i === profileIndex && <span className="mobile-editor-profile-item-badge">editing</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const FlatWeaponEditor = ({ weapons, weaponIndex, columns, config, setWeapons }) => {
  const weapon = weapons[weaponIndex];

  const updateWeapon = (field, value) => {
    const updated = [...weapons];
    updated[weaponIndex] = { ...weapon, [field]: value };
    setWeapons(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <EditorTextField
        label="Name"
        value={weapon.name}
        onChange={(value) => updateWeapon("name", value)}
        placeholder="Weapon name"
      />

      <div className="mobile-editor-profile-grid">
        {columns
          ?.filter((col) => !ARRAY_COLUMNS.has(col.key))
          .map((col) => (
            <ColumnInput
              key={col.key}
              column={col}
              value={weapon[col.key]}
              onChange={(value) => updateWeapon(col.key, value)}
            />
          ))}
      </div>

      {columns
        ?.filter((col) => ARRAY_COLUMNS.has(col.key))
        .map((col) => {
          const arr = weapon[col.key];
          return (
            <EditorTextField
              key={col.key}
              label={col.label}
              value={Array.isArray(arr) ? arr.join(", ") : arr || ""}
              onChange={(value) =>
                updateWeapon(
                  col.key,
                  value
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean),
                )
              }
              placeholder="Comma-separated values"
            />
          );
        })}

      <EditorToggle
        label="Active"
        checked={weapon.active !== false}
        onChange={(value) => updateWeapon("active", value)}
      />

      {config?.hasKeywords && (
        <EditorTagInput
          label="Keywords"
          tags={weapon.keywords || []}
          onChange={(tags) => updateWeapon("keywords", tags)}
        />
      )}
    </div>
  );
};
