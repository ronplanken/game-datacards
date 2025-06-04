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
                return (
                  <div className="item" key={`wargear-${index}`}>
                    <span className="description">
                      {wargear.split("◦")[0]}
                      <ul style={{ listStyle: "none", padding: "0" }}>
                        {wargear
                          .split("◦")
                          .filter((item, index) => index !== 0)
                          .map((line) => (
                            <li key={line}>{line?.trim()}</li>
                          ))}
                      </ul>
                    </span>
                  </div>
                );
              }
              return (
                <div className="item" key={`wargear-${index}`}>
                  <span className="description">
                    {wargear.split("◦")[0]}
                    <ul style={{ columns: wargear?.split("◦")?.length > 4 ? "2" : "1" }}>
                      {wargear
                        .split("◦")
                        .filter((item, index) => index !== 0)
                        .map((line) => (
                          <li key={line}>{line?.trim()}</li>
                        ))}
                    </ul>
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
