import { useState, useEffect, useRef, useLayoutEffect } from "react";

/**
 * Hook for scroll-reveal header behavior.
 * Shows a floating back button initially, then reveals full header
 * when the target element (unit name) scrolls out of view.
 *
 * @param {Object} options
 * @param {boolean} options.enabled - Whether the feature is enabled
 * @param {string} options.targetSelector - CSS selector for the element to observe (e.g., ".warscroll-unit-name")
 * @param {number} options.topOffset - Offset from top to account for fixed headers (default: 64)
 * @returns {{ showHeader: boolean, headerReady: boolean, scrollContainerRef: React.RefObject }}
 */
export function useScrollRevealHeader({ enabled = false, targetSelector, topOffset = 64 } = {}) {
  const [showHeader, setShowHeader] = useState(false);
  const [headerReady, setHeaderReady] = useState(false);
  const scrollContainerRef = useRef(null);
  const observerRef = useRef(null);

  // Use useLayoutEffect for synchronous DOM measurement before paint
  useLayoutEffect(() => {
    if (!enabled) {
      setShowHeader(false);
      setHeaderReady(false);
      return;
    }

    // Use requestAnimationFrame to ensure DOM is painted
    const rafId = requestAnimationFrame(() => {
      const targetEl = document.querySelector(targetSelector);
      const scrollContainer = scrollContainerRef.current;

      if (!targetEl || !scrollContainer) {
        // Still mark as ready so floating button shows
        setHeaderReady(true);
        return;
      }

      // Calculate initial state synchronously
      const targetRect = targetEl.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      const isTargetVisible = targetRect.bottom > containerRect.top + topOffset;

      // Set the correct initial state
      setShowHeader(!isTargetVisible);
      setHeaderReady(true);

      // Set up observer for subsequent scroll events
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          setShowHeader(!entry.isIntersecting);
        },
        {
          root: scrollContainer,
          threshold: 0,
          rootMargin: `-${topOffset}px 0px 0px 0px`,
        },
      );

      observerRef.current.observe(targetEl);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, targetSelector, topOffset]);

  // Reset when disabled
  useEffect(() => {
    if (!enabled) {
      setShowHeader(false);
      setHeaderReady(false);
    }
  }, [enabled]);

  return {
    showHeader,
    headerReady,
    scrollContainerRef,
  };
}
