import { useState, useEffect, useCallback, useRef } from "react";

const INITIAL_DELAY = 30_000;
const POLL_INTERVAL = 5 * 60_000;
const VISIBILITY_COOLDOWN = 60_000;
const DISMISSED_KEY = "update-dismissed-build";

export function useUpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState(null);
  const latestBuildIdRef = useRef(null);
  const lastCheckRef = useRef(0);

  const currentBuildId = import.meta.env.VITE_BUILD_ID;

  const checkForUpdate = useCallback(async () => {
    try {
      const res = await fetch(`/version.json?_t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.buildId && data.buildId !== currentBuildId) {
        latestBuildIdRef.current = data.buildId;
        const dismissed = sessionStorage.getItem(DISMISSED_KEY);
        if (dismissed !== data.buildId) {
          setLatestVersion(data.version);
          setUpdateAvailable(true);
        }
      }
    } catch {
      // Silently ignore — next interval will retry
    }
    lastCheckRef.current = Date.now();
  }, [currentBuildId]);

  const dismiss = useCallback(() => {
    setUpdateAvailable(false);
    if (latestBuildIdRef.current) {
      sessionStorage.setItem(DISMISSED_KEY, latestBuildIdRef.current);
    }
  }, []);

  const reload = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV) return;

    const delayTimer = setTimeout(() => {
      checkForUpdate();
      const interval = setInterval(checkForUpdate, POLL_INTERVAL);
      // Store interval ID for cleanup
      cleanupRef.current = () => clearInterval(interval);
    }, INITIAL_DELAY);

    const cleanupRef = { current: null };

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && Date.now() - lastCheckRef.current > VISIBILITY_COOLDOWN) {
        checkForUpdate();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(delayTimer);
      cleanupRef.current?.();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [checkForUpdate]);

  return { updateAvailable, latestVersion, dismiss, reload };
}
