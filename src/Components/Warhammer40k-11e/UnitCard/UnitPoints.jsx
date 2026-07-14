import { Button, Popover } from "antd";
import { localize } from "../../../Helpers/localization.helpers";

// 11th edition points have no `active`/`primary` flags; treat the first entry as
// primary and list the rest in a popover. Tier `keyword` is language-keyed in the
// 11e data, so it is localised for display. `additionalCost` is the per-datasheet
// roster surcharge ({ cost, afterSelections }) shown alongside the tiers.
export const UnitPoints = ({ points, additionalCost, showAllPoints, showPointsModels }) => {
  const allPoints = points || [];

  if (allPoints.length === 0) {
    return null;
  }

  const primaryPoint = allPoints[0];
  const surcharge = additionalCost?.cost != null ? additionalCost : null;

  const formatPointDisplay = (point) => {
    const keyword = localize(point.keyword);
    if (showPointsModels) {
      return `${point.models}${keyword ? ` (${keyword})` : ""}: ${point.cost} pts`;
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
        {surcharge && <div className="points points--additional">{`+${surcharge.cost} pts/extra`}</div>}
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
                const keyword = localize(point.keyword);
                return (
                  <tr className="points" key={`points-${index}`}>
                    <td>{`${point.models}${keyword ? ` (${keyword})` : ""}`}</td>
                    <td>{`${point.cost} pts`}</td>
                  </tr>
                );
              })}
              {surcharge && (
                <tr className="points points--additional">
                  <td>{`Each copy beyond ${surcharge.afterSelections}`}</td>
                  <td>{`+${surcharge.cost} pts`}</td>
                </tr>
              )}
            </tbody>
          </table>
        }>
        <div className="points">{formatPointDisplay(primaryPoint)}</div>
      </Popover>
    </Button>
  );
};
