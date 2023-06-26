import OutsideClickHandler from "react-outside-click-handler";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useMobileList } from "../useMobileList";

export const ListAdd = ({ setShowList }) => {
  const { addDatacard } = useMobileList();
  const { activeCard } = useCardStorage();

  return (
    <OutsideClickHandler
      onOutsideClick={() => {
        setShowList(false);
      }}>
      <div style={{ position: "absolute", bottom: "45px", left: "0px" }} className="points_table-container">
        <table className="point-tabel">
          <thead>
            <tr>
              <th>Models</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {activeCard?.points
              ?.filter((p) => p.active)
              .map((point, index) => {
                return (
                  <tr
                    className="points"
                    key={`points-${index}-${point.model}`}
                    onClick={() => {
                      addDatacard(activeCard, point);
                      setShowList(false);
                    }}
                    style={{ cursor: "pointer" }}>
                    <td>{`${point.models}`}</td>
                    <td>{`${point.cost} pts`}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </OutsideClickHandler>
  );
};
