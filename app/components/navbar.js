"use client";

import React, { useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ScrollWords from "./ScrollWords";

export default function Navbar() {
  const canvasRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = "https://media.martynachojnacka.com/images/tetha.svg";

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const draw = (theta) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(theta);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
    };

    img.onload = () => {
      draw(-Math.PI / 2);
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const theta = Math.atan2(dy, dx) - Math.PI / 2;
      draw(theta);
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <nav className="navbar navbar-expand-md">
      <canvas
        ref={canvasRef}
        width={80}
        height={80}
        className="logo-canvas"
        style={{ cursor: "pointer" }}
        onClick={() => router.push("/")}
      />

      <ul className="main-menu">
        <li className="list-item">
          <Link href="/?view=projects">PROJECTS</Link>
        </li>
        <li className="list-item">
          <Link href="/?view=about">ABOUT</Link>
        </li>
        <li className="list-item">
          <Link href="/?view=contact">CONTACT</Link>
        </li>
        <li className="list-item" style={{ fontSize: "0.7em" }}>
          <Link href="/?view=development">web dev archive</Link>
        </li>
      </ul>

      <Suspense fallback={null}>
        <ScrollWords />
      </Suspense>

      <p className="sticky-bottom">
        Martyna Chojnacka <br />
        Creative Technologist | Visual Artist | Developer
      </p>
    </nav>
  );
}
