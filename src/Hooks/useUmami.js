import { useCallback, useRef } from "react";

/**
 * Lightweight wrapper around the Umami analytics client.
 * All calls silently no-op when `window.umami` is undefined (e.g. ad blocker).
 */
export function useUmami() {
  const timersRef = useRef({});

  const trackEvent = useCallback((name, data, options) => {
    if (!window.umami) return;

    if (options?.debounceMs) {
      clearTimeout(timersRef.current[name]);
      timersRef.current[name] = setTimeout(() => {
        window.umami.track(name, data);
      }, options.debounceMs);
      return;
    }

    window.umami.track(name, data);
  }, []);

  const identify = useCallback((data) => {
    if (!window.umami) return;
    window.umami.identify(data);
  }, []);

  return { trackEvent, identify };
}
