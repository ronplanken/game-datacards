import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { usePWAInstall } from "../../../Hooks/usePWAInstall";
import "./PWAInstallPrompt.css";

export const PWAInstallPrompt = () => {
  const { canInstall, promptInstall } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show the prompt if installable
    if (canInstall) {
      // Add a small delay to avoid showing immediately on page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [canInstall]);

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent;

    if (/Android.*Chrome/.test(userAgent)) {
      return {
        browser: "Chrome",
        steps: [
          "Tap the menu (⋮) in the top right corner",
          "Select 'Add to Home screen' or 'Install app'",
          "Tap 'Add' to confirm",
        ],
      };
    } else if (/Android.*Firefox/.test(userAgent)) {
      return {
        browser: "Firefox",
        steps: ["Tap the menu (⋮) in the top right corner", "Select 'Install'", "Tap 'Add' to confirm"],
      };
    } else if (/iPhone|iPad/.test(userAgent)) {
      return {
        browser: "Safari",
        steps: [
          "Tap the Share button (□↗) at the bottom",
          "Scroll down and tap 'Add to Home Screen'",
          "Tap 'Add' to confirm",
        ],
      };
    }

    return {
      browser: "your browser",
      steps: [
        "Look for 'Add to Home screen' in your browser menu",
        "Or use the Share button for installation options",
        "Follow any prompts that appear",
      ],
    };
  };

  // Don't render if dismissed or not visible
  if (isDismissed || !isVisible) {
    return null;
  }

  // Don't render if not installable and not showing fallback
  if (!canInstall && !showFallback) {
    return null;
  }

  const instructions = getBrowserInstructions();

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-install-prompt-content">
        <div className="pwa-install-prompt-header">
          <div className="pwa-install-prompt-icon">
            <Smartphone size={20} />
          </div>
          <div className="pwa-install-prompt-text">
            <h3>{showFallback ? "Install App Manually" : "Add to Home Screen"}</h3>
            <p>
              {showFallback ? `Install via ${instructions.browser} menu` : "Install for quick access to your datacards"}
            </p>
          </div>
          <button className="pwa-install-prompt-close" onClick={handleDismiss} type="button">
            <X size={18} />
          </button>
        </div>

        {showFallback && (
          <div className="pwa-install-prompt-instructions">
            <p className="pwa-install-prompt-instructions-title">To install in {instructions.browser}:</p>
            <ol>
              {instructions.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="pwa-install-prompt-actions">
          {canInstall ? (
            <button className="pwa-install-prompt-btn primary" onClick={handleInstall} type="button">
              <Download size={16} />
              Install App
            </button>
          ) : (
            <button
              className="pwa-install-prompt-btn primary"
              onClick={() => setShowFallback(!showFallback)}
              type="button">
              <Download size={16} />
              {showFallback ? "Hide Instructions" : "How to Install"}
            </button>
          )}
          <button className="pwa-install-prompt-btn secondary" onClick={handleDismiss} type="button">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};
