import { useEffect } from "react";

export default function useViewportHeight() {
  useEffect(() => {
    const setVh = () => {
      // prefer visualViewport where available (more accurate during zoom/toolbar changes)
      const h = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
      document.documentElement.style.setProperty("--vh", `${h * 0.01}px`);
    };

    setVh();

    // events to listen to
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);

    // visualViewport provides onresize for smoother tracking
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setVh);
    }

    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", setVh);
      }
    };
  }, []);
}
