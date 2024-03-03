export const UnitWargear = ({ unit }) => {
  const explanations = [];
  return (
    <div className="wargear_container">
      <div className="wargear">
        <div className="heading">
          <div className="title">Wargear Options</div>
        </div>
        <div className="content">
          {unit.wargear?.map((wargear, index) => {
            if (wargear.includes(" *")) {
              const lines = wargear.split(" *");
              explanations.push(...lines.slice(1));
              return (
                <div className="item" key={`wargear-${index}`}>
                  <span className="description">{lines[0].replaceAll("◦", "\n\r◦")}</span>
                </div>
              );
            }
            return (
              <div className="item" key={`wargear-${index}`}>
                <span className="description">{wargear.replaceAll("◦", "\n\r◦")}</span>
              </div>
            );
          })}
        </div>
        {explanations.map((explanation, index) => {
          return (
            <div className="explanation" key={`explanation-${index}`}>
              {explanation}
            </div>
          );
        })}
      </div>
    </div>
  );
};
