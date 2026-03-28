"use client";
import { useEffect, useState } from "react";
import { WORDS } from "../data/scrollWords";

function getIsProjects() {
  return new URLSearchParams(window.location.search).get("view") === "projects";
}

export default function MobileScrollWords() {
  const [isProjects, setIsProjects] = useState(false);

  useEffect(() => {
    setIsProjects(getIsProjects());

    const onPop = () => setIsProjects(getIsProjects());
    window.addEventListener("popstate", onPop);

    // Next.js uses history.pushState for soft navigation
    const origPush = history.pushState.bind(history);
    history.pushState = (...args) => {
      origPush(...args);
      setIsProjects(getIsProjects());
    };

    return () => {
      window.removeEventListener("popstate", onPop);
      history.pushState = origPush;
    };
  }, []);

  if (!isProjects) return null;

  return (
    <div className="mobile-scroll-header">
      <div className="mobile-scroll-inner">
        {WORDS.map((word) => (
          <span key={word} className="mobile-scroll-word">{word}</span>
        ))}
      </div>
    </div>
  );
}
