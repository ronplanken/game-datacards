export const UnitFactions = ({ factions }) => {
  return (
    <div className="factions">
      <span className="title">faction keywords</span>
      <span className="value">{factions?.join(", ")}</span>
    </div>
  );
};
