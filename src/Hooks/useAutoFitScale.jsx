import { useState, useEffect, useCallback, useRef } from "react";

const CARD_DIMENSIONS = {
  unit: { width: 1077, height: 714 },
  unitFull: { width: 1077, height: null },
  stratagem: { width: 266, height: 460 },
  enhancement: { width: 266, height: 460 },
  rule: { width: 460, height: 620 },
  warscroll: { width: 490, height: null },
  spell: { width: 650, height: null },
};

export function useAutoFitScale(containerRef, cardType = "unit", isEnabled = true) {
  const [autoScale, setAutoScale] = useState(1);
  const resizeObserverRef = useRef(null);

  const calculateScale = useCallback(
    (width) => {
      if (!width || !isEnabled) return 1;
      const cardWidth = CARD_DIMENSIONS[cardType]?.width || CARD_DIMENSIONS.unit.width;
      const availableWidth = width - 32; // padding buffer
      const calculatedScale = Math.min(1, availableWidth / cardWidth);
      return Math.max(0.25, calculatedScale);
    },
    [cardType, isEnabled]
  );

  useEffect(() => {
    if (!containerRef?.current || !isEnabled) {
      setAutoScale(1);
      return;
    }

    const element = containerRef.current;
    setAutoScale(calculateScale(element.clientWidth));

    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setAutoScale(calculateScale(entry.contentRect.width));
      }
    });

    resizeObserverRef.current.observe(element);
    return () => resizeObserverRef.current?.disconnect();
  }, [containerRef, isEnabled, calculateScale]);

  return { autoScale, cardDimensions: CARD_DIMENSIONS[cardType] };
}
