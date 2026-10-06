export const UnitKeywords = ({ keywords, label }) => {
  return (
    <div className="keywords">
      <span className="title">{label || "keywords"}</span>
      <span className="value">
        {keywords?.map((keyword, i, { length }) => {
          if (keyword?.includes(":")) {
            return (
              <span key={keyword} style={{ fontWeight: 400, textTransform: "uppercase", fontSize: "0.9rem" }}>
                {keyword}&nbsp;
              </span>
            );
          }
          return `${keyword}${length - 1 !== i ? "," : ""} `;
        })}
      </span>
    </div>
  );
};
