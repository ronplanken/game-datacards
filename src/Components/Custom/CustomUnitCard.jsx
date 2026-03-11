import styled from "styled-components";
import { CustomCardAbilities } from "./CustomCardAbilities";
import { CustomCardStats } from "./CustomCardStats";
import { CustomCardWeapons } from "./CustomCardWeapons";

const HeaderContainer = styled.div`
  &:before {
    content: " ";
    position: absolute;
    right: ${(props) => (props.imagepositionx ? `calc(0px - ${props.imagepositionx}px)` : "0")};
    top: ${(props) => (props.imagepositiony ? `calc(0px + ${props.imagepositiony}px)` : "0")};
    width: 380px;
    height: 196px;
    background-color: black;
    background: top right no-repeat;
    background-size: contain;
    background-image: url(${(props) => props.imageurl});
    z-index: ${(props) => (props.imagezindex === "onTop" ? 100 : "auto")};
  }
`;

/**
 * Renders the unit name header with optional image, points, and subname.
 */
const CustomUnitName = ({ name, subname, points, externalImage, imageZIndex, imagePositionX, imagePositionY }) => {
  const imageUrl = externalImage;

  const activePoints = points?.filter((p) => p.active) || [];
  const primaryPoint = activePoints.find((p) => p.primary) || activePoints[0];

  return (
    <HeaderContainer
      className="header_container"
      imageurl={imageUrl}
      imagezindex={imageZIndex}
      imagepositionx={imagePositionX}
      imagepositiony={imagePositionY}>
      <div className="name_container">
        <div className="name">{name}</div>
        {subname && <div className="subname">{subname}</div>}
      </div>
      {primaryPoint && <div className="points_container">{primaryPoint.cost} pts</div>}
    </HeaderContainer>
  );
};

/**
 * CustomUnitCard - A schema-driven unit card that mirrors the 40K layout
 * but reads stat headers, weapon columns, and ability categories from the schema definition.
 *
 * @param {Object} props
 * @param {Object} props.unit - The card data
 * @param {Object} props.cardTypeDef - The card type definition from the schema
 * @param {Object} props.cardStyle - CSS variable overrides (--header-colour, --banner-colour)
 */
export const CustomUnitCard = ({ unit, cardTypeDef, cardStyle }) => {
  const schema = cardTypeDef?.schema || {};
  const statFields = schema.stats?.fields || [];

  return (
    <div className="custom-card custom-unit-card" style={cardStyle} data-testid="custom-unit-card">
      <div className="unit front" data-name={unit.name}>
        <div className="header">
          <CustomUnitName
            name={unit.name || "Untitled Unit"}
            subname={unit.subname}
            points={unit.points}
            externalImage={unit.externalImage}
            imageZIndex={unit.imageZIndex}
            imagePositionX={unit.imagePositionX}
            imagePositionY={unit.imagePositionY}
          />
          <CustomCardStats stats={unit.stats} statFields={statFields} />
        </div>
        <div className="data_container">
          <div className="data">
            <div className="weapons">
              <CustomCardWeapons unit={unit} weaponTypes={schema.weaponTypes} />
            </div>
            <div className="extra">
              <CustomCardAbilities unit={unit} abilitiesSchema={schema.abilities} />
            </div>
          </div>
        </div>
        <div className="footer">
          {schema.metadata?.hasKeywords && unit.keywords?.length > 0 && (
            <div className="keywords">
              <span className="title">keywords</span>
              <span className="value">{unit.keywords.join(", ")}</span>
            </div>
          )}
          {schema.metadata?.hasFactionKeywords && unit.factions?.length > 0 && (
            <div className="factions">
              <span className="title">faction keywords</span>
              <span className="value">{unit.factions.join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
