"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WORDS, PX_PER_WORD } from "../data/scrollWords";

export default function MobileScrollWords() {
  const searchParams = useSearchParams();
  const isProjects = searchParams.get("view") === "projects";

  const [count, setCount] = useState(0);
  const [pastHalf, setPastHalf] = useState(false);
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setCount(Math.min(Math.floor(window.scrollY / PX_PER_WORD), WORDS.length));
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setPastHalf(scrollable > 0 && window.scrollY / scrollable >= 0.5);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!outerRef.current || !innerRef.current) return;
    const overflow = innerRef.current.scrollWidth - outerRef.current.clientWidth;
    innerRef.current.style.transform = overflow > 0
      ? `translateX(-${overflow + 16}px)`
      : "translateX(0)";
  }, [count]);

  if (!isProjects || !pastHalf) return null;

  return (
    <div className="mobile-scroll-header" ref={outerRef}>
      <div className="mobile-scroll-inner" ref={innerRef}>
        {WORDS.slice(0, count).map((word) => (
          <span key={word} className="mobile-scroll-word">{word}</span>
        ))}
      </div>
    </div>
  );
}
