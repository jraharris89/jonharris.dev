import React from "react";
import { useInView } from "react-intersection-observer";

// This generates an array of 100 threshold points (0, 0.01, 0.02, ... 1)
// This is necessary to get precise intersection ratios.
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
    onChange: (inView, entry) => {
      // Send this card's visibility ratio up to the parent
      setVisibility((prev) => ({
        ...prev,
        [idx]: entry.intersectionRatio,
      }));
    },
  });

  // This card is "lit up" only if its index matches the winning index
  const isMostVisible = mostVisibleProject === idx;

  return (
    <div
      ref={ref}
      className={`group h-full ${
        isMostVisible ? "is-in-view" : "" // Use isMostVisible here
      }`}
    >
      {/* Animated border gradient wrapper */}
      <div className="relative h-full rounded-3xl p-[3px] opacity-60 group-hover:opacity-100 group-[.is-in-view]:opacity-100 transition-all duration-500 animate-border-spin group-hover:shadow-[0_0_20px_rgba(212,222,149,0.4)] group-[.is-in-view]:shadow-[0_0_20px_rgba(212,222,149,0.4)] animated-border-gradient">
        {/* Card content */}
        <div className="relative h-full bg-bg-overlay rounded-3xl overflow-hidden">
          {/* Image/Icon Section with Gradient Background */}
          <div className="relative h-48 bg-gradient-to-br from-olive-900 via-olive-800 to-olive-900 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZHRoPSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1FileswLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
            {project.image ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Container styling for non-hover state */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 group-hover:opacity-0 transition-opacity duration-300 w-[136px] h-[136px]"></div>
                </div>
                {/* Single image that scales from small to large */}
                <img
                  src={project.image}
                  alt={project.title}
                  className="relative z-10 w-24 h-24 object-contain opacity-80 mix-blend-luminosity group-hover:w-full group-[.is-in-view]:w-full group-hover:h-full group-[.is-in-view]:h-full group-hover:object-cover group-[.is-in-view]:object-cover group-hover:opacity-100 group-[.is-in-view]:opacity-100 group-hover:mix-blend-normal group-[.is-in-view]:mix-blend-normal transition-all duration-700 ease-out"
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
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-text-secondary group-hover:text-white group-[.is-in-view]:text-white group-hover:[text-shadow:0_0_8px_rgba(255,255,255,0.3)] group-[.is-in-view]:[text-shadow:0_0_8px_rgba(255,255,255,0.3)] transition-all duration-300">
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

            {/* View Details Link */}
            <button
              onClick={() => onOpenModal(project)}
              className="w-full mt-2 py-2.5 rounded-xl bg-olive-900/10 hover:bg-olive-900/20 text-text-secondary text-sm font-semibold flex items-center justify-center gap-2 transition-all group-hover:gap-3 border border-olive-900/30"
            >
              View Details
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
