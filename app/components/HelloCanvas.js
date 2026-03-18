"use client";

import { useEffect, useRef } from "react";

// ── Shaders ────────────────────────────────────────────────────────
const VERT = `
  attribute vec2 a_pos;
  attribute vec2 a_uv;
  varying vec2 v_uv;
  void main() {
    v_uv = a_uv;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

const FRAG = `
  precision mediump float;
  uniform sampler2D u_text;
  uniform vec2      u_mouse;
  uniform float     u_time;
  varying vec2      v_uv;

  void main() {
    vec2 m    = u_mouse * 0.5 + 0.5;
    float d   = distance(v_uv, m);
    float pull = 1.0 - smoothstep(0.0, 0.4, d);

    // Ripple wave centred on cursor
    float wave = sin(d * 30.0 - u_time * 5.0) * 0.010 * pull;
    vec2 uv = v_uv + vec2(wave, wave * 0.6);

    // Chromatic aberration near cursor
    float ca = pull * 0.013;
    float r  = texture2D(u_text, uv + vec2(ca,  0.0)).r;
    float g  = texture2D(u_text, uv               ).g;
    float b  = texture2D(u_text, uv - vec2(ca,  0.0)).b;
    float a  = texture2D(u_text, uv               ).a;

    gl_FragColor = vec4(r, g, b, a);
  }
`;

// ── Helpers ────────────────────────────────────────────────────────
function buildTextCanvas(text, w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "whitesmoke";
  ctx.font = `300 ${Math.floor(h * 0.68)}px 'Lato', sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, Math.floor(w * 0.02), h / 2);
  return c;
}

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

// ── Component ──────────────────────────────────────────────────────
export default function HelloCanvas() {
  const canvasRef = useRef(null);
  const mouseRef  = useRef([0.0, 0.0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = Math.round(canvas.offsetWidth * 0.20);
    };
    resize();

    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER,   VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);

    const positions = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
    const uvs       = new Float32Array([ 0, 1, 1, 1,  0,0,  0,0, 1, 1, 1,0]);

    const pb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pb);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const ub = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ub);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

    const aPos   = gl.getAttribLocation(prog, "a_pos");
    const aUv    = gl.getAttribLocation(prog, "a_uv");
    const uTex   = gl.getUniformLocation(prog, "u_text");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uTime  = gl.getUniformLocation(prog, "u_time");

    const uploadText = () => {
      const tc  = buildTextCanvas("HELLO", canvas.width, canvas.height);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tc);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      return tex;
    };

    let tex = uploadText();
    let raf;

    const render = () => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);

      gl.bindBuffer(gl.ARRAY_BUFFER, pb);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, ub);
      gl.enableVertexAttribArray(aUv);
      gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(uTex, 0);
      gl.uniform2f(uMouse, mouseRef.current[0], mouseRef.current[1]);
      gl.uniform1f(uTime,  performance.now() / 1000);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const onResize = () => {
      resize();
      gl.deleteTexture(tex);
      tex = uploadText();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      gl.deleteTexture(tex);
      gl.deleteProgram(prog);
    };
  }, []);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current = [
       ((e.clientX - rect.left) / rect.width)  * 2 - 1,
      -(((e.clientY - rect.top)  / rect.height) * 2 - 1),
    ];
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", display: "block" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseRef.current = [0, 0]; }}
    />
  );
}
