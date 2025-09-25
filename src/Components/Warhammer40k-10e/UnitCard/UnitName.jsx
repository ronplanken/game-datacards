import styled from "styled-components";
import { UnitPoints } from "./UnitPoints";

const HeaderContainer = styled.div`
  &:before {
    content: " ";
    position: absolute;
    right: 0;
    top: 0;
    width: 380px;
    height: 196px;
    background-color: black;
    background: top right no-repeat;
    background-size: contain;
    background-image: url(${(props) => props.externalimage});
    z-index: ${(props) => (props.imagezindex === "onTop" ? 100 : "auto")};
  }
`;

export const UnitName = ({ name, subname, points, legends, combatPatrol, externalImage, imageZIndex }) => {
  return (
    <HeaderContainer className="header_container" externalimage={externalImage} imagezindex={imageZIndex}>
      <div className="name_container">
        <div className="name">{name}</div>
        {subname && <div className="subname">{subname}</div>}
      </div>
      {legends && <div className="legends" />}
      {combatPatrol && <div className="combatpatrol" />}
      <UnitPoints points={points} />
    </HeaderContainer>
  );
};
