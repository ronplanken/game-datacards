import styled from "styled-components";
import { UnitPoints } from "./UnitPoints";

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

export const UnitName = ({
  name,
  subname,
  points,
  legends,
  combatPatrol,
  externalImage,
  localImageUrl,
  imageZIndex,
  imagePositionX,
  imagePositionY,
  showAllPoints,
  showPointsModels,
}) => {
  const imageUrl = localImageUrl || externalImage;

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
      {legends && <div className="legends" />}
      {combatPatrol && <div className="combatpatrol" />}
      <UnitPoints points={points} showAllPoints={showAllPoints} showPointsModels={showPointsModels} />
    </HeaderContainer>
  );
};
