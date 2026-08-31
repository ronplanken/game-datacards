import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useIndexedDBImages } from "../../Hooks/useIndexedDBImages";

const SymbolImage = styled.div`
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

/**
 * Object URL for a card's uploaded faction symbol, or null when the card has no
 * custom symbol (or it has not been stored yet). Shared by every renderset so a
 * symbol uploaded in the styling editor shows up on all editions.
 */
export const useCustomFactionSymbolUrl = (card) => {
  const { getFactionSymbolUrl, isReady } = useIndexedDBImages();
  const [symbolUrl, setSymbolUrl] = useState(null);

  const uuid = card?.uuid;
  const enabled = card?.hasCustomFactionSymbol;

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    const loadCustomSymbol = async () => {
      if (!enabled || !uuid || !isReady) {
        setSymbolUrl(null);
        return;
      }
      try {
        const url = await getFactionSymbolUrl(uuid);
        if (!url) return;
        // The effect can be torn down while the lookup is in flight; revoke the
        // url straight away in that case instead of leaking it.
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setSymbolUrl(url);
      } catch (error) {
        // Failed to load custom faction symbol
      }
    };

    loadCustomSymbol();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
    // getFactionSymbolUrl is recreated on every render of the hook; depending on
    // it would re-run this effect forever.
  }, [uuid, enabled, isReady]);

  return symbolUrl;
};

/** The uploaded (or externally linked) faction symbol, scaled and positioned. */
export const CustomFactionSymbol = ({ card, imageUrl }) => (
  <SymbolImage
    $imageUrl={imageUrl}
    $scale={card?.factionSymbolScale}
    $positionX={card?.factionSymbolPositionX}
    $positionY={card?.factionSymbolPositionY}
  />
);
