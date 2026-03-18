"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createArtTileEffect, PARAMS } from "../webgl/artTileEffect";

// Per-tile random parameters — each tile has its own orbit and rotation rhythm
const isEmbed = (url) => url && (url.includes("vimeo.com") || url.includes("youtube.com") || url.includes("youtu.be"));

function makeFloat() {
  return {
    phase:     Math.random() * Math.PI * 2,

    // XYZ position drift
    freqX:     0.20 + Math.random() * 0.20,
    freqY:     0.16 + Math.random() * 0.18,
    freqZ:     0.10 + Math.random() * 0.14,
    ampX:      2    + Math.random() * 3,
    ampY:      2    + Math.random() * 3,
    ampZ:      10   + Math.random() * 14,   // Z range in px
    baseZ:     14   + Math.random() * 14,   // resting depth 14–28px

    // Continuous rotation (all 3 axes)
    rFreqX:    0.14 + Math.random() * 0.12,
    rFreqY:    0.11 + Math.random() * 0.10,
    rFreqZ:    0.07 + Math.random() * 0.06,
    rAmpX:     5    + Math.random() * 5,    // degrees
    rAmpY:     8    + Math.random() * 6,    // degrees — reveals left/right walls
    rAmpZ:     1.5  + Math.random() * 2.5,  // subtle Z roll
  };
}

