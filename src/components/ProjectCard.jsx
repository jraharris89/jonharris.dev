import React from "react";
import { useInView } from "react-intersection-observer";

// Threshold array for precise intersection ratios
const threshold = [...Array(101).keys()].map((x) => x / 100);

export default function ProjectCard({
  project,
  onOpenModal,
  idx,
  setVisibility,
  mostVisibleProject,
}) {
  const { ref } = useInView({
    threshold: threshold,
    initialInView: false, // Prevent initial trigger
    onChange: (inView, entry) => {
      setVisibility((prev) => ({
        ...prev,
        [idx]: entry.intersectionRatio || 0,
      }));
    },
  });

  // Determine if this card is the most visible based on parent state
  const isMostVisible = mostVisibleProject === idx;

  // Conditionally apply the 'is-in-view' class based on the state
  const inViewClass = isMostVisible ? "is-in-view" : "";

  return (
    // We apply the 'group' class and conditionally 'is-in-view' here
    <div ref={ref} className={`group h-full ${inViewClass}`}>
      {/* Animated border gradient wrapper */}
      {/*
        SIMPLIFIED LOGIC:
        - Base: Dim styles.
        - Lit Up Condition 1 (Mobile Scroll): Add 'lit' styles IF 'group-[.is-in-view]' AND screen is SMALLER than 'md'.
          We use Tailwind's 'max-md:' variant for this.
        - Lit Up Condition 2 (Desktop Hover): Add 'lit' styles IF 'md:group-hover'.
      */}
      <div
        className={`relative h-full rounded-3xl p-[3px] 
                    opacity-60 shadow-none /* Base dim */
                    max-md:group-[.is-in-view]:opacity-100 max-md:group-[.is-in-view]:shadow-[0_0_20px_rgba(212,222,149,0.4)] /* Lit on mobile scroll ONLY */
                    md:group-hover:opacity-100 md:group-hover:shadow-[0_0_20px_rgba(212,222,149,0.4)] /* Lit on desktop hover ONLY */
                    transition-all duration-500 animate-border-spin animated-border-gradient`}
      >
        {/* Card content */}
        <div className="relative h-full bg-bg-overlay rounded-3xl overflow-hidden">
          {/* Image/Icon Section */}
          <div className="relative h-48 bg-gradient-to-br from-olive-900 via-olive-800 to-olive-900 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1FileswLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
            {project.image ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 group-hover:opacity-0 md:group-hover:opacity-0 transition-opacity duration-300 w-[136px] h-[136px]"></div>
                </div>
                {/* SIMPLIFIED Image Logic */}
                <img
                  src={project.image}
                  alt={project.title}
                  className={`relative z-10 
                              w-24 h-24 object-contain opacity-80 mix-blend-luminosity /* Base dim */
                              max-md:group-[.is-in-view]:w-full max-md:group-[.is-in-view]:h-full max-md:group-[.is-in-view]:object-cover max-md:group-[.is-in-view]:opacity-100 max-md:group-[.is-in-view]:mix-blend-normal /* Lit on mobile scroll ONLY */
                              md:group-hover:w-full md:group-hover:h-full md:group-hover:object-cover md:group-hover:opacity-100 md:group-hover:mix-blend-normal /* Lit on desktop hover ONLY */
                              transition-all duration-700 ease-out`}
                />
              </div>
            ) : (
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-6xl">{project.emoji}</div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-5 sm:p-6 flex flex-col h-[calc(100%-12rem)]">
            {/* SIMPLIFIED Title Logic */}
            <h3
              className={`text-lg sm:text-xl font-semibold mb-3 
                          text-text-secondary [text-shadow:none] /* Base dim */
                          max-md:group-[.is-in-view]:text-white max-md:group-[.is-in-view]:[text-shadow:0_0_8px_rgba(255,255,255,0.3)] /* Lit on mobile scroll ONLY */
                          md:group-hover:text-white md:group-hover:[text-shadow:0_0_8px_rgba(255,255,255,0.3)] /* Lit on desktop hover ONLY */
                          transition-all duration-300`}
            >
              {project.title}
            </h3>
            <p className="text-text-muted text-sm leading-relaxed mb-4 flex-grow">
              {project.description}
            </p>

            {/* Tech Stack Pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tech.map((tech, i) => (
                <span
                  key={i}
                  className="px-2.5 sm:px-3 py-1 bg-olive-900/10 rounded-full text-xs text-text-secondary font-medium border border-olive-900/30"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* View Details Link with Animated Border on Hover and Mobile */}
            <div className="relative w-full mt-2">
              {/* Animated border wrapper - visible on desktop hover OR mobile when in-view */}
              <div
                className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-r from-olive-900 via-olive-300 to-olive-900 
                          opacity-0 
                          md:group-hover:opacity-100 
                          max-md:group-[.is-in-view]:opacity-100 
                          transition-opacity duration-500 animate-gradient bg-[length:200%_200%] 
                          md:group-hover:shadow-[0_0_20px_rgba(212,222,149,0.4)]
                          max-md:group-[.is-in-view]:shadow-[0_0_20px_rgba(212,222,149,0.4)]"
              >
                {/* Inner background matching card to create border effect */}
                <div className="w-full h-full rounded-[11px] bg-bg-overlay"></div>
              </div>

              {/* The actual button - keeps original styling when not hovered/in-view */}
              <button
                onClick={() => onOpenModal(project)}
                className="relative w-full py-2.5 px-6 rounded-xl 
                           bg-olive-900/10 text-text-secondary text-sm font-semibold 
                           border border-olive-900/30
                           flex items-center justify-center gap-2 
                           transition-all duration-300
                           
                           /* Desktop hover changes */
                           md:group-hover:border-transparent
                           md:group-hover:bg-transparent
                           md:group-hover:text-white
                           md:group-hover:[text-shadow:0_0_8px_rgba(255,255,255,0.3)]
                           md:group-hover:gap-3
                           
                           /* Mobile in-view changes (same as hover) */
                           max-md:group-[.is-in-view]:border-transparent
                           max-md:group-[.is-in-view]:bg-transparent
                           max-md:group-[.is-in-view]:text-white
                           max-md:group-[.is-in-view]:[text-shadow:0_0_8px_rgba(255,255,255,0.3)]
                           max-md:group-[.is-in-view]:gap-3"
              >
                View Details
                {/* --- THIS IS THE CORRECT SVG --- */}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                {/* --- END CORRECT SVG --- */}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
