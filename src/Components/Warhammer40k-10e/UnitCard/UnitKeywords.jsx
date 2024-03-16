export const UnitKeywords = ({ keywords }) => {
  return (
    <div className="keywords">
      <span className="title">keywords</span>
      <span className="value">
        {keywords?.map((keyword) => {
          if (keyword?.includes(":")) {
            return (
              <span key={keyword} style={{ fontWeight: 400, textTransform: "uppercase", fontSize: "0.9rem" }}>
                {keyword}&nbsp;
              </span>
            );
          }
          return `${keyword}, `;
        })}
      </span>
    </div>
  );
};
