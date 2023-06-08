export const UnitKeywords = ({ keywords }) => {
  return (
    <div className="keywords">
      <span className="title">keywords</span>
      <span className="value">{keywords?.join(", ")}</span>
    </div>
  );
};
