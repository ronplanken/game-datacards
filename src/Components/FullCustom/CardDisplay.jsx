import { Col } from "antd";
import { COLOURS } from "../../Helpers/printcolours.js";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { UnitCard } from "./UnitCard";

export const FullCustomCardDisplay = ({
  type,
  card,
  cardScaling,
  printPadding,
  side = "front",
  backgrounds = "standard",
}) => {
  const { activeCard } = useCardStorage();

  // if no background selected, use standard
  // this does assume standard will always exist but the alternative is duplicating the data?
  if (!(backgrounds in COLOURS)) {
    backgrounds = "standard";
  }

  return (
    <>
      <Col span={24}>
        <div className="data-full-custom" style={{}}>
          <UnitCard unit={activeCard} side={side} />
        </div>
      </Col>
    </>
  );
};
