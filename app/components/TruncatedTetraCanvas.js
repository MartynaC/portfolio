"use client";
import { useEffect, useRef, useState } from "react";
import useIsMobile from "../hooks/useIsMobile";

// ── Geometry ─────────────────────────────────────────────────────────
const V = [
  [ 1/3,  1/3,   1],  // 0
  [ 1/3, -1/3,  -1],  // 1
  [-1/3,  1/3,  -1],  // 2
  [-1/3, -1/3,   1],  // 3
  [ 1/3,   1,  1/3],  // 4
  [ 1/3,  -1, -1/3],  // 5
  [-1/3,   1, -1/3],  // 6
  [-1/3,  -1,  1/3],  // 7
  [  1,  1/3,  1/3],  // 8
  [  1, -1/3, -1/3],  // 9
  [ -1,  1/3, -1/3],  // 10
  [ -1, -1/3,  1/3],  // 11
];

const TRI = [[8,4,0],[9,5,1],[10,6,2],[11,7,3]];
const HEX = [
  [3,7,5,9,8,0],
  [3,11,10,6,4,0],
  [9,1,2,6,4,8],
  [1,5,7,11,10,2],
]; 

const VIDEO_SRCS = [
  "https://media.martynachojnacka.com/videos/warstwyMandel_2LOOP.mp4",
  "https://media.martynachojnacka.com/videos/warstwyMandel_1LOOP.mp4",
  "https://media.martynachojnacka.com/videos/warstwyMandel_1LOOP.mp4",
  "https://media.martynachojnacka.com/videos/warstwyMandel_2LOOP.mp4",
];


