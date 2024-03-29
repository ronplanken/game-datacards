export const WeaponStatProfile = ({ type }) => {
  const renderType = (weaponType) => {
    if (!weaponType) {
      return <></>;
    }
    if (weaponType.includes("Melee")) {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="weapon-icon melee"></span>
        </div>
      );
    }
    if (weaponType.includes("Heavy")) {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="weapon-icon heavy-weapon"></span>
          {weaponType.replace("Heavy", "")}
        </div>
      );
    }
    if (weaponType.includes("Assault")) {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="weapon-icon assault-weapon"></span>
          {weaponType.replace("Assault", "")}
        </div>
      );
    }
    if (weaponType.includes("Pistol")) {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="weapon-icon pistol"></span>
          {weaponType.replace("Pistol", "")}
        </div>
      );
    }
    if (weaponType.includes("Grenade")) {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="weapon-icon grenade"></span>
          {weaponType.replace("Grenade", "")}
        </div>
      );
    }
    if (weaponType.includes("Rapid Fire")) {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="weapon-icon rapid-fire"></span>
          {weaponType.replace("Rapid Fire", "")}
        </div>
      );
    }
    if (weaponType.includes("Dakka")) {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="weapon-icon dakka"></span>
          {weaponType.replace("Dakka", "")}
        </div>
      );
    }
    return <div style={{ display: "flex", alignItems: "center" }}>{weaponType}</div>;
  };

  return renderType(type);
};
