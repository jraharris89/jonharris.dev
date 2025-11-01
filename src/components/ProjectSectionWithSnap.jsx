// ProjectsSectionWithSnap.jsx
// Updated Projects section with mobile scroll snap behavior

import ProjectCard from "./ProjectCard";

const ProjectsSectionWithSnap = ({
  projects,
  openProjectModal,
  setVisibility,
  mostVisibleProject,
  snapIntensity = "gentle", // 'gentle', 'medium', or 'strong'
}) => {
  // Determine the scroll snap class based on intensity
  const getSnapClass = () => {
    // UPDATED:
    // We now use space-y-6 (single column) for sm AND md.
    // The grid layout only kicks in at 'lg:'
    switch (snapIntensity) {
      case "strong":
        return "space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0 lg:auto-rows-fr";
      case "medium":
        return "space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0 lg:auto-rows-fr";
      case "gentle":
      default:
        return "space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0 lg:auto-rows-fr";
    }
  };

  return (
    <section
      id="projects"
      className="py-20 sm:py-24 px-4 sm:px-5 bg-bg-primary h-full"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-12 sm:mb-16 text-center gradient-text">
          Featured Projects
        </h2>

        {/* Projects container with scroll snap for mobile */}
        <div className={`${getSnapClass()}`}>
          {projects.map((project, idx) => (
            <div
              key={idx}
              // UPDATED:
              // The 'md:snap-none' is now 'lg:snap-none' to match the new breakpoint.
              // The .snap-start class is now active on sm and md screens.
              className="snap-start lg:snap-none"
              style={{
                // This applies to sm and md screens (where snap-start is active)
                scrollMarginTop: "5rem",
              }}
            >
              <ProjectCard
                idx={idx}
                project={project}
                onOpenModal={openProjectModal}
                setVisibility={setVisibility}
                mostVisibleProject={mostVisibleProject}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSectionWithSnap;
