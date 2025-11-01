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
    <div
      ref={ref}
      className={`group ${inViewClass} max-w-lg mx-auto lg:max-w-none lg:mx-0 h-full`}
    >
      {/* Animated border gradient wrapper */}
      {/* UPDATED: min-h for tablet preserved, added min-h for desktop to match all cards */}
      <div
        className={`relative rounded-3xl p-[3px] 
            opacity-60 shadow-none /* Base dim */
            max-lg:group-[.is-in-view]:opacity-100 max-lg:group-[.is-in-view]:shadow-[0_0_20px_rgba(212,222,149,0.4)] /* Lit on mobile/tablet scroll ONLY */
            lg:group-hover:opacity-100 lg:group-hover:shadow-[0_0_20px_rgba(212,222,149,0.4)] /* Lit on desktop hover ONLY */
            transition-all duration-500 animate-border-spin animated-border-gradient
            md:min-h-[780px] lg:min-h-[520px] h-full`}
      >
        {/* Card content */}
        {/* h-full here will now correctly fill the min-h of its parent */}
        <div className="relative h-full bg-bg-overlay rounded-3xl overflow-hidden flex flex-col">
          {/* Image/Icon Section */}
          {/* UPDATED: h-48 (mobile), md:h-[32rem] (tablet), lg:h-48 (desktop) */}
          <div className="relative h-48 md:h-[32rem] lg:h-48 bg-gradient-to-br from-olive-900 via-olive-800 to-olive-900 flex items-center justify-center overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1FileswLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
            {project.image ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 group-hover:opacity-0 lg:group-hover:opacity-0 transition-opacity duration-300 w-[136px] h-[136px]"></div>
                </div>
                {/* SIMPLIFIED Image Logic */}
                <img
                  src={project.image}
                  alt={project.title}
                  className={`relative z-10 
                      w-24 h-24 object-contain opacity-80 mix-blend-luminosity /* Base dim */
                      max-lg:group-[.is-in-view]:w-full max-lg:group-[.is-in-view]:h-full max-lg:group-[.is-in-view]:object-cover max-lg:group-[.is-in-view]:opacity-100 max-lg:group-[.is-in-view]:mix-blend-normal /* Lit on mobile/tablet scroll ONLY */
                      lg:group-hover:w-full lg:group-hover:h-full lg:group-hover:object-cover lg:group-hover:opacity-100 lg:group-hover:mix-blend-normal /* Lit on desktop hover ONLY */
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
          <div className="p-5 sm:p-6 flex flex-col flex-1">
            {/* SIMPLIFIED Title Logic */}
            <h3
              className={`text-lg sm:text-xl font-semibold mb-3 
                  text-text-secondary [text-shadow:none] /* Base dim */
                  max-lg:group-[.is-in-view]:text-white max-lg:group-[.is-in-view]:[text-shadow:0_0_8px_rgba(255,255,255,0.3)] /* Lit on mobile/tablet scroll ONLY */
                  lg:group-hover:text-white lg:group-hover:[text-shadow:0_0_8px_rgba(255,255,255,0.3)] /* Lit on desktop hover ONLY */
                  transition-all duration-300`}
            >
              {project.title}
            </h3>
            <p className="text-text-muted text-sm leading-relaxed mb-4 flex-1">
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
              {/* Animated border wrapper - visible on desktop hover OR mobile/tablet when in-view */}
              <div
                className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-r from-olive-900 via-olive-300 to-olive-900 
                    opacity-0 
                    lg:group-hover:opacity-100 
                    max-lg:group-[.is-in-view]:opacity-100 
                    transition-opacity duration-500 animate-gradient bg-[length:200%_200%] 
                    lg:group-hover:shadow-[0_0_20px_rgba(212,222,149,0.4)]
                    max-lg:group-[.is-in-view]:shadow-[0_0_20px_rgba(212,222,149,0.4)]"
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
                    lg:group-hover:border-transparent
                    lg:group-hover:bg-transparent
                    lg:group-hover:text-white
                    lg:group-hover:[text-shadow:0_0_8px_rgba(255,255,255,0.3)]
                    lg:group-hover:gap-3
                    
                    /* Mobile/tablet in-view changes (same as hover) */
                    max-lg:group-[.is-in-view]:border-transparent
                    max-lg:group-[.is-in-view]:bg-transparent
                    max-lg:group-[.is-in-view]:text-white
                    max-lg:group-[.is-in-view]:[text-shadow:0_0_8px_rgba(255,255,255,0.3)]
                    max-lg:group-[.is-in-view]:gap-3"
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002 2v-4M14 4h6m0 0v6m0-6L10 14"
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
