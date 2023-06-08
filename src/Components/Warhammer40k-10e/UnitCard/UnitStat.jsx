export const UnitStat = ({ value, showDamagedMarker }) => {
  return (
    <div className="stat">
      <div className="value_container">
        <div className="value">{value}</div>
      </div>
      {showDamagedMarker && <div className="damageTable" />}
    </div>
  );
};
