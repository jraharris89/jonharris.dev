import React, { useEffect, useRef } from "react";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import sql from "highlight.js/lib/languages/sql";
import python from "highlight.js/lib/languages/python";
import "highlight.js/styles/vs2015.css";

// Register only the languages we need
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("python", python);

const CodeBlock = ({ code, language = "javascript" }) => {
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      // Remove any existing highlighting
      codeRef.current.removeAttribute("data-highlighted");

      // Apply highlight.js
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  return (
    <div className="rounded-lg p-4 overflow-x-auto bg-bg-dark">
      <pre className="text-sm">
        <code
          ref={codeRef}
          className={`language-${language} hljs`}
          style={{
            background: "transparent",
            padding: 0,
            fontSize: "0.875rem",
            lineHeight: "1.5",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
