"use client";
import { useEffect, useRef } from "react";

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

// Videos applied to the 4 hexagonal faces (cycles through 3)
const VIDEO_SRCS = [
  "/videos/warstwyMandel_2LOOP.mp4",
  "/videos/zloty_mandel_loop.mp4",
  "/videos/warstwyMandel_1LOOP.mp4",
  "/videos/red_mandel_loop.mp4",
];

function cross(a, b) {
  return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
}
function sub(a, b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
function norm(v) {
  const l = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
  return [v[0]/l, v[1]/l, v[2]/l];
}

// Triangular faces — solid red (original colour)
function buildTriFaces() {
  const pos = [], nor = [], col = [];
  const triC = [202/255, 49/255, 66/255];
  TRI.forEach(([a, b, c]) => {
    const n = norm(cross(sub(V[b], V[a]), sub(V[c], V[a])));
    for (const v of [V[a], V[b], V[c]]) { pos.push(...v); nor.push(...n); col.push(...triC); }
  });
  return { pos: new Float32Array(pos), nor: new Float32Array(nor), col: new Float32Array(col), count: pos.length / 3 };
}

// Single hexagonal face — fan-triangulated with projected UV coords
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
// Solid colour (tri faces)
const FV = `
  attribute vec3 a_pos, a_nor, a_col;
  uniform mat4 u_mvp; uniform mat3 u_nm;
  uniform vec2 u_mouse; uniform float u_time, u_scroll;
  varying vec3 v_col; varying float v_l;
  void main() {
    vec3 mDir = normalize(vec3(u_mouse * 0.8, 0.8));
    // float align = dot(normalize(a_pos), mDir) * 0.5 + 0.5;
    // float pull = smoothstep(0.3, 1.0, align);
    // float amp = (0.07 + u_scroll * 0.05) * pull;
    // float wave = sin(length(a_pos) * 12.0 - u_time * 4.0) * amp;
    // vec3 disp = a_pos + a_nor * wave;
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

// Video texture (hex faces)
const TV = `
  attribute vec3 a_pos, a_nor; attribute vec2 a_uv;
  uniform mat4 u_mvp; uniform mat3 u_nm;
  uniform vec2 u_mouse; uniform float u_time, u_scroll;
  varying vec2 v_uv; varying float v_l; varying vec2 v_mouse; varying float v_time;
  void main() {
    vec3 mDir = normalize(vec3(u_mouse * 0.8, 0.8));
    // float align = dot(normalize(a_pos), mDir) * 0.5 + 0.5;
    // float pull = smoothstep(0.3, 1.0, align);
    // float amp = (0.07 + u_scroll * 0.05) * pull;
    // float wave = sin(length(a_pos) * 12.0 - u_time * 4.0) * amp;
    // vec3 disp = a_pos + a_nor * wave;
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

// Edges
const EV = `
  attribute vec3 a_pos;
  uniform mat4 u_mvp; uniform vec2 u_mouse; uniform float u_time, u_scroll;
  void main() {
    vec3 n = normalize(a_pos);
    vec3 mDir = normalize(vec3(u_mouse * 0.8, 0.8));
    // float align = dot(n, mDir) * 0.5 + 0.5;
    // float pull = smoothstep(0.3, 1.0, align);
    // float amp = (0.07 + u_scroll * 0.05) * pull;
    // float wave = sin(length(a_pos) * 12.0 - u_time * 4.0) * amp;
    // vec3 disp = a_pos + n * wave;
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

// ── Component ─────────────────────────────────────────────────────────
// Files to adjust this component:
//   app/components/TruncatedTetraCanvas.js  — shaders, geometry, animation params
//   app/globals.scss                        — .tetra-hero sizing / positioning
export default function TruncatedTetraCanvas() {
  const canvasRef = useRef(null);
  const mouseRef  = useRef([0, 0]);
  const scrollRef = useRef(0);

  useEffect(() => {
    const onScroll = () => { scrollRef.current = Math.min(window.scrollY / 800, 1); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => { const w = canvas.offsetWidth; canvas.width = w; canvas.height = w; };
    resize();
    window.addEventListener("resize", resize);

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

    // Tri face buffers (solid)
    const tpBuf = buf(triFaces.pos);
    const tnBuf = buf(triFaces.nor);
    const tcBuf = buf(triFaces.col);

    // Per-hex-face buffers
    const hexBufs = hexFaces.map(f => ({ pos: buf(f.pos), nor: buf(f.nor), uv: buf(f.uv) }));

    // Edge buffer
    const eBuf = buf(edgePts);

    // Video elements
    const videos = VIDEO_SRCS.map(src => {
      const v = document.createElement("video");
      v.src = src; v.autoplay = true; v.loop = true; v.muted = true; v.playsInline = true;
      v.play().catch(() => {});
      return v;
    });

    // Video textures — init with 1×1 black pixel
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
      // Upload current video frames
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

      const model = mul(rx(my * 0.4), ry(t * (0.4 + sc * 0.5) + mx * 0.6));
      const view  = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,-3.2,1]);
      const proj  = persp(Math.PI / 4, asp, 0.1, 100);
      const mvp   = mul(proj, mul(view, model));
      const nm    = nm3(model);

      // Tri faces — solid red
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

      // Hex faces — video textures
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

      // Edges
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
      window.removeEventListener("resize", resize);
      videos.forEach(v => { v.pause(); v.src = ""; });
    };
  }, []);

  const onMove = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    mouseRef.current = [
       ((e.clientX - r.left) / r.width  - 0.5) * 2,
      -((e.clientY - r.top)  / r.height - 0.5) * 2,
    ];
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "40%", aspectRatio: "1", display: "block", margin: "0 auto" }}
      onMouseMove={onMove}
      onMouseLeave={() => { mouseRef.current = [0, 0]; }}
    />
  );
}
