import { useLayoutEffect, useRef, useState } from "react";
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

  const hasMultipleActivePoints = showAllPoints && points?.filter((p) => p.active)?.length > 1;

  const headerRef = useRef(null);
  // Distance (in px) the Legends label must sit from the header's right edge so it
  // clears the leftmost points block. Measured from the actual points layout because
  // the points container grows leftward as more values (or model keywords) are shown.
  const [legendsOffset, setLegendsOffset] = useState(null);

  useLayoutEffect(() => {
    if (!legends || !hasMultipleActivePoints) {
      setLegendsOffset(null);
      return undefined;
    }
    const header = headerRef.current;
    const pointsContainer = header?.querySelector(".points_container");
    if (!header || !pointsContainer) {
      return undefined;
    }
    const GAP = 16;
    const measure = () => {
      const headerRect = header.getBoundingClientRect();
      const pointsRect = pointsContainer.getBoundingClientRect();
      const offset = Math.round(headerRect.right - pointsRect.left + GAP);
      setLegendsOffset(offset > 0 ? offset : null);
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    observer.observe(pointsContainer);
    return () => observer.disconnect();
  }, [legends, hasMultipleActivePoints, points, showAllPoints, showPointsModels]);

  const legendsStyle = legendsOffset != null ? { "--legends-multi-offset": `${legendsOffset}px` } : undefined;

  return (
    <HeaderContainer
      ref={headerRef}
      className="header_container"
      imageurl={imageUrl}
      imagezindex={imageZIndex}
      imagepositionx={imagePositionX}
      imagepositiony={imagePositionY}>
      <div className="name_container">
        <div className="name">{name}</div>
        {subname && <div className="subname">{subname}</div>}
      </div>
      {legends && <div className={`legends${hasMultipleActivePoints ? " legends--multi" : ""}`} style={legendsStyle} />}
      {combatPatrol && <div className="combatpatrol" />}
      <UnitPoints points={points} showAllPoints={showAllPoints} showPointsModels={showPointsModels} />
    </HeaderContainer>
  );
};
