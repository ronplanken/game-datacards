export const UnitStat = ({ value, showDamagedMarker }) => {
  return (
    <div className="stat">
      <div className={`value_container ${value?.length >= 3 ? "wide" : ""}`}>
        <div className="value">{value}</div>
      </div>
      {showDamagedMarker && <div className="damageTable" />}
    </div>
  );
};