function cross(a, b) {
  return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
}
function sub(a, b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
function norm(v) {
  const l = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
  return [v[0]/l, v[1]/l, v[2]/l];
}

function buildTriFaces() {
  const pos = [], nor = [], col = [];
  const triC = [202/255, 49/255, 66/255];
  TRI.forEach(([a, b, c]) => {
    const n = norm(cross(sub(V[b], V[a]), sub(V[c], V[a])));
    for (const v of [V[a], V[b], V[c]]) { pos.push(...v); nor.push(...n); col.push(...triC); }
  });
  return { pos: new Float32Array(pos), nor: new Float32Array(nor), col: new Float32Array(col), count: pos.length / 3 };
}

function buildHexFace(idxs) {
  const verts = idxs.map(i => V[i]);
  const n  = norm(cross(sub(verts[1], verts[0]), sub(verts[2], verts[0])));
  const t1 = norm(sub(verts[1], verts[0]));
  const t2 = cross(n, t1);

  const pts2d = verts.map(v => [
    v[0]*t1[0] + v[1]*t1[1] + v[2]*t1[2],
    v[0]*t2[0] + v[1]*t2[1] + v[2]*t2[2],
  ]);
  const us = pts2d.map(p => p[0]), vs = pts2d.map(p => p[1]);
  const minU = Math.min(...us), rangeU = Math.max(...us) - minU || 1;
  const minV = Math.min(...vs), rangeV = Math.max(...vs) - minV || 1;
  const uvs = pts2d.map(p => [(p[0]-minU)/rangeU, (p[1]-minV)/rangeV]);

  const pos = [], nor = [], uv = [];
  for (let i = 1; i < idxs.length - 1; i++) {
    for (const vi of [0, i, i+1]) {
      pos.push(...verts[vi]); nor.push(...n); uv.push(...uvs[vi]);
    }
  }
  return { pos: new Float32Array(pos), nor: new Float32Array(nor), uv: new Float32Array(uv), count: pos.length / 3 };
}

function buildEdges() {
  const seen = new Set(), pts = [];
  const tryEdge = (a, b) => {
    const k = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (seen.has(k)) return; seen.add(k);
    pts.push(...V[a], ...V[b]);
  };
  TRI.forEach(([a,b,c]) => { tryEdge(a,b); tryEdge(b,c); tryEdge(a,c); });
  HEX.forEach(f => f.forEach((v,i) => tryEdge(v, f[(i+1)%f.length])));
  return new Float32Array(pts);
}

// ── Shaders ───────────────────────────────────────────────────────────
const FV = `
  attribute vec3 a_pos, a_nor, a_col;
  uniform mat4 u_mvp; uniform mat3 u_nm;
  uniform vec2 u_mouse; uniform float u_time, u_scroll;
  varying vec3 v_col; varying float v_l;
  void main() {
    vec3 disp = a_pos;
    vec3 n = normalize(u_nm * a_nor);
    v_l = 0.35 + 0.65 * max(dot(n, normalize(vec3(1.0, 1.5, 2.0))), 0.0);
    v_col = a_col;
    gl_Position = u_mvp * vec4(disp, 1.0);
  }
`;
const FF = `
  precision mediump float;
  varying vec3 v_col; varying float v_l;
  void main() { gl_FragColor = vec4(v_col * v_l, 1.0); }
`;

const TV = `
  attribute vec3 a_pos, a_nor; attribute vec2 a_uv;
  uniform mat4 u_mvp; uniform mat3 u_nm;
  uniform vec2 u_mouse; uniform float u_time, u_scroll;
  varying vec2 v_uv; varying float v_l; varying vec2 v_mouse; varying float v_time;
  void main() {
    vec3 disp = a_pos;
    vec3 n = normalize(u_nm * a_nor);
    v_l = 0.35 + 0.65 * max(dot(n, normalize(vec3(1.0, 1.5, 2.0))), 0.0);
    v_uv = a_uv;
    v_mouse = u_mouse;
    v_time = u_time;
    gl_Position = u_mvp * vec4(disp, 1.0);
  }
`;
const TF = `
  precision mediump float;
  uniform sampler2D u_tex;
  varying vec2 v_uv; varying float v_l; varying vec2 v_mouse; varying float v_time;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  void main() {
    float strength = length(v_mouse) * 0.06;
    vec2 noiseCoord = v_uv * 6.0 + v_time * 0.4;
    float nx = noise(noiseCoord) * 2.0 - 1.0;
    float ny = noise(noiseCoord + vec2(5.2, 1.3)) * 2.0 - 1.0;
    vec2 uv = v_uv + vec2(nx, ny) * strength;
    vec4 c = texture2D(u_tex, uv);
    gl_FragColor = vec4(c.rgb * v_l, 1.0);
  }
`;

const EV = `
  attribute vec3 a_pos;
  uniform mat4 u_mvp; uniform vec2 u_mouse; uniform float u_time, u_scroll;
  void main() {
    vec3 disp = a_pos;
    gl_Position = u_mvp * vec4(disp, 1.0);
  }
`;
const EF = `precision mediump float; void main() { gl_FragColor = vec4(0.96, 0.96, 0.96, 0.55); }`;

// ── Matrix ────────────────────────────────────────────────────────────
const persp = (fov, asp, n, f) => {
  const t = 1/Math.tan(fov/2);
  return new Float32Array([t/asp,0,0,0, 0,t,0,0, 0,0,(f+n)/(n-f),-1, 0,0,2*f*n/(n-f),0]);
};
const rx = a => { const c=Math.cos(a),s=Math.sin(a); return new Float32Array([1,0,0,0, 0,c,-s,0, 0,s,c,0, 0,0,0,1]); };
const ry = a => { const c=Math.cos(a),s=Math.sin(a); return new Float32Array([c,0,s,0, 0,1,0,0, -s,0,c,0, 0,0,0,1]); };
const mul = (a,b) => {
  const r=new Float32Array(16);
  for(let i=0;i<4;i++) for(let j=0;j<4;j++){
    let s=0; for(let k=0;k<4;k++) s+=a[i+k*4]*b[k+j*4]; r[i+j*4]=s;
  }
  return r;
};
const nm3 = m => new Float32Array([m[0],m[1],m[2],m[4],m[5],m[6],m[8],m[9],m[10]]);

// ── Audio worklet source (as a blob URL) ─────────────────────────────
const WORKLET_CODE = `
class BrownNoiseProcessor extends AudioWorkletProcessor {
  constructor() { super(); this._lastOut = 0.0; }
  process(inputs, outputs) {
    const out = outputs[0][0];
    for (let i = 0; i < out.length; i++) {
      const white = Math.random() * 2 - 1;
      this._lastOut = (this._lastOut + 0.02 * white) / 1.02;
      out[i] = this._lastOut * 3.5;
    }
    return true;
  }
}
registerProcessor('brown-noise', BrownNoiseProcessor);
`;

// ── Haptics ───────────────────────────────────────────────────────────
const haptic = (ms) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(ms);
};

