import React, { useState, useEffect, useCallback, useRef, useContext } from "react";
import { compare, validate } from "compare-versions";

const INITIAL_DELAY = 30_000;
const POLL_INTERVAL = 5 * 60_000;
const VISIBILITY_COOLDOWN = 60_000;
const BANNER_DISMISSED_KEY = "update-banner-dismissed-version";

// Classify a deployed version relative to the running one. The banner and the
// bell react to different kinds of release:
//   "minor" — a major/minor bump (a feature release, cut manually with a What's
//             New entry). These are loud: the UpdateNotification banner.
//   "patch" — same major.minor, higher patch (a fix shipped by the release
//             pipeline). These are quiet: a temporary line in the notification
//             bell. See docs/release-notifications.md.
//   "none"  — same version, an older version, or anything unparseable.
export const classifyUpdate = (latest, current) => {
  if (!validate(latest) || !validate(current)) return "none";
  if (compare(latest, current, "<=")) return "none";
  const [latestMajor, latestMinor] = latest.split(".").map(Number);
  const [currentMajor, currentMinor] = current.split(".").map(Number);
  return latestMajor > currentMajor || latestMinor > currentMinor ? "minor" : "patch";
};

const defaultValue = {
  updateKind: "none",
  latestVersion: null,
  showBanner: false,
  reload: () => {},
  dismissBanner: () => {},
};

const UpdateCheckContext = React.createContext(defaultValue);

// One poller for the whole app. Both the reload banner (minor releases) and the
// notification bell (patch releases) read the same detected state, so this lives
// in a provider rather than a per-component hook to avoid double-polling and
// divergent dismiss state.
export const UpdateCheckProvider = ({ children }) => {
  const [updateKind, setUpdateKind] = useState("none");
  const [latestVersion, setLatestVersion] = useState(null);
  const [bannerDismissedVersion, setBannerDismissedVersion] = useState(() => {
    try {
      return sessionStorage.getItem(BANNER_DISMISSED_KEY);
    } catch {
      return null;
    }
  });
  const lastCheckRef = useRef(0);

  const currentVersion = import.meta.env.VITE_VERSION;

  const checkForUpdate = useCallback(async () => {
    try {
      const res = await fetch(`/version.json?_t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.version) {
        setUpdateKind(classifyUpdate(data.version, currentVersion));
        setLatestVersion(data.version);
      }
    } catch {
      // Silently ignore — next interval will retry
    }
    lastCheckRef.current = Date.now();
  }, [currentVersion]);

  const reload = useCallback(() => {
    window.location.reload();
  }, []);

  const dismissBanner = useCallback(() => {
    if (!latestVersion) return;
    setBannerDismissedVersion(latestVersion);
    try {
      sessionStorage.setItem(BANNER_DISMISSED_KEY, latestVersion);
    } catch {
      // sessionStorage unavailable — banner reappears on next check, harmless
    }
  }, [latestVersion]);

  useEffect(() => {
    if (import.meta.env.DEV) return;

    const cleanupRef = { current: null };

    const delayTimer = setTimeout(() => {
      checkForUpdate();
      const interval = setInterval(checkForUpdate, POLL_INTERVAL);
      cleanupRef.current = () => clearInterval(interval);
    }, INITIAL_DELAY);

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

  // The banner is only for feature releases, and only until dismissed for that
  // specific version (so a dismiss does not hide a later release).
  const showBanner = updateKind === "minor" && !!latestVersion && bannerDismissedVersion !== latestVersion;

  const value = { updateKind, latestVersion, showBanner, reload, dismissBanner };

  return <UpdateCheckContext.Provider value={value}>{children}</UpdateCheckContext.Provider>;
};

export const useUpdateCheck = () => useContext(UpdateCheckContext);
