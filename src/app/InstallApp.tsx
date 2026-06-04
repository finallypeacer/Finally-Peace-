"use client";

import { useEffect, useState } from "react";

// Minimal typing for the non-standard beforeinstallprompt event.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  // iPadOS 13+ reports as Mac; detect touch + Mac.
  if (/Macintosh/i.test(ua) && "ontouchend" in document) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

export default function InstallApp() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());

    // Already running as an installed app?
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS Safari
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) setInstalled(true);

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleInstall() {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferred(null);
    } else {
      // No programmatic prompt (iOS Safari, or already-eligible browsers that
      // didn't fire the event) — show manual instructions.
      setShowSteps((s) => !s);
    }
  }

  const steps: Record<Platform, { label: string; items: string[] }> = {
    ios: {
      label: "On iPhone / iPad (Safari)",
      items: [
        "Tap the Share button (the square with an arrow) at the bottom of Safari.",
        "Scroll down and tap “Add to Home Screen”.",
        "Tap “Add” — the Finally Peace icon appears on your home screen.",
      ],
    },
    android: {
      label: "On Android (Chrome)",
      items: [
        "Tap the ⋮ menu in the top-right of Chrome.",
        "Tap “Install app” (or “Add to Home screen”).",
        "Confirm — Finally Peace is added to your home screen.",
      ],
    },
    desktop: {
      label: "On desktop (Chrome / Edge)",
      items: [
        "Click the install icon in the address bar (a monitor with a down-arrow).",
        "Or open the ⋮ menu → “Install Finally Peace…”.",
        "Click “Install” — it opens in its own app window.",
      ],
    },
  };

  if (installed) {
    return (
      <div className="install-installed">
        ✓ Finally Peace is installed on this device.
      </div>
    );
  }

  const active = steps[platform];

  return (
    <div className="install-app">
      <button type="button" className="install-btn" onClick={handleInstall}>
        {deferred ? "Install the app" : "How to install →"}
      </button>

      {(showSteps || !deferred) && (
        <div className="install-steps">
          <div className="install-steps-title">{active.label}</div>
          <ol>
            {active.items.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <div className="install-steps-note">
            Works on any modern phone or computer — no app store needed.
          </div>
        </div>
      )}
    </div>
  );
}
