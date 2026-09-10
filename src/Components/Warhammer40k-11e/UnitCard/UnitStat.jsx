import { DamagedIcon } from "../../Icons/WeaponTypeIcon";

export const UnitStat = ({ value, showDamagedMarker, specialColor }) => {
  const containerStyle = specialColor ? { background: specialColor } : undefined;

  return (
    <div className="stat">
      <div className="value_container" style={containerStyle}>
        <div className="value">{value}</div>
      </div>
      {showDamagedMarker && (
        <div className="damageTable">
          <DamagedIcon color="white" />
        </div>
      )}
    </div>
  );
};
