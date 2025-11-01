import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Github,
  ExternalLink,
  Code,
  Eye,
  BarChart3,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import CodeBlock from "./CodeBlock";

export default function ProjectModal({ project, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeCodeSnippet, setActiveCodeSnippet] = useState(0);
  const [gistContent, setGistContent] = useState({});
  const [loadingGist, setLoadingGist] = useState(false);

  // Callback ref for scroll container optimization
  const scrollContainerRef = useCallback((node) => {
    if (node) {
      // Optimize scroll performance
      node.style.scrollbarWidth = "thin";
      node.style.scrollbarColor = "rgb(109 139 47) rgb(26 29 20)"; // olive-900 and bg-dark colors
    }
  }, []);

  // Reset active tab when modal opens and push history state
  useEffect(() => {
    if (isOpen) {
      setActiveTab("overview");
      setActiveCodeSnippet(0);
      // Push a state to browser history when modal opens
      window.history.pushState({ modalOpen: true }, "");
    }
  }, [isOpen]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (e) => {
      if (isOpen) {
        // Close modal when back button is pressed
        onClose();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Fetch Gist content when modal opens and project has codeSnippets with gistUrls
  useEffect(() => {
    if (isOpen && project?.codeSnippets) {
      const fetchGistContent = async () => {
        setLoadingGist(true);
        const content = {};

        for (const snippet of project.codeSnippets) {
          if (snippet.gistUrl) {
            try {
              // Extract gist ID from URL
              const gistId = snippet.gistUrl.split("/").pop();
              const response = await fetch(
                `https://api.github.com/gists/${gistId}`
              );
              const gistData = await response.json();

              // Get the first file content from the gist
              const files = Object.values(gistData.files);
              if (files.length > 0) {
                content[snippet.title] = files[0].content;
              }
            } catch (error) {
              console.error(
                `Failed to fetch gist for ${snippet.title}:`,
                error
              );
              // Fallback to the embedded code
              content[snippet.title] = snippet.code;
            }
          } else {
            // Use embedded code if no gist URL
            content[snippet.title] = snippet.code;
          }
        }

        setGistContent(content);
        setLoadingGist(false);
      };

      fetchGistContent();
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-bg-overlay rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-olive-900/30 animate-in fade-in duration-300">
        {/* Header */}
        <div className="relative h-48 bg-gradient-to-br from-olive-900 via-olive-800 to-olive-900 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

          {/* X button in upper right - now larger and more visible */}
          <button
            onClick={onClose}
            className="absolute top-2 right-4 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 hover:scale-110 transition-all duration-200 z-50 shadow-lg cursor-pointer border border-white/20"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          {project.image ? (
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover object-top opacity-90 z-10 relative"
            />
          ) : (
            <div className="text-8xl z-10 relative">{project.emoji}</div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-12rem)] overflow-y-auto">
          <h2 className="text-2xl font-bold text-text-primary [text-shadow:0_0_8px_rgba(248,250,245,0.3)] mb-2">
            {project.title}
          </h2>
          <p className="text-text-muted mb-6">{project.description}</p>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-olive-900/30">
            {["overview", "code", ...(project.liveUrl ? ["demo"] : [])].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-1 text-sm font-medium capitalize transition-colors flex items-center gap-1 ${
                    activeTab === tab
                      ? "text-text-secondary border-b-2 border-text-secondary"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {tab === "code" && <Code size={14} />}
                  {tab === "demo" && <Eye size={14} />}
                  {tab === "overview" && <BarChart3 size={14} />}
                  {tab}
                </button>
              )
            )}
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-text-secondary font-semibold mb-3 text-lg">
                    Technologies Used
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-olive-900/20 rounded-full text-sm text-text-secondary border border-olive-900/40"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {project.features && (
                  <div>
                    <h4 className="text-text-secondary font-semibold mb-3 text-lg">
                      Key Features
                    </h4>
                    <ul className="text-text-muted space-y-2">
                      {project.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-text-secondary mt-1">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.impact && (
                  <div>
                    <h4 className="text-text-secondary font-semibold mb-3 text-lg">
                      Impact & Results
                    </h4>
                    <p className="text-text-muted leading-relaxed">
                      {project.impact}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "code" && (
              <div className="space-y-4">
                {project.codeSnippets && project.codeSnippets.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center gap-4 mb-4">
                      <div className="flex gap-2 flex-wrap">
                        {project.codeSnippets.map((snippet, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveCodeSnippet(i)}
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                              activeCodeSnippet === i
                                ? "bg-olive-900/30 text-text-secondary"
                                : "bg-olive-900/20 text-text-muted hover:bg-olive-900/30 hover:text-text-secondary"
                            }`}
                          >
                            {snippet.title}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-olive-900 group relative">
                        <AlertTriangle
                          size={18}
                          className="text-text-secondary"
                        />
                        <span className="text-xs text-text-secondary w-full">
                          {" "}
                          {/* Removed whitespace-nowrap, added w-full */}
                          Code snippets shown with confidential data redacted.
                        </span>
                      </div>
                    </div>

                    <div className="bg-bg-dark rounded-lg border border-olive-900/30 overflow-hidden">
                      {/* Code Editor Header */}
                      <div className="bg-bg-darker px-4 py-2 border-b border-olive-900/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                          </div>
                          <span className="text-text-muted text-sm ml-2">
                            {project.codeSnippets[activeCodeSnippet].filename ||
                              "Automated_Report.gs"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 ml-auto">
                          {project.codeSnippets[activeCodeSnippet].gistUrl && (
                            <a
                              href={
                                project.codeSnippets[activeCodeSnippet].gistUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2 py-1 bg-olive-900/20 hover:bg-olive-900/30 text-text-secondary text-xs rounded transition-colors"
                            >
                              <Github size={12} />
                              View Gist
                            </a>
                          )}
                          <div className="text-olive-900 text-xs">
                            {project.codeSnippets[activeCodeSnippet].language}
                          </div>
                        </div>
                      </div>
                      {/* Code Content */}
                      <div
                        ref={scrollContainerRef}
                        className="p-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-olive-900 scrollbar-track-bg-dark hover:scrollbar-thumb-olive-800 focus-within:scrollbar-thumb-olive-800 cursor-text"
                        style={{
                          WebkitOverflowScrolling: "touch",
                          scrollBehavior: "auto",
                          willChange: "scroll-position",
                          transform: "translateZ(0)", // Force hardware acceleration
                          overflowAnchor: "none", // Prevent scroll anchoring issues
                        }}
                        tabIndex={0}
                        role="textbox"
                        aria-label="SQL Code Block"
                      >
                        {loadingGist ? (
                          <div className="flex items-center justify-center h-40">
                            <div className="text-text-muted">
                              Loading Gist content...
                            </div>
                          </div>
                        ) : (
                          <CodeBlock
                            code={
                              gistContent[
                                project.codeSnippets[activeCodeSnippet].title
                              ] || project.codeSnippets[activeCodeSnippet].code
                            }
                            language={
                              project.codeSnippets[activeCodeSnippet]
                                .language || "sql"
                            }
                          />
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-bg-dark rounded-lg border border-olive-900/30">
                    <div className="text-center">
                      <Code size={48} className="text-olive-900 mx-auto mb-4" />
                      <p className="text-text-muted">
                        Code examples coming soon...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "demo" && (
              <div className="text-center">
                {project.liveUrl ? (
                  <iframe
                    src={project.liveUrl}
                    className="w-full h-64 rounded-lg border border-olive-900/30"
                    title={`${project.title} Demo`}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-bg-dark rounded-lg border border-olive-900/30">
                    <div className="text-center">
                      <Eye size={48} className="text-olive-900 mx-auto mb-4" />
                      <p className="text-text-muted">
                        Live demo coming soon...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-olive-900/30 flex-wrap">
            {project.githubUrl && !project.hideGithub && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-olive-900/20 hover:bg-olive-900/30 text-text-secondary rounded-lg text-sm transition-colors"
              >
                <Github size={16} />
                View Code
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-olive-900 to-olive-950 text-text-secondary rounded-lg text-sm transition-colors hover:shadow-lg"
              >
                <ExternalLink size={16} />
                Live Demo
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
