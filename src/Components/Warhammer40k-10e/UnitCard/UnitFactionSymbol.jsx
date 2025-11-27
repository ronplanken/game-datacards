import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useIndexedDBImages } from "../../../Hooks/useIndexedDBImages";

const FactionContainer = styled.div`
  height: 64px;
  width: 64px;
  border: 2px solid var(--header-colour);
  background-color: var(--rows-colour);
  position: absolute;
  bottom: 32px;
  left: 677px;
  rotate: 45deg;
  overflow: hidden;
`;

const CustomSymbol = styled.div`
  content: " ";
  display: block;
  width: 100%;
  height: 100%;
  background-image: url(${(props) => props.$imageUrl});
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  filter: invert(0%) sepia(2%) saturate(0%) hue-rotate(253deg) brightness(100%) contrast(100%);
  rotate: -45deg;
  scale: ${(props) => props.$scale || 0.8};
  transform: translate(${(props) => props.$positionX || 0}px, ${(props) => props.$positionY || 0}px);
`;

export const UnitFactionSymbol = ({ unit }) => {
  const { getFactionSymbolUrl, isReady } = useIndexedDBImages();
  const [customSymbolUrl, setCustomSymbolUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let objectUrl = null;

    const loadCustomSymbol = async () => {
      if (unit?.hasCustomFactionSymbol && unit?.uuid && isReady) {
        try {
          const url = await getFactionSymbolUrl(unit.uuid);
          if (isMounted && url) {
            objectUrl = url;
            setCustomSymbolUrl(objectUrl);
          }
        } catch (error) {
          console.error("[UnitFactionSymbol] Failed to load custom faction symbol:", error);
        }
      } else {
        if (isMounted) {
          setCustomSymbolUrl(null);
        }
      }
    };

    loadCustomSymbol();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [unit?.uuid, unit?.hasCustomFactionSymbol, isReady]);

  // Determine the symbol URL (local takes priority over external)
  const symbolUrl = customSymbolUrl || unit?.externalFactionSymbol;

  // If custom symbol is enabled and we have a URL (local or external), render custom
  if (unit?.hasCustomFactionSymbol && symbolUrl) {
    return (
      <FactionContainer>
        <CustomSymbol
          $imageUrl={symbolUrl}
          $scale={unit.factionSymbolScale}
          $positionX={unit.factionSymbolPositionX}
          $positionY={unit.factionSymbolPositionY}
        />
      </FactionContainer>
    );
  }

  // Otherwise render default faction symbol via CSS class
  return (
    <div className="faction">
      <div className={unit.faction_id}></div>
    </div>
  );
};
