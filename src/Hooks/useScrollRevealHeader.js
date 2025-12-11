import { useState, useEffect, useRef } from "react";

/**
 * Hook for scroll-reveal header behavior.
 * Shows a floating back button initially, then reveals full header
 * when the target element (unit name) scrolls out of view.
 *
 * @param {Object} options
 * @param {boolean} options.enabled - Whether the feature is enabled
 * @param {string} options.targetSelector - CSS selector for the element to observe (e.g., ".warscroll-unit-name")
 * @param {number} options.topOffset - Offset from top to account for fixed headers (default: 64)
 * @param {number} options.readyDelay - Delay before showing UI to prevent flash (default: 150)
 * @returns {{ showHeader: boolean, headerReady: boolean, scrollContainerRef: React.RefObject }}
 */
export function useScrollRevealHeader({ enabled = false, targetSelector, topOffset = 64, readyDelay = 150 } = {}) {
  const [showHeader, setShowHeader] = useState(false);
  const [headerReady, setHeaderReady] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setShowHeader(false);
      setHeaderReady(false);
      return;
    }

    // Delay to ensure DOM is ready and prevent flash
    const timer = setTimeout(() => {
      const targetEl = document.querySelector(targetSelector);
      const scrollContainer = scrollContainerRef.current;

      if (!targetEl || !scrollContainer) {
        // Still mark as ready so floating button shows
        setHeaderReady(true);
        return;
      }

      // Check initial scroll position BEFORE setting up observer
      // This prevents the flash by determining state synchronously
      const isScrolled = scrollContainer.scrollTop > 50;
      const targetRect = targetEl.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      const isTargetVisible = targetRect.bottom > containerRect.top + topOffset;

      // Set initial state before marking ready
      if (!isScrolled && isTargetVisible) {
        setShowHeader(false);
      } else {
        setShowHeader(!isTargetVisible);
      }

      // Now mark as ready - state is already correct
      setHeaderReady(true);

      // Set up observer for subsequent scroll events
      const observer = new IntersectionObserver(
        ([entry]) => {
          setShowHeader(!entry.isIntersecting);
        },
        {
          root: scrollContainer,
          threshold: 0,
          rootMargin: `-${topOffset}px 0px 0px 0px`,
        }
      );

      observer.observe(targetEl);

      return () => observer.disconnect();
    }, readyDelay);

    return () => clearTimeout(timer);
  }, [enabled, targetSelector, topOffset, readyDelay]);

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
