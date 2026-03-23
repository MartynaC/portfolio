"use client";

import { useEffect, useRef } from "react";

// ── Shared scroll velocity ─────────────────────────────────────────
let _vel = 0, _lastY = 0, _decayT = null, _refCount = 0;

function _onScroll() {
  const y = window.scrollY;
  _vel = y - _lastY;
  _lastY = y;
  clearTimeout(_decayT);
  _decayT = setTimeout(() => { _vel = 0; }, 120);
}

function subscribeScroll() {
  if (_refCount === 0) { _lastY = window.scrollY; window.addEventListener("scroll", _onScroll, { passive: true }); }
  _refCount++;
}

function unsubscribeScroll() {
  if (--_refCount === 0) window.removeEventListener("scroll", _onScroll);
}

// ── GLSL ──────────────────────────────────────────────────────────
const VERT = `#version 300 es
layout(location=0) in vec2 aUV;
uniform sampler2D uDispMap;
uniform float uDispFactor;
out vec2 vUV;
void main() {
  float s = 1.0 / 64.0;
  float l = textureLod(uDispMap, aUV + vec2(-s, 0.0), 0.0).r;
  float r = textureLod(uDispMap, aUV + vec2( s, 0.0), 0.0).r;
  float u = textureLod(uDispMap, aUV + vec2(0.0, -s), 0.0).r;
  float d = textureLod(uDispMap, aUV + vec2(0.0,  s), 0.0).r;
  vec2 grad = vec2(r - l, d - u);
  vec2 pos = vec2(aUV.x * 2.0 - 1.0, 1.0 - aUV.y * 2.0);
  pos += grad * uDispFactor * 0.008;
  gl_Position = vec4(pos, 0.0, 1.0);
  vUV = aUV;
}`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uSurface;
in vec2 vUV;
out vec4 fColor;
void main() { fColor = texture(uSurface, vUV); }`;

// ── Mesh ──────────────────────────────────────────────────────────
function buildPlane(segs) {
  const n = segs + 1;
  const uv = new Float32Array(n * n * 2);
  const idx = new Uint16Array(segs * segs * 6);
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) { uv[(r * n + c) * 2] = c / segs; uv[(r * n + c) * 2 + 1] = r / segs; }
  let ii = 0;
  for (let r = 0; r < segs; r++)
    for (let c = 0; c < segs; c++) {
      const i = r * n + c;
      idx[ii++]=i; idx[ii++]=i+n; idx[ii++]=i+1; idx[ii++]=i+1; idx[ii++]=i+n; idx[ii++]=i+n+1;
    }
  return { uv, idx };
}

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
  return s;
}

// ── Component ─────────────────────────────────────────────────────
export default function WebGLDisplacedImage({ src, alt }) {
  const canvasRef = useRef(null);
  const imgRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const imgEl  = imgRef.current;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "low-power" });
    if (!gl) return;

    // Program
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);

    // Mesh
    const plane  = buildPlane(64);
    const vao    = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const uvBuf  = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, plane.uv, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, plane.idx, gl.STATIC_DRAW);
    gl.bindVertexArray(null);

    // Texture (no mipmaps — updated every frame for gif support)
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Uniforms
    gl.useProgram(prog);
    gl.uniform1i(gl.getUniformLocation(prog, "uSurface"), 0);
    gl.uniform1i(gl.getUniformLocation(prog, "uDispMap"), 1);
    const locDisp = gl.getUniformLocation(prog, "uDispFactor");

    let rafId = null;
    let started = false;

    function startRender() {
      if (started) return;
      started = true;
      subscribeScroll();

      function draw() {
        const w = canvas.clientWidth  | 0;
        const h = canvas.clientHeight | 0;
        if (w === 0 || h === 0) { rafId = requestAnimationFrame(draw); return; }
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }

        // Upload current img frame (captures animated gif frames)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgEl);

        gl.viewport(0, 0, w, h);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(prog);
        gl.uniform1f(locDisp, Math.min(Math.abs(_vel) * 2.5, 15));

        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex);

        gl.bindVertexArray(vao);
        gl.drawElements(gl.TRIANGLES, plane.idx.length, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);

        rafId = requestAnimationFrame(draw);
      }
      rafId = requestAnimationFrame(draw);
    }

    if (imgEl.complete && imgEl.naturalWidth > 0) {
      startRender();
    } else {
      imgEl.addEventListener("load", startRender);
    }

    return () => {
      imgEl.removeEventListener("load", startRender);
      cancelAnimationFrame(rafId);
      if (started) unsubscribeScroll();
      gl.deleteTexture(tex);
      gl.deleteBuffer(uvBuf);
      gl.deleteBuffer(idxBuf);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(prog);
    };
  }, [src]);

  return (
    <div style={{ position: "relative", lineHeight: 0, display: "block" }}>
      <img
        ref={imgRef}
        src={src}
        alt={alt || ""}
        style={{ display: "block", width: "100%", visibility: "hidden" }}
        aria-hidden="true"
      />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