export default function WebGLTile({ src, alt, className, style, title, description, stack, role, video, gif, externalLink, date }) {
  const wrapperRef  = useRef(null);
  const boxRef      = useRef(null);
  const canvasRef   = useRef(null);
  const effectRef   = useRef(null);
  const floatRef    = useRef(makeFloat());
  const rafRef      = useRef(null);
  const hovering    = useRef(false);
  const hoverTilt   = useRef({ x: 0, y: 0 });
  const expandedRef = useRef(false);
  const [expanded, setExpanded] = useState(false);

  // ── Continuous animation loop ──────────────────────────────────────
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    function tick() {
      // Pause float when tile is expanded
      if (expandedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const f = floatRef.current;
      const t = performance.now() / 1000;

      const tx = Math.sin(t * f.freqX + f.phase)        * f.ampX;
      const ty = Math.cos(t * f.freqY + f.phase * 1.3)  * f.ampY;
      const tz = f.baseZ + Math.sin(t * f.freqZ + f.phase * 0.7) * f.ampZ;

      const rx = Math.sin(t * f.rFreqX + f.phase * 0.9)  * f.rAmpX;
      const ry = Math.cos(t * f.rFreqY + f.phase * 1.1)  * f.rAmpY;
      const rz = Math.sin(t * f.rFreqZ + f.phase * 0.6)  * f.rAmpZ;

      if (hovering.current) {
        const { x, y } = hoverTilt.current;
        box.style.transform =
          `translateX(${(tx * 0.25).toFixed(2)}px) translateY(${(ty * 0.25).toFixed(2)}px) translateZ(${tz.toFixed(2)}px)` +
          ` rotateX(${y.toFixed(2)}deg) rotateY(${x.toFixed(2)}deg) rotateZ(${(rz * 0.3).toFixed(2)}deg)`;
      } else {
        box.style.transform =
          `translateX(${tx.toFixed(2)}px) translateY(${ty.toFixed(2)}px) translateZ(${tz.toFixed(2)}px)` +
          ` rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── WebGL ──────────────────────────────────────────────────────────
  const ensureEffect = async () => {
    if (effectRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas || !src) return;
    effectRef.current = await createArtTileEffect(canvas, src, PARAMS);
  };

  const handleMouseEnter = async () => {
    if (expandedRef.current) return;
    hovering.current = true;
    await ensureEffect();
    if (!effectRef.current) return;
    effectRef.current.start();
    canvasRef.current.style.opacity = "1";
  };

  const handleMouseMove = (e) => {
    if (expandedRef.current) return;
    const rect  = wrapperRef.current.getBoundingClientRect();
    const normX =  ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    const normY = -((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    effectRef.current?.setMouse(normX, normY);
    const tilt = PARAMS.tiltDegrees;
    hoverTilt.current = { x: normX * tilt, y: normY * tilt };
  };

  const handleMouseLeave = () => {
    if (expandedRef.current) return;
    hovering.current = false;
    hoverTilt.current = { x: 0, y: 0 };
    effectRef.current?.stop();
    if (canvasRef.current) canvasRef.current.style.opacity = "0";
  };

  // ── Expand / Collapse ──────────────────────────────────────────────
  const expand = () => {
    const wrapper = wrapperRef.current;
    const box     = boxRef.current;
    if (!wrapper || !box || expandedRef.current) return;

    const rect  = wrapper.getBoundingClientRect();
    const scale = Math.min(
      (window.innerWidth  * 0.7) / rect.width,
      (window.innerHeight * 0.7) / rect.height,
    );
    const dx = window.innerWidth  / 2 - (rect.left + rect.width  / 2);
    const dy = window.innerHeight / 2 - (rect.top  + rect.height / 2);

    hovering.current = false;
    hoverTilt.current = { x: 0, y: 0 };
    if (effectRef.current) {
      effectRef.current.stop();
      if (canvasRef.current) canvasRef.current.style.opacity = "0";
    }

    expandedRef.current = true;
    setExpanded(true);

    box.style.transition = "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    box.style.transform  = `translateX(${dx}px) translateY(${dy}px) scale(${scale}) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
    setTimeout(() => { if (box) box.style.transition = ""; }, 450);
  };

  const collapse = () => {
    const box = boxRef.current;
    if (!box || !expandedRef.current) return;

    expandedRef.current = false;
    setExpanded(false);

    box.style.transition = "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    setTimeout(() => { if (box) box.style.transition = ""; }, 350);
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    expandedRef.current ? collapse() : expand();
  };

  useEffect(() => { return () => effectRef.current?.destroy(); }, []);

  return (
    <>
      {expanded && createPortal(
        <div
          style={{
            position: "fixed", inset: 0,
            zIndex: 9998,
            background: "rgba(0,0,0,0.6)",
            cursor: "pointer",
          }}
          onClick={collapse}
        />,
        document.body
      )}

      <div
        ref={wrapperRef}
        className="webgl-tile-wrapper"
        style={expanded ? { position: "relative", zIndex: 9999 } : undefined}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={boxRef} className="webgl-tile-box">

          {/* Front face — video/embed if available, else image + WebGL canvas */}
          <div className="wt-face wt-front">
            {video && isEmbed(video) ? (
              <div style={{ position: "relative" }}>
                <img src={src} alt="" style={{ width: "100%", display: "block", visibility: "hidden" }} />
                <iframe src={video} allow="autoplay; fullscreen" frameBorder="0" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
              </div>
            ) : video ? (
              <video src={video} autoPlay muted loop playsInline className={className} style={style} />
            ) : (
              <>
                <img src={gif || src} alt={alt || ""} className={className} style={style} />
                <canvas ref={canvasRef} className="webgl-tile-canvas" />
              </>
            )}
          </div>

          {/* Back face — always the static image */}
          <div className="wt-face wt-back">
            <img src={src} alt={alt || ""} />
          </div>

          {/* Left face — project description */}
          <div className="wt-face wt-left">
            <div className="wt-left-content">
              {title && <h3>{title}</h3>}
              {description && <p>{description}</p>}
              {stack && <p>{stack}</p>}
              {role && <p>{role}</p>}
            </div>
          </div>

          {/* Right face — project data */}
          <div className="wt-face wt-right">
            <div className="wt-right-content">
              {stack && <p className="wt-stack">&#91; {stack} &#93;</p>}
              {externalLink && <a href={externalLink} target="_blank" rel="noreferrer">{externalLink}</a>}
              {date && <p className="wt-date">{date}</p>}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