// ── Component ─────────────────────────────────────────────────────────
// Files to adjust this component:
//   app/components/TruncatedTetraCanvas.js  — shaders, geometry, animation params, audio
//   app/globals.scss                        — .tetra-hero sizing / positioning
//
// Audio mapping:
//   touch/mouse X  →  filter cutoff frequency  (left = deep ~80 Hz, right = bright ~2400 Hz)
//   touch/mouse Y  →  filter resonance / Q     (bottom = flat, top = resonant)
export default function TruncatedTetraCanvas() {
  const isMobile   = useIsMobile();
  const canvasRef  = useRef(null);
  const mouseRef   = useRef([0, 0]);
  const scrollRef  = useRef(0);
  const dragRef    = useRef({ active: false, lastX: 0, lastY: 0, rotX: 0, rotY: 0 });

  // Audio refs — kept stable across renders
  const audioRef   = useRef(null);   // { ctx, gain, filter, playing }
  const playingRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const onScroll = () => { scrollRef.current = Math.min(window.scrollY / 800, 1); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const stopNoise = () => {
      if (!playingRef.current || !audioRef.current) return;
      const { ctx, gain } = audioRef.current;
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      playingRef.current = false;
      setIsPlaying(false);
    };
    window.addEventListener("video-unmuted", stopNoise);
    return () => window.removeEventListener("video-unmuted", stopNoise);
  }, []);

  // ── Audio engine ────────────────────────────────────────────────────
  const setupAudio = async () => {
    if (audioRef.current) return; // already initialised

    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const blob = new Blob([WORKLET_CODE], { type: "application/javascript" });
    const url  = URL.createObjectURL(blob);
    await ctx.audioWorklet.addModule(url);
    URL.revokeObjectURL(url);

    const source = new AudioWorkletNode(ctx, "brown-noise");
    const filter = ctx.createBiquadFilter();
    const gain   = ctx.createGain();

    filter.type            = "lowpass";
    filter.frequency.value = 400;
    filter.Q.value         = 1;
    gain.gain.value        = 0; // start silent; fade in on play

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    audioRef.current = { ctx, source, filter, gain };
  };

  const togglePlay = async () => {
    await setupAudio();
    const { ctx, gain } = audioRef.current;
    if (ctx.state === "suspended") await ctx.resume();

    if (!playingRef.current) {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setTargetAtTime(0.6, ctx.currentTime, 0.1);
      playingRef.current = true;
      setIsPlaying(true);
      haptic(20);
    } else {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      playingRef.current = false;
      setIsPlaying(false);
      haptic(10);
    }
  };

  // Drive audio params from mouse position every animation frame
  const updateAudio = (mx, my) => {
    if (!audioRef.current || !playingRef.current) return;
    const { ctx, filter } = audioRef.current;

    // mx in [-1, 1]  →  cutoff 80 Hz … 2400 Hz  (log scale feels more natural)
    const t = (mx + 1) / 2;                         // 0 … 1
    const cutoff = 80 * Math.pow(2400 / 80, t);      // exponential sweep
    filter.frequency.setTargetAtTime(cutoff, ctx.currentTime, 0.05);

    // my in [-1, 1], top = 1  →  Q 0.5 … 8
    const q = 0.5 + ((my + 1) / 2) * 7.5;
    filter.Q.setTargetAtTime(q, ctx.currentTime, 0.05);
  };

  // ── WebGL render loop ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => { const w = canvas.offsetWidth; canvas.width = w; canvas.height = w; };
    resize();
    let resizeTimer;
    const debouncedResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); };
    window.addEventListener("resize", debouncedResize);

    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    const mkShader = (t, s) => { const sh=gl.createShader(t); gl.shaderSource(sh,s); gl.compileShader(sh); return sh; };
    const mkProg = (vs, fs) => { const p=gl.createProgram(); gl.attachShader(p,mkShader(gl.VERTEX_SHADER,vs)); gl.attachShader(p,mkShader(gl.FRAGMENT_SHADER,fs)); gl.linkProgram(p); return p; };

    const fProg = mkProg(FV, FF);
    const tProg = mkProg(TV, TF);
    const eProg = mkProg(EV, EF);

    const triFaces = buildTriFaces();
    const hexFaces = HEX.map(buildHexFace);
    const edgePts  = buildEdges();

    const buf = (data) => { const b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW); return b; };

    const tpBuf = buf(triFaces.pos);
    const tnBuf = buf(triFaces.nor);
    const tcBuf = buf(triFaces.col);
    const hexBufs = hexFaces.map(f => ({ pos: buf(f.pos), nor: buf(f.nor), uv: buf(f.uv) }));
    const eBuf = buf(edgePts);

    const videos = VIDEO_SRCS.map(src => {
      const v = document.createElement("video");
      v.crossOrigin = "anonymous";
      v.src = src; v.autoplay = true; v.loop = true; v.muted = true; v.playsInline = true;
      v.play().catch(() => {});
      return v;
    });

    const textures = videos.map(() => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return tex;
    });

    const setAttr = (prog, name, b, size) => {
      const loc = gl.getAttribLocation(prog, name);
      if (loc < 0) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };

    let raf;
    const render = () => {
      videos.forEach((v, i) => {
        if (v.readyState >= v.HAVE_CURRENT_DATA) {
          gl.bindTexture(gl.TEXTURE_2D, textures[i]);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v);
        }
      });

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      const t   = performance.now() / 1000;
      const [mx, my] = mouseRef.current;
      const sc  = scrollRef.current;
      const asp = canvas.width / (canvas.height || 1);
      const drag = dragRef.current;

      const rotX = drag.active ? drag.rotX : drag.rotX + my * 0.4;
      const rotY = drag.active ? drag.rotY : drag.rotY + t * (0.4 + sc * 0.5) + mx * 0.6;
      const model = mul(rx(rotX), ry(rotY));
      const view  = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,-3.2,1]);
      const proj  = persp(Math.PI / 4, asp, 0.1, 100);
      const mvp   = mul(proj, mul(view, model));
      const nm    = nm3(model);

      // Update audio params from current mouse position each frame
      updateAudio(mx, my);

      gl.useProgram(fProg);
      gl.uniformMatrix4fv(gl.getUniformLocation(fProg,"u_mvp"), false, mvp);
      gl.uniformMatrix3fv(gl.getUniformLocation(fProg,"u_nm"),  false, nm);
      gl.uniform2f(gl.getUniformLocation(fProg,"u_mouse"), mx, my);
      gl.uniform1f(gl.getUniformLocation(fProg,"u_time"),  t);
      gl.uniform1f(gl.getUniformLocation(fProg,"u_scroll"), sc);
      setAttr(fProg, "a_pos", tpBuf, 3);
      setAttr(fProg, "a_nor", tnBuf, 3);
      setAttr(fProg, "a_col", tcBuf, 3);
      gl.drawArrays(gl.TRIANGLES, 0, triFaces.count);

      gl.useProgram(tProg);
      gl.uniformMatrix4fv(gl.getUniformLocation(tProg,"u_mvp"), false, mvp);
      gl.uniformMatrix3fv(gl.getUniformLocation(tProg,"u_nm"),  false, nm);
      gl.uniform2f(gl.getUniformLocation(tProg,"u_mouse"), mx, my);
      gl.uniform1f(gl.getUniformLocation(tProg,"u_time"),  t);
      gl.uniform1f(gl.getUniformLocation(tProg,"u_scroll"), sc);
      gl.uniform1i(gl.getUniformLocation(tProg,"u_tex"), 0);
      gl.activeTexture(gl.TEXTURE0);

      hexBufs.forEach((b, i) => {
        gl.bindTexture(gl.TEXTURE_2D, textures[i % textures.length]);
        setAttr(tProg, "a_pos", b.pos, 3);
        setAttr(tProg, "a_nor", b.nor, 3);
        setAttr(tProg, "a_uv",  b.uv,  2);
        gl.drawArrays(gl.TRIANGLES, 0, hexFaces[i].count);
      });

      gl.useProgram(eProg);
      gl.uniformMatrix4fv(gl.getUniformLocation(eProg,"u_mvp"), false, mvp);
      gl.uniform2f(gl.getUniformLocation(eProg,"u_mouse"), mx, my);
      gl.uniform1f(gl.getUniformLocation(eProg,"u_time"),  t);
      gl.uniform1f(gl.getUniformLocation(eProg,"u_scroll"), sc);
      setAttr(eProg, "a_pos", eBuf, 3);
      gl.drawArrays(gl.LINES, 0, edgePts.length / 3);

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", debouncedResize);
      videos.forEach(v => { v.pause(); v.src = ""; });
    };
  }, []);

  // ── Pointer / mouse handlers ────────────────────────────────────────
  const onMove = (e) => {
    if (dragRef.current.active) return;
    const r = canvasRef.current.getBoundingClientRect();
    mouseRef.current = [
       ((e.clientX - r.left) / r.width  - 0.5) * 2,
      -((e.clientY - r.top)  / r.height - 0.5) * 2,
    ];
  };

  const onPointerDown = (e) => {
    dragRef.current.active = true;
    dragRef.current.lastX  = e.clientX;
    dragRef.current.lastY  = e.clientY;
    const t = performance.now() / 1000;
    const sc = scrollRef.current;
    dragRef.current.rotY += t * (0.4 + sc * 0.5);
    canvasRef.current.setPointerCapture(e.pointerId);
    canvasRef.current.style.cursor = "grabbing";
    haptic(15);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.rotY += dx * 0.01;
    dragRef.current.rotX -= dy * 0.01;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    // Map pointer position to audio during drag (works for both mouse and touch)
    const r = canvasRef.current.getBoundingClientRect();
    mouseRef.current = [
       ((e.clientX - r.left) / r.width  - 0.5) * 2,
      -((e.clientY - r.top)  / r.height - 0.5) * 2,
    ];
  };

  const onPointerUp = () => {
    if (!canvasRef.current) return;
    dragRef.current.active = false;
    const t = performance.now() / 1000;
    const sc = scrollRef.current;
    dragRef.current.rotY -= t * (0.4 + sc * 0.5);
    mouseRef.current = [0, 0];
    canvasRef.current.style.cursor = "grab";
    haptic(8);
  };

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", width: "100%" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "40%",
          aspectRatio: "1",
          display: "block",
          cursor: "grab",
          touchAction: "none",
          userSelect: "none",
        }}
        onMouseMove={onMove}
        onMouseLeave={() => { if (!dragRef.current.active) mouseRef.current = [0, 0]; }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />

      {/* Sound controls */}
      <div className="tetra-controls" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <button
          onClick={togglePlay}
          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, lineHeight: 1, display: "flex", alignItems: "center" }}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <line x1="5" y1="2" x2="5" y2="14"/>
              <line x1="11" y1="2" x2="11" y2="14"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="4,2 13,8 4,14" fill="none"/>
            </svg>
          )}
        </button>
        <span style={{ fontSize: "11px", opacity: 0.35, letterSpacing: "0.04em", paddingRight: "calc(var(--bs-gutter-x) * 0.5)" }}>
          {isMobile ? "drag to rotate & shape sound" : "move cursor to shape pitch & resonance"}
        </span>
      </div>
    </div>
  );
}