"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createArtTileEffect, PARAMS } from "../webgl/artTileEffect";

const isEmbed = (url) => url && (url.includes("vimeo.com") || url.includes("youtube.com") || url.includes("youtu.be"));

function makeFloat() {
  return {
    phase:     Math.random() * Math.PI * 2,
    freqX:     0.20 + Math.random() * 0.20,
    freqY:     0.16 + Math.random() * 0.18,
    freqZ:     0.10 + Math.random() * 0.14,
    ampX:      2    + Math.random() * 3,
    ampY:      2    + Math.random() * 3,
    ampZ:      10   + Math.random() * 14,
    baseZ:     14   + Math.random() * 14,
    rFreqX:    0.14 + Math.random() * 0.12,
    rFreqY:    0.11 + Math.random() * 0.10,
    rFreqZ:    0.07 + Math.random() * 0.06,
    rAmpX:     5    + Math.random() * 5,
    rAmpY:     8    + Math.random() * 6,
    rAmpZ:     1.5  + Math.random() * 2.5,
  };
}

export default function WebGLTile({ src, alt, className, style, title, description, stack, role, video, gif, externalLink, date }) {
  const wrapperRef   = useRef(null);
  const boxRef       = useRef(null);
  const portalBoxRef = useRef(null);
  const canvasRef    = useRef(null);
  const effectRef    = useRef(null);
  const floatRef     = useRef(makeFloat());
  const rafRef       = useRef(null);
  const hovering     = useRef(false);
  const hoverTilt    = useRef({ x: 0, y: 0 });
  const expandedRef  = useRef(false);
  const dragRef      = useRef({ active: false, lastX: 0, lastY: 0, rotX: 0, rotY: 0 });
  const [expanded, setExpanded] = useState(false);

  // ── Continuous animation loop ──────────────────────────────────────
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    function tick() {
      const f = floatRef.current;
      const t = performance.now() / 1000;

      const rx = Math.sin(t * f.rFreqX + f.phase * 0.9)  * f.rAmpX;
      const ry = Math.cos(t * f.rFreqY + f.phase * 1.1)  * f.rAmpY;
      const rz = Math.sin(t * f.rFreqZ + f.phase * 0.6)  * f.rAmpZ;

      if (expandedRef.current) {
        const pb = portalBoxRef.current;
        if (pb) {
          const drag = dragRef.current;
          if (drag.active) {
            // Pure drag control — suppress auto-rotation while dragging
            pb.style.transform =
              `rotateX(${drag.rotX.toFixed(2)}deg) rotateY(${drag.rotY.toFixed(2)}deg)`;
          } else {
            // Auto-rotation layered on top of accumulated drag position
            pb.style.transform =
              `rotateX(${(drag.rotX + rx).toFixed(2)}deg) rotateY(${(drag.rotY + ry).toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
          }
        }
      } else {
        const tx = Math.sin(t * f.freqX + f.phase)        * f.ampX;
        const ty = Math.cos(t * f.freqY + f.phase * 1.3)  * f.ampY;
        const tz = f.baseZ + Math.sin(t * f.freqZ + f.phase * 0.7) * f.ampZ;

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
    if (expandedRef.current) return;
    hovering.current = false;
    hoverTilt.current = { x: 0, y: 0 };
    effectRef.current?.stop();
    if (canvasRef.current) canvasRef.current.style.opacity = "0";
    dragRef.current = { active: false, lastX: 0, lastY: 0, rotX: 0, rotY: 0 };
    expandedRef.current = true;
    setExpanded(true);
  };

  // ── Portal drag-to-rotate ──────────────────────────────────────────
  const handlePortalPointerDown = (e) => {
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

  const collapse = () => {
    if (!expandedRef.current) return;
    expandedRef.current = false;
    setExpanded(false);
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    expandedRef.current ? collapse() : expand();
  };

  useEffect(() => { return () => effectRef.current?.destroy(); }, []);

  const faces = (
    <>
      {/* Front face */}
      <div className="wt-face wt-front">
        {video && isEmbed(video) ? (
          <div style={{ position: "relative" }}>
            <img src={src} alt="" style={{ width: "100%", display: "block", visibility: "hidden" }} />
            <iframe src={video} allow="autoplay; fullscreen" frameBorder="0" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
          </div>
        ) : video ? (
          <video src={video} autoPlay muted loop playsInline style={{ width: "100%", display: "block" }} />
        ) : (
          <>
            <img src={gif || src} alt={alt || ""} className={className} style={style} />
            <canvas ref={canvasRef} className="webgl-tile-canvas" />
          </>
        )}
      </div>

      {/* Back face */}
      <div className="wt-face wt-back">
        <img src={src} alt={alt || ""} draggable={false} />
      </div>

      {/* Left face */}
      <div className="wt-face wt-left">
        <div className="wt-left-content">
          {title && <h3>{title}</h3>}
          {description && <p>{description}</p>}
          {stack && <p>{stack}</p>}
          {role && <p>{role}</p>}
        </div>
      </div>

      {/* Right face */}
      <div className="wt-face wt-right">
        <div className="wt-right-content">
          {stack && <p className="wt-stack">&#91; {stack} &#93;</p>}
          {externalLink && <a href={externalLink} target="_blank" rel="noreferrer">{externalLink}</a>}
          {date && <p className="wt-date">{date}</p>}
        </div>
      </div>
    </>
  );

  return (
    <>
      {expanded && createPortal(
        <>
          {/* Backdrop */}
          <div
            style={{
              position: "fixed", inset: 0,
              zIndex: 9998,
              background: "rgba(202,49,66,0.45)",
            }}
          />

          {/* X close button */}
          <button
            onClick={(e) => { e.stopPropagation(); collapse(); }}
            style={{
              position: "fixed",
              top: "1.5rem",
              right: "1.5rem",
              zIndex: 10000,
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "2rem",
              lineHeight: 1,
              cursor: "pointer",
              padding: "0.25rem 0.5rem",
            }}
            aria-label="Close"
          >
            ×
          </button>

          {/* Expanded tile — fixed, centered, above everything */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              width: "70vw",
              zIndex: 9999,
              perspective: "3000px",
              "--wt-depth": "260px",
              transform: "translate(-50%, -50%)",
            }}
          >
          <div
            ref={portalBoxRef}
            className="webgl-tile-box"
            style={{ cursor: "grab", userSelect: "none", touchAction: "none" }}
            onPointerDown={handlePortalPointerDown}
            onPointerMove={handlePortalPointerMove}
            onPointerUp={handlePortalPointerUp}
            onPointerCancel={handlePortalPointerUp}
          >
            <div className="wt-face wt-front">
              {video && isEmbed(video) ? (
                <div style={{ position: "relative", pointerEvents: "none" }}>
                  <img src={src} alt="" style={{ width: "100%", display: "block", visibility: "hidden" }} />
                  <iframe src={video} allow="autoplay; fullscreen" frameBorder="0" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, pointerEvents: "none" }} />
                </div>
              ) : video ? (
                <video src={video} autoPlay muted loop playsInline style={{ width: "100%", display: "block", pointerEvents: "none" }} />
              ) : (
                <img src={gif || src} alt={alt || ""} draggable={false} style={{ width: "100%", display: "block", pointerEvents: "none" }} />
              )}
            </div>
            <div className="wt-face wt-back">
              <img src={src} alt={alt || ""} draggable={false} style={{ pointerEvents: "none" }} />
            </div>
            <div className="wt-face wt-left">
              <div className="wt-left-content">
                {title && <h3>{title}</h3>}
                {description && <p>{description}</p>}
                {stack && <p>{stack}</p>}
                {role && <p>{role}</p>}
              </div>
            </div>
            <div className="wt-face wt-right">
              <div className="wt-right-content">
                {stack && <p className="wt-stack">&#91; {stack} &#93;</p>}
                {externalLink && <a href={externalLink} target="_blank" rel="noreferrer">{externalLink}</a>}
                {date && <p className="wt-date">{date}</p>}
              </div>
            </div>
          </div>
          </div>
        </>,
        document.body
      )}

      {/* In-flow tile (hidden when expanded to preserve layout space) */}
      <div
        ref={wrapperRef}
        className="webgl-tile-wrapper"
        style={expanded ? { visibility: "hidden" } : undefined}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={boxRef} className="webgl-tile-box">
          {faces}
        </div>
      </div>
    </>
  );
}
