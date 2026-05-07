export const UnitFactions = ({ factions, label }) => {
  return (
    <div className="factions">
      <span className="title">{label || "faction"}</span>
      <span className="value">{factions?.join(", ")}</span>
    </div>
  );
};
