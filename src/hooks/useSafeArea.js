// useSafeArea.js
// Hook to detect Safari and handle safe area insets for iOS devices

import { useState, useEffect } from "react";

export const useSafeArea = () => {
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  const [isSafari, setIsSafari] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobileSafari, setIsMobileSafari] = useState(false);
  // REMOVED: viewportHeight state and setVH function.
  // This is now handled by the useViewportHeight hook.

  useEffect(() => {
    // Detect Safari
    const ua = navigator.userAgent.toLowerCase();
    const isSafariBrowser =
      /safari/.test(ua) && !/chrome/.test(ua) && !/android/.test(ua);
    const isIOSDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isMobileSafariBrowser = isIOSDevice && isSafariBrowser;

    setIsSafari(isSafariBrowser);
    setIsIOS(isIOSDevice);
    setIsMobileSafari(isMobileSafariBrowser);

    // --- Start: Improved computeSafeAreaInsets ---
    const computeSafeAreaInsets = () => {
      const root = document.documentElement;

      // Temporarily apply env() values to the root padding
      const originalPaddings = {
        top: root.style.paddingTop,
        bottom: root.style.paddingBottom,
        left: root.style.paddingLeft,
        right: root.style.paddingRight,
      };

      root.style.paddingTop = "env(safe-area-inset-top)";
      root.style.paddingBottom = "env(safe-area-inset-bottom)";
      root.style.paddingLeft = "env(safe-area-inset-left)";
      root.style.paddingRight = "env(safe-area-inset-right)";

      // Read the *computed* style, which converts env() to pixels
      const styles = getComputedStyle(root);

      const insets = {
        top: parseInt(styles.paddingTop, 10) || 0,
        bottom: parseInt(styles.paddingBottom, 10) || 0,
        left: parseInt(styles.paddingLeft, 10) || 0,
        right: parseInt(styles.paddingRight, 10) || 0,
      };

      // Restore original padding styles
      root.style.paddingTop = originalPaddings.top;
      root.style.paddingBottom = originalPaddings.bottom;
      root.style.paddingLeft = originalPaddings.left;
      root.style.paddingRight = originalPaddings.right;

      // Now set the state
      setSafeAreaInsets(insets);

      // Also set the CSS variables with the *pixel values* for CSS to use
      root.style.setProperty("--sat", `${insets.top}px`);
      root.style.setProperty("--sab", `${insets.bottom}px`);
      root.style.setProperty("--sal", `${insets.left}px`);
      root.style.setProperty("--sar", `${insets.right}px`);
    };
    // --- End: Improved computeSafeAreaInsets ---

    computeSafeAreaInsets();

    // Listen for resize and orientation changes
    window.addEventListener("resize", computeSafeAreaInsets);
    window.addEventListener("orientationchange", computeSafeAreaInsets);

    return () => {
      window.removeEventListener("resize", computeSafeAreaInsets);
      window.removeEventListener("orientationchange", computeSafeAreaInsets);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return {
    safeAreaInsets,
    isSafari,
    isIOS,
    isMobileSafari,
  };
};

export default useSafeArea;
