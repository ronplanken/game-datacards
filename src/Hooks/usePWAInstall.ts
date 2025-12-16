import { useState, useEffect } from "react";

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      // Check if running in standalone mode (installed PWA)
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
        return true;
      }

      // Check if running in fullscreen mode (some PWAs)
      if (window.matchMedia("(display-mode: fullscreen)").matches) {
        setIsInstalled(true);
        return true;
      }

      // Check for iOS Safari standalone
      if (window.navigator.standalone === true) {
        setIsInstalled(true);
        return true;
      }

      return false;
    };

    checkInstalled();

    // Track visits for Android Chrome (requires 2 visits)
    const isAndroidChrome = /Android.*Chrome/.test(navigator.userAgent);
    if (isAndroidChrome) {
      const visitCount = parseInt(localStorage.getItem("pwa-visit-count") || "0") + 1;
      localStorage.setItem("pwa-visit-count", visitCount.toString());
    }

    const beforeInstallPromptHandler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const appInstalledHandler = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler);
    window.addEventListener("appinstalled", appInstalledHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallPromptHandler);
      window.removeEventListener("appinstalled", appInstalledHandler);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
      return true;
    }

    return false;
  };

  return {
    isInstallable,
    isInstalled,
    promptInstall,
    canInstall: isInstallable && !isInstalled,
  };
}
