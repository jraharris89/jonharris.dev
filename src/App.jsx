import React, { useState, useEffect } from "react";
import ReactGA from "react-ga4";
import { Menu, X, Mail, ChevronDown } from "lucide-react";
import { projects } from "./data/projects";
import Counter from "./components/Counter";
import { useTypewriter } from "./hooks/useTypewriter";
// import { BackgroundGradient } from "./components/BackgroundGradient";
import { useSafeArea } from "./hooks/useSafeArea";
import useViewportHeight from "./hooks/useViewportHeight";
import ParticlesBackground from "./components/ParticlesBackground";
import ScatterOrganizeAnimationGSAP from "./components/ScatterOrganizeAnimationGSAP";
import ProjectModal from "./components/ProjectModal";
import ProjectCard from "./components/ProjectCard";
import BouncingDownloadIcon from "./components/BouncingDownloadIcon";
import ProjectsSectionWithSnap from "./components/ProjectSectionWithSnap";

// Images from public folder
const LogoImage = "/Olive_Logo.png";
const ProfilePic = "/headshot.jpeg";

// Initialize Google Analytics
ReactGA.initialize("G-1DRREDB0CY");

export default function Portfolio() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("hero");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("up");
  const [lastScrollY, setLastScrollY] = useState(0);
  // --- State for visibility tracking ---
  const [visibility, setVisibility] = useState({});
  const [mostVisibleProject, setMostVisibleProject] = useState(null);
  // --- End State ---

  // --- Custom Hooks ---
  // Get safe area insets (for nav/footer padding)
  const { safeAreaInsets } = useSafeArea();
  // Set smooth viewport height (for mobile bars)
  useViewportHeight();

  const greetings = [
    "Hi, I'm Jon",
    "Hola, soy Jon",
    "Bonjour, je suis Jon",
    "Hallo, ich bin Jon",
    "Ciao, sono Jon",
    "こんにちは、ジョンです",
  ];

  // Use the custom typewriter hook
  const typedText = useTypewriter(greetings);

  useEffect(() => {
    // Track page view
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  // --- Effect for visibility tracking ---
  useEffect(() => {
    // Find the project with the highest intersection ratio
    const entries = Object.entries(visibility);
    if (entries.length === 0) {
      setMostVisibleProject(null);
      return;
    }

    const [mostVisibleIdx, maxRatio] = entries.reduce(
      (acc, [idx, ratio]) => {
        if (ratio > acc[1]) {
          return [idx, ratio];
        }
        return acc;
      },
      [null, 0]
    );

    // Only set if the max ratio is above a minimum threshold (e.g., 20%)
    if (maxRatio > 0.2) {
      setMostVisibleProject(Number(mostVisibleIdx));
    } else {
      setMostVisibleProject(null);
    }
  }, [visibility]);
  // --- End Effect ---

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1500);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 50);

      // Determine scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection("up");
      }

      setLastScrollY(currentScrollY);

      const sections = ["hero", "projects", "about", "contact"];
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Adjusted detection (original was 150)
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // Check if it's the projects section and screen is large (md breakpoint = 768px)
      const isLargeScreen = window.innerWidth >= 768;
      const isProjectsSection = id === "projects";

      if (isProjectsSection && isLargeScreen) {
        // Get the element's position and add extra offset for projects on large screens
        const elementPosition =
          element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition + 150; // Adjust this value (100px) as needed
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      } else if (isProjectsSection && !isLargeScreen) {
        // Mobile: push scroll down by 20px for projects section
        const elementPosition =
          element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition + 55;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      } else {
        element.scrollIntoView({ behavior: "smooth" });
      }

      setIsMenuOpen(false);
    }
  };

  // Track when someone opens a project modal
  const openProjectModal = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);

    ReactGA.event({
      category: "Project",
      action: "View Details",
      label: project.title,
    });
  };

  // Track when someone downloads resume
  const trackResumeDownload = () => {
    ReactGA.event({
      category: "Contact",
      action: "Download Resume",
    });
  };

  // Track when someone clicks email
  const trackEmailClick = () => {
    ReactGA.event({
      category: "Contact",
      action: "Click Email",
    });
  };

  const closeProjectModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-bg-accent flex items-center justify-center z-[9999]">
        <div className="w-[60px] h-[60px] border-4 border-olive-900 border-t-olive-300 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="font-sans text-gray-100 bg-bg-primary"
      style={{ paddingBottom: safeAreaInsets.bottom }}
    >
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out md:backdrop-blur-md ${
          scrollDirection === "down" && isScrolled
            ? "-translate-y-full"
            : "translate-y-0"
        } bg-bg-primary/95 md:bg-bg-primary/30`}
        style={{ paddingTop: safeAreaInsets.top }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-8 py-3 sm:py-5 flex justify-between items-center">
          <div
            onClick={() => scrollToSection("hero")}
            // Mobile sizes from tweaks, desktop (md) size from your original file
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-20 md:h-20 bg-gradient-to-br from-olive-900 to-olive-950 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform overflow-hidden"
          >
            <img
              src={LogoImage}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden bg-transparent border-none text-text-secondary cursor-pointer p-2"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <ul
            className={`${
              isMenuOpen ? "flex" : "hidden"
            } md:flex flex-col md:flex-row absolute md:relative top-[56px] sm:top-[64px] md:top-0 left-0 right-0 md:left-auto md:right-auto bg-bg-primary/80 backdrop-blur-lg md:bg-transparent gap-4 sm:gap-5 md:gap-10 list-none items-center p-4 sm:p-5 md:p-0 shadow-lg md:shadow-none border-t border-olive-900/20 md:border-0`}
          >
            {["hero", "projects", "about", "contact"].map((section) => (
              <li key={section}>
                <a
                  href={`#${section}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(section);
                  }}
                  className={`${
                    activeSection === section
                      ? "text-text-secondary"
                      : "text-text-muted"
                  } no-underline text-sm sm:text-base font-medium capitalize transition-all duration-300 cursor-pointer relative py-2 hover:text-text-secondary hover:[text-shadow:0_0_4px_rgba(212,222,149,0.6)]`}
                >
                  {section === "hero" ? "Home" : section}
                  {activeSection === section && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-secondary rounded-sm" />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        className="min-h-screen-safe flex items-start md:items-center justify-center relative overflow-hidden px-4 sm:px-5 md:px-20 pt-32 md:pt-16 pattern-bg bg-bg-primary"
      >
        <ParticlesBackground />
        <div className="max-w-4xl text-center relative z-10 animate-in fade-in duration-800">
          {/* Typing Animation */}
          <div className="mb-4 sm:mb-8">
            <h1
              // Mobile text-4xl and min-h-[80px] from tweaks, desktop sizes match original
              className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold typing-cursor min-h-[80px] gradient-text-animated"
            >
              {typedText}
            </h1>
          </div>

          <h2
            // Mobile text-2xl from tweaks, desktop sizes match original
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-8 leading-tight text-text-muted px-4 sm:px-0"
          >
            Data Analyst & Developer
          </h2>

          <p
            // Mobile text-sm from tweaks, desktop sizes match original
            className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-text-muted max-w-3xl mx-auto mb-8 sm:mb-12 font-normal px-4 sm:px-0"
          >
            I turn data into action — designing automated workflows, building
            dashboards and websites that surface critical insights, and
            analyzing trends that help teams make smarter, faster decisions.
          </p>

          <div className="flex gap-4 sm:gap-10 md:gap-16 justify-center mb-8 sm:mb-12 flex-wrap px-4 sm:px-0">
            {[
              { target: 3, suffix: "+", label: "Years Experience" },
              { target: 15, suffix: "+", label: "Dashboards Built" },
              { target: 20, suffix: "+", label: "Clients Served" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div
                  // Mobile text-3xl from tweaks, desktop sizes adjusted but match original's hierarchy
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-secondary mb-1"
                >
                  <Counter target={stat.target} suffix={stat.suffix} />
                </div>
                <div className="text-xs sm:text-sm text-text-muted font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 sm:gap-5 justify-center flex-wrap px-4 sm:px-0">
            <a
              href="/resume/Jonathon_Harris_DataEngineer.pdf"
              download="Jonathon_Harris_DataEngineer.pdf"
              onClick={trackResumeDownload}
              className="group inline-flex items-center gap-2 px-6 sm:px-9 py-3 sm:py-4 bg-gradient-to-br from-olive-900 to-olive-950 text-text-secondary border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 shadow-lg shadow-olive-900/30 hover:-translate-y-0.5 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3),0_10px_30px_rgba(99,107,47,0.4)] no-underline"
            >
              <BouncingDownloadIcon size={18} />
              Download Resume
            </a>
            <div className="group">
              <div className="relative rounded-xl p-[1px] bg-gradient-to-r from-olive-900 via-olive-300 to-olive-900 opacity-60 group-hover:opacity-100 transition-all duration-500 animate-gradient bg-[length:200%_200%] group-hover:shadow-[0_0_20px_rgba(212,222,149,0.4)]">
                <button
                  onClick={() => scrollToSection("contact")}
                  className="px-6 sm:px-9 py-3 sm:py-4 bg-bg-primary text-text-secondary border-none rounded-[11px] text-sm font-semibold cursor-pointer transition-all duration-300 hover:text-white hover:[text-shadow:0_0_8px_rgba(255,255,255,0.3)] w-full"
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => scrollToSection("projects")}
          // Centering fix from our tweaks
          className="absolute bottom-10 left-0 right-0 flex justify-center cursor-pointer opacity-60 animate-bounce-slow"
        >
          <ChevronDown size={32} className="text-text-secondary" />
        </div>
      </section>

      {/* Transition Section - Desktop Only */}
      {/* UPDATED: Changed lg:block back to md:block */}
      <div className="hidden md:block">
        <ScatterOrganizeAnimationGSAP />
      </div>

      {/* --- Projects Section using new component --- */}
      <section
        id="projects"
        className="py-1 sm:py-10 md:py-24 px-4 sm:px-5 md:px-20 bg-bg-primary"
      >
        <ProjectsSectionWithSnap
          projects={projects}
          openProjectModal={openProjectModal}
          setVisibility={setVisibility}
          mostVisibleProject={mostVisibleProject}
          // snapIntensity="gentle" // Re-enable this when snap CSS is active
        />
      </section>
      {/* --- END Projects Section --- */}

      {/* About Section */}
      <section
        id="about"
        className="py-2 sm:py-24 px-4 sm:px-5 md:px-20 pattern-bg bg-gradient-to-b from-bg-primary to-bg-secondary"
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-10 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center gradient-text">
                About Me
              </h2>
              <div className="flex justify-center mb-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-olive-900 to-olive-950 flex items-center justify-center border-2 border-text-secondary/30 overflow-hidden">
                  <img
                    src={ProfilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p className="text-base sm:text-lg leading-relaxed text-text-muted mb-5">
                I'm a Portland-based data analyst and Computer Science graduate
                with over 3 years of experience solving complex operational
                challenges through data. I build performance dashboards,
                automate workflows, and surface insights that drive strategic
                decisions — specializing in systems where timing, efficiency,
                and scale matter.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-text-muted mb-8">
                I work across the full data stack — engineering pipelines,
                analyzing patterns, and designing interactive visualizations —
                to build solutions that turn technical complexity into clear,
                actionable strategy.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {[
                  "SQL",
                  "Python",
                  "R",
                  "Tableau",
                  "Power BI",
                  "Google Apps Script",
                  "ETL",
                  "Automation",
                  "Data Modeling",
                  "Statistical Analysis",
                  "Kafka",
                  "Snowflake",
                  "APIs",
                  "React",
                  "JavaScript",
                ].map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 bg-olive-900/20 border border-olive-900/40 rounded-lg text-text-secondary text-xs sm:text-sm font-medium hover:bg-olive-900/30 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-20 sm:py-24 px-4 sm:px-5 md:px-20 bg-bg-primary"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 gradient-text">
            Let's Connect
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-text-muted mb-10 sm:mb-12 max-w-2xl mx-auto">
            I'm currently seeking full-time opportunities to build impactful
            data solutions. If you're looking for someone who can handle
            everything from pipeline engineering to strategic insights, I'd love
            to hear from you.
          </p>

          <div className="flex gap-4 sm:gap-5 justify-center mb-8 sm:mb-10 flex-wrap">
            <a
              href="mailto:contact@jonharris.dev"
              onClick={trackEmailClick}
              className="group w-full sm:w-auto px-7 sm:px-9 py-3.5 sm:py-4 bg-gradient-to-br from-olive-900 to-olive-950 text-text-secondary no-underline rounded-xl text-sm sm:text-base font-semibold inline-flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg shadow-olive-900/30 hover:-translate-y-0.5 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3),0_10px_30px_rgba(99,107,47,0.4)]"
            >
              <Mail size={20} className="group-hover:animate-bounce" />
              Send Email
            </a>
            <div className="group inline-block w-full sm:w-auto">
              <div className="relative rounded-xl p-[1px] bg-gradient-to-r from-olive-900 via-olive-300 to-olive-900 opacity-60 group-hover:opacity-100 transition-all duration-500 animate-gradient bg-[length:200%_200%] group-hover:shadow-[0_0_20px_rgba(212,222,149,0.4)]">
                <a
                  href="/resume/Jonathon_Harris_DataEngineer.pdf"
                  download
                  className="group px-7 sm:px-9 py-3.5 sm:py-4 bg-bg-primary text-text-secondary no-underline rounded-[11px] text-sm sm:text-base font-semibold inline-flex items-center justify-center gap-2.5 transition-all duration-300 hover:text-white hover:[text-shadow:0_0_8px_rgba(255,255,255,0.3)] w-full"
                >
                  <BouncingDownloadIcon size={20} />
                  Download Resume
                </a>
              </div>
            </div>
          </div>

          <div className="flex gap-5 justify-center">
            {[
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                ),
                href: "https://github.com/jraharris89",
                label: "GitHub",
              },
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                ),
                href: "https://www.linkedin.com/in/jonra-harris/",
                label: "LinkedIn",
              },
            ].map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-12 h-12 rounded-full bg-olive-900/20 border border-olive-900/40 flex items-center justify-center text-text-secondary transition-all duration-300 no-underline hover:bg-olive-900/40 hover:-translate-y-1"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-5 md:px-10 text-center border-t border-olive-900/20 bg-bg-primary">
        <p className="text-text-muted text-sm">
          © 2025 Jonathon Harris. Built with React.
        </p>
      </footer>

      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeProjectModal}
      />
    </div>
  );
}
