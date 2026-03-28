"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createArtTileEffect, PARAMS } from "../webgl/artTileEffect";
import useIsMobile from "../hooks/useIsMobile";

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
  const isMobile = useIsMobile();
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
  const visibleRef = useRef(false);
  const portalVideoRef = useRef(null);
  const [vidMuted, setVidMuted] = useState(true);
  const [vidProgress, setVidProgress] = useState(0);

  // ── Continuous animation loop — paused when off-screen ────────────
  useEffect(() => {
    const box     = boxRef.current;
    const wrapper = wrapperRef.current;
    if (!box || !wrapper) return;

    function tick() {
      if (!visibleRef.current) { rafRef.current = null; return; }

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
            pb.style.transform =
              `rotateX(${drag.rotX.toFixed(2)}deg) rotateY(${drag.rotY.toFixed(2)}deg)`;
          } else {
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !rafRef.current) {
          rafRef.current = requestAnimationFrame(tick);
        }
      },
      { rootMargin: "100px" }
    );
    observer.observe(wrapper);

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      observer.disconnect();
    };
  }, []);

  // ── WebGL (desktop only — skip on mobile to avoid context accumulation) ──
  const ensureEffect = async () => {
    if (isMobile) return;
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
    window.dispatchEvent(new CustomEvent("tile-modal", { detail: { open: true } }));
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
    window.dispatchEvent(new CustomEvent("tile-modal", { detail: { open: false } }));
  };

  const handleClick = (e) => {
    if (e.target.closest("a")) return;
    e.preventDefault();
    e.stopPropagation();
    expandedRef.current ? collapse() : expand();
  };

  useEffect(() => { return () => effectRef.current?.destroy(); }, []);

  useEffect(() => {
    const vid = portalVideoRef.current;
    if (!vid) return;
    const onTime = () => setVidProgress(vid.duration ? vid.currentTime / vid.duration : 0);
    vid.addEventListener("timeupdate", onTime);
    return () => vid.removeEventListener("timeupdate", onTime);
  }, [expanded]);

  const videoControls = (vid) => !vid || isEmbed(vid) ? null : (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", background: "rgba(0,0,0,0.45)", borderRadius: "4px" }}
    >
      <button
        onClick={() => {
          const el = portalVideoRef.current;
          if (!el) return;
          el.muted = !el.muted;
          setVidMuted(el.muted);
        }}
        style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1rem", padding: 0, lineHeight: 1 }}
      >
        {vidMuted ? "🔇" : "🔊"}
      </button>
      <input
        type="range" min="0" max="1" step="0.001"
        value={vidProgress}
        onChange={(e) => {
          const el = portalVideoRef.current;
          if (!el || !el.duration) return;
          el.currentTime = e.target.value * el.duration;
          setVidProgress(Number(e.target.value));
        }}
        style={{ flex: 1, accentColor: "#fff", cursor: "pointer" }}
      />
    </div>
  );

  const faces = (
    <>
      {/* Front face */}
      <div className="wt-face wt-front">
        {video && isEmbed(video) ? (
          <div style={{ position: "relative" }}>
            <img src={src} alt="" style={{ width: "100%", display: "block", visibility: "hidden" }} />
            <iframe src={video} allow="autoplay; fullscreen" frameBorder="0" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
          </div>
        ) : video && !isMobile ? (
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
          {role && <p>{role}</p>}
        </div>
      </div>

      {/* Right face */}
      <div className="wt-face wt-right">
        <div className="wt-right-content">
          {stack && <p className="wt-stack">&#91; {stack} &#93;</p>}
          {externalLink && <a href={externalLink} target="_blank" rel="noreferrer" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>{externalLink}</a>}
          {date && <p className="wt-date">{date}</p>}
        </div>
      </div>
    </>
  );

  return (
    <>
      {expanded && isMobile && createPortal(
        <div style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "#CA3142", overflowY: "auto",
        }}>
          {/* Header: title + X */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "1rem 1.25rem 0.75rem",
          }}>
            {title && <h3 style={{ margin: 0, color: "#fff", fontSize: "1rem", lineHeight: 1.3 }}>{title}</h3>}
            <button
              onClick={(e) => { e.stopPropagation(); collapse(); }}
              style={{
                background: "none", border: "none",
                color: "#fff", fontSize: "2rem",
                lineHeight: 1, cursor: "pointer",
                padding: "0 0.25rem", flexShrink: 0, marginLeft: "0.5rem",
              }}
              aria-label="Close"
            >×</button>
          </div>

          {/* Media */}
          {video && isEmbed(video) ? (
            <div style={{ position: "relative", margin: "0 1.25rem", paddingTop: "calc(56.25% - 2.5rem)" }}>
              <iframe
                src={video}
                allow="autoplay; fullscreen"
                allowFullScreen
                frameBorder="0"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
              />
            </div>
          ) : video ? (
            <div style={{ margin: "0 1.25rem" }}>
              <video
                ref={portalVideoRef}
                src={video}
                autoPlay
                muted
                loop
                playsInline
                style={{ width: "100%", display: "block" }}
              />
              {videoControls(video)}
            </div>
          ) : (
            <img src={gif || src} alt={alt || ""} style={{ width: "calc(100% - 2.5rem)", display: "block", margin: "0 1.25rem" }} />
          )}

          {/* Info */}
          <div style={{ padding: "1.25rem 1.25rem 5rem", color: "#fff" }}>
            {description && <p style={{ marginBottom: "0.75rem", opacity: 0.85 }}>{description}</p>}
            {stack && <p style={{ marginBottom: "0.5rem", opacity: 0.65, fontSize: "0.85em" }}>{stack}</p>}
            {role && <p style={{ marginBottom: "0.5rem", opacity: 0.65, fontSize: "0.85em" }}>{role}</p>}
            {date && <p style={{ marginBottom: "0.5rem", opacity: 0.5, fontSize: "0.8em" }}>{date}</p>}
            {externalLink && (
              <a href={externalLink} target="_blank" rel="noreferrer" style={{ color: "#fff", fontSize: "0.8em" }}>
                {externalLink}
              </a>
            )}
          </div>
        </div>,
        document.body
      )}

      {expanded && !isMobile && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={collapse}
            style={{
              position: "fixed", inset: 0,
              zIndex: 9998,
              background: "rgba(202,49,66,0.45)",
              cursor: "pointer",
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
            onClick={(e) => e.stopPropagation()}
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
            <div className="wt-face wt-front" style={{ position: "relative" }}>
              {video && isEmbed(video) ? (
                <div style={{ position: "relative", pointerEvents: "none" }}>
                  <img src={src} alt="" style={{ width: "100%", display: "block", visibility: "hidden" }} />
                  <iframe src={video} allow="autoplay; fullscreen" frameBorder="0" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, pointerEvents: "none" }} />
                </div>
              ) : video ? (
                <video ref={portalVideoRef} src={video} autoPlay muted loop playsInline style={{ width: "100%", display: "block", pointerEvents: "none" }} />
              ) : (
                <img src={gif || src} alt={alt || ""} style={{ width: "100%", display: "block", pointerEvents: "none" }} />
              )}
              {video && !isEmbed(video) && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
                  {videoControls(video)}
                </div>
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
                {externalLink && <a href={externalLink} target="_blank" rel="noreferrer" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>{externalLink}</a>}
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
