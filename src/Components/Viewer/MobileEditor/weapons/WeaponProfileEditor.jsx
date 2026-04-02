import { Plus, Trash2 } from "lucide-react";
import { EditorTextField } from "../shared/EditorTextField";
import { EditorNumberField } from "../shared/EditorNumberField";
import { EditorTagInput } from "../shared/EditorTagInput";
import { EditorToggle } from "../shared/EditorToggle";
import { getWeaponsArray, setWeaponsOnCard } from "./weaponHelpers";

export const WeaponProfileEditor = ({ card, weaponTypeKey, weaponIndex, profileIndex, config, replaceCard }) => {
  const { format, columns } = config;
  const weapons = getWeaponsArray(card, weaponTypeKey, format);

  const setWeapons = (updated) => {
    replaceCard(setWeaponsOnCard(card, weaponTypeKey, updated, format));
  };
  const weapon = weapons[weaponIndex];
  if (!weapon) return null;

  // 40k: weapons have profiles array
  if (format === "40k") {
    return (
      <FortyKProfileEditor
        weapons={weapons}
        weaponIndex={weaponIndex}
        profileIndex={profileIndex}
        columns={columns}
        setWeapons={setWeapons}
      />
    );
  }

  // AoS / custom: flat weapon properties
  return <FlatWeaponEditor weapons={weapons} weaponIndex={weaponIndex} columns={columns} setWeapons={setWeapons} />;
};

const FortyKProfileEditor = ({ weapons, weaponIndex, profileIndex, columns, setWeapons }) => {
  const weapon = weapons[weaponIndex];
  const profiles = weapon.profiles || [];
  const profile = profiles[profileIndex];
  if (!profile) return null;

  const updateProfile = (field, value) => {
    const updatedProfiles = [...profiles];
    updatedProfiles[profileIndex] = { ...profile, [field]: value };
    const updatedWeapons = [...weapons];
    updatedWeapons[weaponIndex] = { ...weapon, profiles: updatedProfiles };
    setWeapons(updatedWeapons);
  };

  const addProfile = () => {
    const blank = { name: "New Profile", active: true };
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
  };

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
          <EditorNumberField
            key={col.key}
            label={col.label}
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

      {profile.keywords && (
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
          <span>Add Profile</span>
        </button>
        {profiles.length > 1 && (
          <button
            className="mobile-editor-add-btn"
            onClick={removeProfile}
            type="button"
            style={{
              flex: 0,
              borderColor: "var(--bs-danger)",
              color: "var(--bs-danger)",
              background: "var(--bs-danger-bg)",
            }}>
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Show other profiles as navigation */}
      {profiles.length > 1 && (
        <div>
          <label className="mobile-editor-field-label">All Profiles ({profiles.length})</label>
          {profiles.map((p, i) => (
            <div
              key={i}
              style={{
                padding: "8px 0",
                borderBottom: "1px solid var(--bs-border-light)",
                fontWeight: i === profileIndex ? 600 : 400,
                color: i === profileIndex ? "var(--bs-accent)" : "var(--bs-text)",
                fontSize: 14,
              }}>
              {p.name || `Profile ${i + 1}`}
              {i === profileIndex && " (editing)"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FlatWeaponEditor = ({ weapons, weaponIndex, columns, setWeapons }) => {
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
        {columns?.map((col) => (
          <EditorNumberField
            key={col.key}
            label={col.label}
            value={weapon[col.key]}
            onChange={(value) => updateWeapon(col.key, value)}
          />
        ))}
      </div>

      <EditorToggle
        label="Active"
        checked={weapon.active !== false}
        onChange={(value) => updateWeapon("active", value)}
      />

      {weapon.keywords && (
        <EditorTagInput
          label="Keywords"
          tags={Array.isArray(weapon.keywords) ? weapon.keywords : []}
          onChange={(tags) => updateWeapon("keywords", tags)}
        />
      )}
    </div>
  );
};
