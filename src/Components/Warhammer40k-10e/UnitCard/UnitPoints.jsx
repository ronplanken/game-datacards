import { Button, Popover } from "antd";

export const UnitPoints = ({ points }) => {
  if (points?.length > 0) {
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
                  {points.map((point, index) => {
                    return (
                      <tr className="points" key={`points-${index}-${point.model}`}>
                        <td>{`${point.models}`}</td>
                        <td>{`${point.cost} pts`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          }>
          <div className="points">{` ${points[0].cost} pts`}</div>
        </Popover>
      </Button>
    );
  }
};
