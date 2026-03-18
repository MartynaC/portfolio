"use client";
import { useEffect, useState } from "react";
import { WORDS, PX_PER_WORD } from "../data/scrollWords";

const LINE_H = 17;
const MAX_VISIBLE = Math.floor(160 / LINE_H);

export default function ScrollWords() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setCount(Math.min(Math.floor(window.scrollY / PX_PER_WORD), WORDS.length));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const offset = Math.max(0, count - MAX_VISIBLE) * LINE_H;

  return (
    <div className="scroll-words">
      <div className="scroll-words-inner" style={{ transform: `translateY(-${offset}px)` }}>
        {WORDS.slice(0, count).map((word) => (
          <span key={word} className="scroll-word">{word}</span>
        ))}
      </div>
    </div>
  );
}
