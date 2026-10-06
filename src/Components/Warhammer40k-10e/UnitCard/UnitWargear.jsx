export const UnitWargear = ({ unit }) => {
  const explanations = [];
  return (
    <div className="wargear_container">
      {unit.showWargear !== false && (
        <div className="wargear">
          <div className="heading">
            <div className="title">Wargear Options</div>
          </div>
          <div className="content">
            {unit.wargear?.map((wargear, index) => {
              if (wargear.includes(" *")) {
                const lines = wargear.split(" *");
                explanations.push(...lines.slice(1));
                const starParts = wargear.split("◦");
                const starSubItems = starParts.slice(1);
                return (
                  <div className="item" key={`wargear-${index}`}>
                    <span className="description">
                      {starParts[0]}
                      {starSubItems.length > 0 && (
                        <ul style={{ listStyle: "none", padding: "0" }}>
                          {starSubItems.map((line) => (
                            <li key={line}>{line?.trim()}</li>
                          ))}
                        </ul>
                      )}
                    </span>
                  </div>
                );
              }
              const parts = wargear.split("◦");
              const subItems = parts.slice(1);
              return (
                <div className="item" key={`wargear-${index}`}>
                  <span className="description">
                    {parts[0]}
                    {subItems.length > 0 && (
                      <ul style={{ columns: subItems.length > 4 ? "2" : "1" }}>
                        {subItems.map((line) => (
                          <li key={line}>{line?.trim()}</li>
                        ))}
                      </ul>
                    )}
                  </span>
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
      )}
    </div>
  );
};
