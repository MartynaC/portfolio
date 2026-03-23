"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

const BOX_HEIGHT = "70vh";

function makeFloat() {
  return {
    phase:  Math.random() * Math.PI * 2,
    freqX:  0.20 + Math.random() * 0.20,
    freqY:  0.16 + Math.random() * 0.18,
    ampX:   2    + Math.random() * 3,
    ampY:   2    + Math.random() * 3,
    rFreqX: 0.14 + Math.random() * 0.12,
    rFreqY: 0.11 + Math.random() * 0.10,
    rFreqZ: 0.07 + Math.random() * 0.06,
    rAmpX:  5    + Math.random() * 5,
    rAmpY:  8    + Math.random() * 6,
    rAmpZ:  1.5  + Math.random() * 2.5,
  };
}

function ProjectList({ projects }) {
  return (
    <>
      {projects.map((p) => {
        const media = p.gif ? (
          <img src={p.gif} draggable={false} style={{ width: "100%", display: "block" }} alt={p.title} />
        ) : p.video ? (
          <video src={p.video} autoPlay muted loop playsInline style={{ width: "100%", display: "block" }} />
        ) : (
          <img src={p.image} draggable={false} style={{ width: "100%", display: "block" }} alt={p.title} />
        );

        return (
          <div key={p.id} style={{ margin: 0, padding: 0, lineHeight: 0 }}>
            {p.link?.startsWith("/") ? (
              <Link href={p.link} style={{ display: "block" }} onClick={(e) => e.stopPropagation()}>{media}</Link>
            ) : p.link ? (
              <a href={p.link} target="_blank" rel="noreferrer" style={{ display: "block" }} onClick={(e) => e.stopPropagation()}>{media}</a>
            ) : media}
          </div>
        );
      })}
    </>
  );
}

export default function CommercialShowcase({ projects }) {
  const gridBoxRef   = useRef(null);
  const portalBoxRef = useRef(null);
  const floatRef     = useRef(makeFloat());
  const rafRef       = useRef(null);
  const expandedRef  = useRef(false);
  const dragRef      = useRef({ active: false, lastX: 0, lastY: 0, rotX: 0, rotY: 0 });
  const [expanded, setExpanded] = useState(false);

  // ── Animation loop ─────────────────────────────────────────────────
  useEffect(() => {
    function tick() {
      const f = floatRef.current;
      const t = performance.now() / 1000;
      const rx = Math.sin(t * f.rFreqX + f.phase * 0.9) * f.rAmpX;
      const ry = Math.cos(t * f.rFreqY + f.phase * 1.1) * f.rAmpY;
      const rz = Math.sin(t * f.rFreqZ + f.phase * 0.6) * f.rAmpZ;

      if (expandedRef.current) {
        const pb = portalBoxRef.current;
        if (pb) {
          const d = dragRef.current;
          pb.style.transform = d.active
            ? `rotateX(${d.rotX.toFixed(2)}deg) rotateY(${d.rotY.toFixed(2)}deg)`
            : `rotateX(${(d.rotX + rx).toFixed(2)}deg) rotateY(${(d.rotY + ry).toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
        }
      } else {
        const gb = gridBoxRef.current;
        if (gb) {
          // Grid: 2D float only — no 3D rotation so scroll hit-testing is reliable
          const tx = Math.sin(t * f.freqX + f.phase) * f.ampX;
          const ty = Math.cos(t * f.freqY + f.phase * 1.3) * f.ampY;
          gb.style.transform = `translateX(${tx.toFixed(2)}px) translateY(${ty.toFixed(2)}px)`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── Expand / Collapse ──────────────────────────────────────────────
  const expand = () => {
    if (expandedRef.current) return;
    dragRef.current = { active: false, lastX: 0, lastY: 0, rotX: 0, rotY: 0 };
    expandedRef.current = true;
    setExpanded(true);
  };

  const collapse = () => {
    if (!expandedRef.current) return;
    expandedRef.current = false;
    setExpanded(false);
  };

  // ── Portal drag (skip front face so scroll works) ──────────────────
  const handlePortalPointerDown = (e) => {
    if (e.target.closest(".wt-front")) return;
    dragRef.current.active = true;
    dragRef.current.lastX  = e.clientX;
    dragRef.current.lastY  = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.cursor = "grabbing";
  };

  const handlePortalPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.rotY += dx * 0.5;
    dragRef.current.rotX -= dy * 0.5;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
  };

  const handlePortalPointerUp = (e) => {
    dragRef.current.active = false;
    e.currentTarget.style.cursor = "grab";
  };

  return (
    <>
      {expanded && createPortal(
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(202,49,66,0.45)" }} />
          <button
            onClick={(e) => { e.stopPropagation(); collapse(); }}
            style={{
              position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 10000,
              background: "none", border: "none", color: "#fff",
              fontSize: "2rem", lineHeight: 1, cursor: "pointer", padding: "0.25rem 0.5rem",
            }}
            aria-label="Close"
          >×</button>

          {/* Full 3D box in portal */}
          <div style={{
            position: "fixed", top: "50%", left: "50%",
            width: "70vw", zIndex: 9999,
            perspective: "3000px", "--wt-depth": "260px",
            transform: "translate(-50%, -50%)",
          }}>
            <div
              ref={portalBoxRef}
              className="webgl-tile-box"
              style={{ height: BOX_HEIGHT, cursor: "grab", userSelect: "none", touchAction: "none" }}
              onPointerDown={handlePortalPointerDown}
              onPointerMove={handlePortalPointerMove}
              onPointerUp={handlePortalPointerUp}
              onPointerCancel={handlePortalPointerUp}
            >
              <div className="wt-face wt-front" style={{ height: BOX_HEIGHT, overflowY: "auto", touchAction: "pan-y" }}>
                <ProjectList projects={projects} />
              </div>
              <div className="wt-face wt-back" />
              <div className="wt-face wt-left">
                <div className="wt-left-content"><h3>Commercial Projects</h3></div>
              </div>
              <div className="wt-face wt-right">
                <div className="wt-right-content"><p className="wt-stack">[ scroll to browse ]</p></div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Grid state: plain scroll container, no 3D — avoids preserve-3d scroll breakage */}
      <div
        style={{
          height: BOX_HEIGHT,
          overflow: "hidden",
          cursor: "pointer",
          visibility: expanded ? "hidden" : undefined,
        }}
        onClick={expand}
      >
        <div
          ref={gridBoxRef}
          style={{ willChange: "transform", overflowY: "scroll", height: "100%" }}
        >
          <ProjectList projects={projects} />
        </div>
      </div>
    </>
  );
}
