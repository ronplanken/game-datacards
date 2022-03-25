export const WeaponStatProfile = ({ type }) => {
  const renderType = (weaponType: string) => {
    if (!weaponType) {
      return <></>;
    }

    if (weaponType.includes('Melee')) {
      return (
        <div style={{ display: 'flex', alignItems: "center" }}>
          <span className='weapon-icon melee'></span>
        </div>
      );
    }
    if (weaponType.includes('Heavy')) {
      return (
        <div style={{ display: 'flex', alignItems: "center" }}>
          <span className='weapon-icon heavy-weapon'></span>
          {weaponType.replace('Heavy', '')}
        </div>
      );
    }
    if (weaponType.includes('Assault')) {
      return (
        <div style={{ display: 'flex', alignItems: "center" }}>
          <span className='weapon-icon assault-weapon'></span>
          {weaponType.replace('Assault', '')}
        </div>
      );
    }
    if (weaponType.includes('Pistol')) {
      return (
        <div style={{ display: 'flex', alignItems: "center" }}>
          <span className='weapon-icon pistol'></span>
          {weaponType.replace('Pistol', '')}
        </div>
      );
    }
    if (weaponType.includes('Rapid Fire')) {
      return (
        <div style={{ display: 'flex', alignItems: "center" }}>
          <span className='weapon-icon rapid-fire'></span>
          {weaponType.replace('Rapid Fire', '')}
        </div>
      );
    }
    return <></>;
  };

  return renderType(type);
};
