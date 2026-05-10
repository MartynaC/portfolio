// ═══════════════════════════════════════════════════════════════════
//  THIS IS YOUR WEBGL PLAYGROUND
//  All shaders and visual parameters live here.
//  WebGLTile.js just wires up the canvas and mouse events.
// ═══════════════════════════════════════════════════════════════════

// ── TWEAK THESE TO CHANGE THE EFFECT ──────────────────────────────
export const PARAMS = {
  parallaxStrength: 0.4,  // depth of luminosity-driven parallax (0 = flat, 3 = dramatic)
  tiltDegrees:      164,   // max CSS perspective tilt in degrees
  specularPower:    0.30, // brightness of the moving highlight (0 = none, 1 = blinding)
  vignetteAmount:   0.38, // edge darkening (0 = none, 1 = heavy)
  lerpSpeed:        0.3, // mouse tracking smoothness (0.01 = slow drift, 1 = instant)
};

// ── VERTEX SHADER ─────────────────────────────────────────────────
// Full-screen quad passthrough. The 3D tilt is handled by CSS
// perspective on the container — no geometry needed here.
const VERT = `
  attribute vec2 a_pos;
  attribute vec2 a_uv;
  varying vec2 v_uv;

  void main() {
    v_uv = a_uv;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

// ── FRAGMENT SHADER ───────────────────────────────────────────────
// This is where all the visual work happens.
//
// u_mouse     current cursor position, normalized to -1..1
// u_parallax  parallax depth strength         (from PARAMS)
// u_spec      specular highlight intensity    (from PARAMS)
// u_vig       vignette edge darkening amount  (from PARAMS)
//
// HOW THE DEPTH EFFECT WORKS:
//   The shader treats luminosity as a depth value — brighter pixels
//   are assumed to be "closer". When the mouse moves, closer pixels
//   are offset more than darker ones, creating a parallax illusion
//   of real depth without any depth map asset.
//
// TO ADD NEW EFFECTS: write them between steps 3 and 5 below.

const FRAG = `
  precision mediump float;

  uniform sampler2D u_tex;
  uniform vec2      u_mouse;
  uniform float     u_parallax;
  uniform float     u_spec;
  uniform float     u_vig;

  varying vec2 v_uv;

  float luma(vec3 c) {
    return dot(c, vec3(0.299, 0.587, 0.114));
  }

  void main() {

    // 1. Read the pixel once to extract luminosity as depth.
    vec4 base   = texture2D(u_tex, v_uv);
    float depth = luma(base.rgb);

    // 2. Parallax shift: brighter (closer) pixels move more with the cursor.
    //    ← change the 0.025 multiplier for a subtler or wilder shift
    vec2 offset = u_mouse * depth * u_parallax * 0.025;
    vec2 uv     = clamp(v_uv - offset, 0.001, 0.999);
    vec4 color  = texture2D(u_tex, uv);

    // 3. Specular highlight — a hot spot that chases the cursor.
    //    ← change pow() exponent (6.0) for sharp/soft highlight
    //    ← change the 2.5 radius multiplier for a wide/tight spot
    vec2  lightUV = u_mouse * 0.5 + 0.5;
    float spec    = pow(max(0.0, 1.0 - distance(v_uv, lightUV) * 2.5), 6.0) * u_spec;

    // ── ADD EXTRA EFFECTS HERE ──────────────────────────────────
    // Examples:
    //   float scanline = step(0.5, fract(v_uv.y * 80.0)) * 0.05;
    //   color.rgb -= scanline;
    //
    float noise = fract(sin(dot(v_uv, vec2(12.9898,78.233))) * 43758.5);
    color.rgb += (noise - 0.5) * 0.03;
    // ────────────────────────────────────────────────────────────

    // 4. Vignette: darken edges to draw focus inward.
    //    ← change the 0.35 scale on vig for wider/tighter vignette
    vec2  vig      = (v_uv * 2.0 - 1.0) * u_vig;
    float vignette = clamp(1.0 - dot(vig, vig), 0.0, 1.0);

    // 5. Combine everything.
    gl_FragColor = vec4((color.rgb + spec) * vignette, color.a);
  }
`;

// ── INTERNAL WEBGL HELPERS ────────────────────────────────────────

function compileShader(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("WebGL shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("WebGL program link error:", gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

function toProxiedSrc(src) {
  if (!src || src.startsWith("/") || src.startsWith("data:")) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=75`;
}

function loadTexture(gl, src) {
  return new Promise((resolve) => {
    const tex = gl.createTexture();
    const img = new Image();
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      resolve(tex);
    };
    img.src = toProxiedSrc(src);
  });
}

// ── PUBLIC: createArtTileEffect ───────────────────────────────────
// Called once per tile (lazily on first hover).
// Returns a controller object with start / stop / setMouse / destroy.

export async function createArtTileEffect(canvas, imageSrc, params = PARAMS) {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
  if (!gl) return null;

  const prog = createProgram(gl);
  if (!prog) return null;

  // Full-screen quad: two triangles, UV origin at top-left.
  const positions = new Float32Array([-1, -1,  1, -1, -1,  1,  -1,  1,  1, -1,  1,  1]);
  const uvs       = new Float32Array([ 0,  1,  1,  1,  0,  0,   0,  0,  1,  1,  1,  0]);

  const posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const uvBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
  gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

  const aPos      = gl.getAttribLocation(prog, "a_pos");
  const aUv       = gl.getAttribLocation(prog, "a_uv");
  const uTex      = gl.getUniformLocation(prog, "u_tex");
  const uMouse    = gl.getUniformLocation(prog, "u_mouse");
  const uParallax = gl.getUniformLocation(prog, "u_parallax");
  const uSpec     = gl.getUniformLocation(prog, "u_spec");
  const uVig      = gl.getUniformLocation(prog, "u_vig");

  const texture = await loadTexture(gl, imageSrc);

  // Smoothed mouse state — lerped each frame toward target.
  let targetX = 0, targetY = 0;
  let mx = 0, my = 0;
  let raf = null;
  let running = false;

  function frame() {
    mx += (targetX - mx) * params.lerpSpeed;
    my += (targetY - my) * params.lerpSpeed;

    // Match canvas resolution to CSS size, capped to save GPU memory.
    const MAX = 512;
    const w = Math.min(canvas.offsetWidth,  MAX);
    const h = Math.min(canvas.offsetHeight, MAX);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
    }

    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uTex, 0);

    gl.uniform2f(uMouse,    mx, my);
    gl.uniform1f(uParallax, params.parallaxStrength);
    gl.uniform1f(uSpec,     params.specularPower);
    gl.uniform1f(uVig,      params.vignetteAmount);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (running) raf = requestAnimationFrame(frame);
  }

  return {
    setMouse(x, y) { targetX = x; targetY = y; },

    start() {
      running = true;
      if (!raf) frame();
    },

    stop() {
      running = false;
      // Ease mouse back to centre so the next hover starts neutral.
      targetX = 0;
      targetY = 0;
      // Let the lerp settle a few frames, then cancel.
      setTimeout(() => {
        if (!running) { cancelAnimationFrame(raf); raf = null; }
      }, 400);
    },

    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      gl.deleteTexture(texture);
      gl.deleteBuffer(posBuf);
      gl.deleteBuffer(uvBuf);
      gl.deleteProgram(prog);
    },
  };
}
