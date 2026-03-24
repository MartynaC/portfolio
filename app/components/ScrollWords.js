"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WORDS, DEV_WORDS, PX_PER_WORD } from "../data/scrollWords";

const LINE_H = 17;
const MAX_VISIBLE = Math.floor(160 / LINE_H);

export default function ScrollWords() {
  const searchParams = useSearchParams();
  const words = searchParams.get("view") === "development" ? DEV_WORDS : WORDS;
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(Math.min(Math.floor(window.scrollY / PX_PER_WORD), words.length));
    const onScroll = () => {
      setCount(Math.min(Math.floor(window.scrollY / PX_PER_WORD), words.length));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [words]);

  const offset = Math.max(0, count - MAX_VISIBLE) * LINE_H;

  return (
    <div className="scroll-words">
      <div className="scroll-words-inner" style={{ transform: `translateY(-${offset}px)` }}>
        {words.slice(0, count).map((word) => (
          <span key={word} className="scroll-word">{word}</span>
        ))}
      </div>
    </div>
  );
}
