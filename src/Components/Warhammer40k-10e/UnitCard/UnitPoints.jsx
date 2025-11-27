import { Button, Popover } from "antd";

export const UnitPoints = ({ points, showAllPoints, showPointsModels }) => {
  const activePoints = points?.filter((p) => p.active) || [];

  if (activePoints.length === 0) {
    return null;
  }

  // Get the primary point, or fall back to the first active point
  const primaryPoint = activePoints.find((p) => p.primary) || activePoints[0];

  // Format a single point display
  const formatPointDisplay = (point) => {
    if (showPointsModels) {
      return `${point.models}${point.keyword ? ` (${point.keyword})` : ""}: ${point.cost} pts`;
    }
    return `${point.cost} pts`;
  };

  // If showing all points, display them all without popover
  if (showAllPoints) {
    return (
      <div
        className="points_container points_container--all"
        style={{ display: "flex", flexDirection: "row", gap: "8px", flexWrap: "wrap" }}>
        {activePoints.map((point, index) => (
          <div className="points" key={`points-${index}`}>
            {formatPointDisplay(point)}
          </div>
        ))}
      </div>
    );
  }

  // Default: show primary point with popover for all points
  return (
    <Button className="points_container" size="small" type="text">
      <Popover
        placement="bottomRight"
        arrow="hide"
        overlayClassName="points_table-container"
        content={
          <>
            <table className="point-tabel">
              <thead>
                <tr>
                  <th>Models</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {activePoints.map((point, index) => {
                  return (
                    <tr className="points" key={`points-${index}-${point.model}`}>
                      <td>{`${point.models}${point.keyword ? ` (${point.keyword})` : ""}`}</td>
                      <td>{`${point.cost} pts`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        }>
        <div className="points">{formatPointDisplay(primaryPoint)}</div>
      </Popover>
    </Button>
  );
};
