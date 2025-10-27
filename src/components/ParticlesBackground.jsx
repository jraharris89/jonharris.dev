import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const ParticlesComponent = () => {
  const [init, setInit] = useState(false);
  const particlesRef = useRef(null);

  // Calculate random values once when component mounts
  const randomValues = useMemo(
    () => ({
      blurred: Math.random() * 2, // 0-2px for blurred layer
      links: Math.random() * 2, // 0-2px for links layer
      animationSpeed: Math.random() * 2 + 1, // Random between 1-3
      pushQuantity: Math.floor(Math.random() * 2) + 1, // Random between 1-3
    }),
    []
  );

  // Track scroll position and update transform directly
  useEffect(() => {
    const handleScroll = () => {
      if (particlesRef.current) {
        const scrollY = window.scrollY;
        const parallaxOffset = scrollY * 0.5; // Adjust multiplier for effect intensity
        particlesRef.current.style.transform = `translateY(${parallaxOffset}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (init) return;
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, [init]);

  const particleOptions = useMemo(
    () => ({
      particles: {
        number: {
          value: 12,
          density: {
            enable: true,
            area: 800,
          },
        },
        color: {
          value: ["#84963C", "#A8C256"], // Original green + brighter lime green
        },
        shape: {
          type: "circle",
          stroke: {
            width: 0,
            color: "#000000",
          },
        },
        opacity: {
          value: { min: 0.2, max: 0.9 },
          animation: {
            enable: true,
            speed: 0.5,
            sync: false,
          },
        },
        size: {
          value: { min: 1, max: 9 },
          animation: {
            enable: true,
            speed: randomValues.animationSpeed, // Use pre-calculated random value
            sync: false,
          },
        },
        links: {
          enable: true,
          distance: 150,
          color: "#84963C",
          opacity: 0.8,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.4,
          direction: "none",
          random: true,
          straight: false,
          outModes: {
            default: "out",
          },
          bounce: false,
        },
      },
      interactivity: {
        detectsOn: "window",
        events: {
          onHover: {
            enable: false,
            mode: "repulse",
          },
          onClick: {
            enable: true,
            mode: "push",
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          push: {
            quantity: randomValues.pushQuantity, // Use pre-calculated random value
          },
        },
      },
      detectRetina: true,
      background: {
        color: "transparent",
      },
    }),
    [randomValues]
  );

  const particlesLoaded = useCallback(async (container) => {
    console.log("Particles loaded:", container);
  }, []);

  if (!init) {
    return null;
  }

  return (
    <div
      ref={particlesRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        willChange: "transform",
      }}
    >
      <div
        style={{ filter: `blur(${randomValues.blurred}px)` }}
        className="absolute inset-0"
      >
        <Particles
          id="tsparticles-blurred"
          options={{
            ...particleOptions,
            particles: {
              ...particleOptions.particles,
              links: { enable: false }, // No links on blurred layer
            },
          }}
          className="w-full h-full"
        />
      </div>
      {/* Sharp links layer (with smaller visible particles) */}
      <div
        style={{ filter: `blur(${randomValues.links}px)` }}
        className="absolute inset-0"
      >
        <Particles
          id="tsparticles-links"
          options={{
            ...particleOptions,
            particles: {
              ...particleOptions.particles,
              number: { value: 9 }, // Fewer particles for links
              size: { value: { min: 1, max: 4 } }, // Smaller particles
              opacity: { value: { min: 0.3, max: 0.6 } }, // Visible but subtle
            },
          }}
          particlesLoaded={particlesLoaded}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

const ParticlesBackground = React.memo(ParticlesComponent);
export default ParticlesBackground;
