import { Button, Popover } from "antd";

// 11th edition points have no `active`/`primary` flags; treat the first entry as
// primary and list the rest in a popover.
export const UnitPoints = ({ points, showAllPoints, showPointsModels }) => {
  const allPoints = points || [];

  if (allPoints.length === 0) {
    return null;
  }

  const primaryPoint = allPoints[0];

  const formatPointDisplay = (point) => {
    if (showPointsModels) {
      return `${point.models}${point.keyword ? ` (${point.keyword})` : ""}: ${point.cost} pts`;
    }
    return `${point.cost} pts`;
  };

  if (showAllPoints) {
    return (
      <div
        className="points_container points_container--all"
        style={{ display: "flex", flexDirection: "row", gap: "8px", flexWrap: "wrap" }}>
        {allPoints.map((point, index) => (
          <div className="points" key={`points-${index}`}>
            {formatPointDisplay(point)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Button className="points_container" size="small" type="text">
      <Popover
        placement="bottomRight"
        arrow="hide"
        overlayClassName="points_table-container"
        content={
          <table className="point-tabel">
            <thead>
              <tr>
                <th>Models</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {allPoints.map((point, index) => {
                return (
                  <tr className="points" key={`points-${index}`}>
                    <td>{`${point.models}${point.keyword ? ` (${point.keyword})` : ""}`}</td>
                    <td>{`${point.cost} pts`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        }>
        <div className="points">{formatPointDisplay(primaryPoint)}</div>
      </Popover>
    </Button>
  );
};
