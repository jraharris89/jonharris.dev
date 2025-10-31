import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ScatterOrganizeAnimationGSAP = () => {
  const sectionRef = useRef(null);
  const particlesContainerRef = useRef(null);
  const arrowRef = useRef(null);
  const clearInsightsTextRef = useRef(null);
  const clearInsightsTextH2Ref = useRef(null);
  const bgGlowRef = useRef(null);

  const generateTextParticles = (text, targetY, particleSpacing = 5) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const fontSize = 80;

    ctx.font = `900 ${fontSize}px Arial`;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;

    canvas.width = textWidth;
    canvas.height = fontSize * 1.5;

    ctx.font = `900 ${fontSize}px Arial`;
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";
    ctx.fillText(text, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const particles = [];

    for (let y = 0; y < canvas.height; y += particleSpacing) {
      for (let x = 0; x < canvas.width; x += particleSpacing) {
        const index = (y * canvas.width + x) * 4;
        const alpha = imageData.data[index + 3];

        if (alpha > 128) {
          particles.push({
            targetX: x - textWidth / 2,
            targetY: y + targetY,
          });
        }
      }
    }
    return particles;
  };

  const particleData = useRef(null);

  if (!particleData.current) {
    const rawDataParticles = generateTextParticles("RAW DATA", 0);
    const clearInsightsParticles = generateTextParticles("CLEAR INSIGHTS", 200);

    const maxParticles = Math.max(
      rawDataParticles.length,
      clearInsightsParticles.length
    );

    particleData.current = Array.from({ length: maxParticles }, (_, i) => {
      const startPos = rawDataParticles[i % rawDataParticles.length];
      const endPos = clearInsightsParticles[i % clearInsightsParticles.length];

      return {
        id: i,
        randomX: Math.random() * 2000 - 1000,
        randomY: Math.random() * 1000 - 500,
        rawX: startPos.targetX,
        rawY: startPos.targetY,
        clearX: endPos.targetX,
        clearY: endPos.targetY,
        char: Math.random() > 0.5 ? "1" : "0",
        wobble: Math.random() * 15 - 7.5,
        wiggleDuration: Math.random() * 1 + 1.5,
        wiggleDelay: Math.random() * 1.5,
      };
    });
  }

  const particles = particleData.current;

  useLayoutEffect(() => {
    if (
      !sectionRef.current ||
      !particlesContainerRef.current ||
      !particleData.current
    ) {
      return;
    }

    const particleElements = gsap.utils.toArray(".particle");

    // Set initial state
    gsap.set(particleElements, {
      x: (i) => particles[i].randomX,
      y: (i) => particles[i].randomY,
      opacity: 0.6,
    });

    // Set initial textShadow state on the H2 element
    gsap.set(clearInsightsTextH2Ref.current, {
      textShadow: "0 0 0px rgba(255, 255, 255, 0)",
    });

    // Set initial scale for arrow
    gsap.set(arrowRef.current, {
      scale: 1,
    });

    // Set initial state for background glow
    if (bgGlowRef.current) {
      gsap.set(bgGlowRef.current, {
        opacity: 0,
        scale: 0.8,
      });
    }

    let ctx = gsap.context(() => {
      // 1. Simple continuous floating (optimized for performance)
      const floatY = gsap.to(particleElements, {
        y: "+=20",
        duration: 2, // Reduced from 3 to 2
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          each: 0.1,
          repeat: -1,
          yoyo: true,
        },
      });

      const floatX = gsap.to(particleElements, {
        x: "+=15",
        duration: 2.5, // Reduced from 4 to 2.5
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          each: 0.15,
          repeat: -1,
          yoyo: true,
        },
      });

      const floatRotation = gsap.to(particleElements, {
        rotation: 5,
        duration: 3, // Reduced from 5 to 3
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          each: 0.2,
          repeat: -1,
          yoyo: true,
        },
      });

      // 2. Main scroll timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=100%",
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          onEnter: () => {
            floatY.pause();
            floatX.pause();
            floatRotation.pause();
          },
          onLeaveBack: () => {
            floatY.resume();
            floatX.resume();
            floatRotation.resume();
          },
        },
      });

      // Phase 1: Cloud -> RAW DATA
      tl.to(particleElements, {
        x: (i) => particles[i].rawX,
        y: (i) => particles[i].rawY,
        rotation: 0,
        opacity: 1,
        ease: "back.out(0.4)",
        duration: 4,
        stagger: {
          amount: 0.3,
          from: "random",
        },
      })
        // Arrow fades in during RAW DATA formation
        .to(
          arrowRef.current,
          {
            opacity: 0.8,
            duration: 2,
          },
          "-=2"
        )
        // Start pulsing animation after arrow is visible
        .add(() => {
          gsap.to(arrowRef.current, {
            scale: 1.15,
            duration: 1.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }, "-=1.5")

        // Phase 2: RAW DATA -> CLEAR INSIGHTS
        .to(
          particleElements,
          {
            x: (i) => particles[i].clearX,
            y: (i) => particles[i].clearY,
            ease: "power2.inOut",
            duration: 4,
            stagger: {
              amount: 0.5,
              from: "random",
            },
          },
          "+=0.5"
        )
        // Fade in background glow as particles form CLEAR INSIGHTS
        .to(
          bgGlowRef.current,
          {
            opacity: 1,
            scale: 1,
            duration: 3,
            ease: "power2.inOut",
          },
          "-=3.5" // Start early so it builds up as particles move
        )
        // Pulse the glow for extra effect
        .to(
          bgGlowRef.current,
          {
            scale: 1.1,
            duration: 1,
            ease: "sine.inOut",
          },
          "-=1"
        )
        // Fade out particles as text fades in
        .to(
          particleElements,
          {
            opacity: 0,
            duration: 0.6,
          },
          "+=0"
        )
        // Epic text reveal with glow
        .to(
          clearInsightsTextRef.current,
          {
            opacity: 1,
            duration: 0.3,
            ease: "power2.in",
          },
          "-=0.6"
        )
        .to(
          clearInsightsTextH2Ref.current,
          {
            textShadow: `
      0 0 20px rgba(255, 255, 255, 1),
      0 0 40px rgba(255, 255, 255, 0.9),
      0 0 60px rgba(255, 255, 255, 0.7),
      0 0 80px rgba(255, 255, 255, 0.5)
    `,
            duration: 0.3,
            ease: "power2.in",
          },
          "-=0.6"
        )
        // Hold the white flash
        .to(
          clearInsightsTextH2Ref.current,
          {
            textShadow: `
      0 0 20px rgba(255, 255, 255, 1),
      0 0 40px rgba(255, 255, 255, 0.9),
      0 0 60px rgba(255, 255, 255, 0.7),
      0 0 80px rgba(255, 255, 255, 0.5)
    `,
            duration: 0.5,
          },
          "+=0"
        )
        // Transition to Green Glow
        .to(
          clearInsightsTextH2Ref.current,
          {
            textShadow: `
      0 0 10px rgba(132, 150, 60, 0.8),
      0 0 20px rgba(132, 150, 60, 0.6),
      0 0 30px rgba(132, 150, 60, 0.4),
      0 0 40px rgba(132, 150, 60, 0.2)
    `,
            duration: 0.8,
            ease: "power2.out",
          },
          "+=0"
        )
        // Arrow stays visible
        .to(
          arrowRef.current,
          {
            opacity: 0.8,
            duration: 0.1,
          },
          "<"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="h-[100vh] relative overflow-hidden pattern-bg bg-bg-primary"
    >
      {/* Gradient overlay for seamless transition */}
      <div
        className="absolute top-0 left-0 w-full h-[500px] pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgb(24, 28, 19) 0%, rgb(24, 28, 19) 35%, rgba(24, 28, 19, 0.8) 55%, rgba(24, 28, 19, 0.4) 75%, transparent 100%)",
        }}
      />
      <div
        ref={particlesContainerRef}
        className="w-full h-screen overflow-hidden"
      >
        <div className="relative w-full h-full flex justify-center items-center">
          <div className="relative">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="particle absolute text-[#84963C] font-mono font-bold text-sm pointer-events-none"
              >
                {particle.char}
              </div>
            ))}
          </div>

          {/* Background Glow for CLEAR INSIGHTS formation */}
          <div
            ref={bgGlowRef}
            className="absolute top-1/2 left-1/2 opacity-0 pointer-events-none"
            style={{
              transform: "translate(-50%, calc(-50% + 200px))",
              width: "800px",
              height: "200px",
              background:
                "radial-gradient(ellipse at center, rgba(132, 150, 60, 0.4) 0%, rgba(132, 150, 60, 0.2) 30%, rgba(132, 150, 60, 0.1) 50%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />

          {/* CLEAR INSIGHTS Text Layer with Epic Glow */}
          <div
            ref={clearInsightsTextRef}
            className="absolute top-1/2 left-1/2 opacity-0 pointer-events-none z-20"
            style={{
              transform: "translate(calc(-50% + 5px), 204px)",
            }}
          >
            <h2
              ref={clearInsightsTextH2Ref}
              className="font-black text-[#84963C] m-0"
              style={{
                fontSize: "80px",
                fontFamily: "Arial",
                lineHeight: 1,
              }}
            >
              CLEAR INSIGHTS
            </h2>
          </div>

          {/* Arrow with glow effect */}
          <div
            ref={arrowRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[108px] opacity-0 z-20"
            style={{
              filter:
                "drop-shadow(0 0 10px rgba(132, 150, 60, 0.8)) drop-shadow(0 0 20px rgba(132, 150, 60, 0.4))",
            }}
          >
            <svg
              width="60"
              height="100"
              viewBox="0 0 60 100"
              className="text-[#84963C]"
            >
              <line
                x1="30"
                y1="10"
                x2="30"
                y2="70"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M30 70 L20 60 M30 70 L40 60"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScatterOrganizeAnimationGSAP;
