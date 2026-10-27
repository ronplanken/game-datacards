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
  additionalCost,
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

  // 11th edition points carry no `active` flag. The roster surcharge renders as
  // its own chip next to the tiers, so a single tier plus a surcharge is just as
  // wide a points row as two tiers.
  const hasMultiplePoints = showAllPoints && points?.length > 0 && (points.length > 1 || additionalCost?.cost != null);

  const headerRef = useRef(null);
  const legendsRef = useRef(null);
  const [legendsLayout, setLegendsLayout] = useState(null);

  useLayoutEffect(() => {
    if (!legends || !hasMultiplePoints) {
      setLegendsLayout(null);
      return undefined;
    }
    const header = headerRef.current;
    const label = legendsRef.current;
    const pointsContainer = header?.querySelector(".points_container");
    const nameContainer = header?.querySelector(".name_container");
    if (!header || !label || !pointsContainer) {
      return undefined;
    }
    const GAP = 16;
    const measure = () => {
      const headerRect = header.getBoundingClientRect();
      // Rects are in screen pixels, but the card is often scaled with a CSS
      // transform while the offsets below are applied in the card's own pixels.
      const scale = header.offsetWidth && headerRect.width ? headerRect.width / header.offsetWidth : 1;
      const pointsRect = pointsContainer.getBoundingClientRect();
      const right = Math.round((headerRect.right - pointsRect.left) / scale + GAP);
      const nameRight = nameContainer
        ? Math.max(0, ...[...nameContainer.children].map((el) => el.getBoundingClientRect().right - headerRect.left))
        : 0;
      const labelLeft = header.offsetWidth - right - label.offsetWidth;
      if (right > 0 && labelLeft >= nameRight / scale + GAP) {
        // Clear the leftmost points block on the same line.
        setLegendsLayout({ right });
        return;
      }
      // No room between the name and the points (a long name or a points row
      // that wraps): place the label below the points, under the last chip.
      const chipsRight = Math.max(
        pointsRect.left,
        ...[...pointsContainer.children].map((el) => el.getBoundingClientRect().right),
      );
      const parentRect = (label.offsetParent || header).getBoundingClientRect();
      setLegendsLayout({
        right: Math.round((headerRect.right - chipsRight) / scale),
        top: Math.round((pointsRect.bottom - parentRect.top) / scale),
      });
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    observer.observe(pointsContainer);
    observer.observe(label);
    if (nameContainer) {
      observer.observe(nameContainer);
    }
    return () => observer.disconnect();
  }, [legends, hasMultiplePoints, points, additionalCost, showAllPoints, showPointsModels, name, subname]);

  const legendsStyle = legendsLayout
    ? {
        "--legends-multi-offset": `${legendsLayout.right}px`,
        ...(legendsLayout.top != null ? { "--legends-multi-top": `${legendsLayout.top}px` } : {}),
      }
    : undefined;

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
      {legends && (
        <div ref={legendsRef} className={`legends${hasMultiplePoints ? " legends--multi" : ""}`} style={legendsStyle} />
      )}
      {combatPatrol && <div className="combatpatrol" />}
      <UnitPoints
        points={points}
        additionalCost={additionalCost}
        showAllPoints={showAllPoints}
        showPointsModels={showPointsModels}
      />
    </HeaderContainer>
  );
};
