/**
 * Halftone 网点场（WebGL）
 * 两块色版：Signal 橙 45° / Overprint 蓝 15°，各自由流动噪声驱动网点大小，
 * 光标附近网点膨胀（Move to lift the ink），并带 2px 套准偏移。
 * 亮色主题按 multiply 叠印，暗房主题按 screen 叠加——直接在着色器内合成为不透明画面。
 */
import { reducedMotion, lerp } from '../env'

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseAmt;
uniform float uDpr;
uniform float uIntro;
uniform float uScreen;
uniform vec3 uPaper;
uniform vec3 uInkA;
uniform vec3 uInkB;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float field(vec2 p, float seed) {
  vec2 q = p / uRes.y;
  float t = uTime;
  float n = snoise(q * 1.25 + vec2(seed, t * 0.035)) * 0.62
          + snoise(q * 2.9 + vec2(-t * 0.05, seed * 1.7)) * 0.38;
  n = n * 0.5 + 0.5;
  // 构图：主体网点云偏右上，留出左下给正文
  vec2 c = vec2(uRes.x * 0.74, uRes.y * 0.38);
  float d = length((p - c) / uRes.y);
  float blob = smoothstep(0.92, 0.0, d);
  float v = smoothstep(0.32, 0.95, n) * blob;
  // 光标膨胀
  float md = length((p - uMouse) / uRes.y);
  v += uMouseAmt * smoothstep(0.3, 0.0, md) * 0.85;
  // 文字安全带：顶部 header + meta 行、底部提示行处网点渐隐（halftone fade）
  float y = p.y / uDpr;
  float hb = uRes.y / uDpr;
  v *= mix(0.06, 1.0, smoothstep(140.0, 320.0, y)) * mix(0.12, 1.0, smoothstep(hb - 60.0, hb - 260.0, y));
  // 入场：自右向左显影
  float reveal = smoothstep(uIntro * 1.6 - 0.4, uIntro * 1.6, 1.0 - p.x / uRes.x + 0.2);
  return clamp(v * (1.0 - reveal), 0.0, 1.0);
}

float plate(vec2 p, float ang, float cell, float seed) {
  mat2 r = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec2 rp = r * p;
  vec2 g = (floor(rp / cell) + 0.5) * cell;
  vec2 centre = g * r;
  float v = field(centre, seed);
  float rad = sqrt(v) * cell * 0.64;
  float d = length(rp - g);
  return 1.0 - smoothstep(rad - uDpr * 0.75, rad + uDpr * 0.75, d);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float a = plate(p, 0.7853982, 10.0 * uDpr, 3.1);
  float b = plate(p + vec2(2.0, -1.5) * uDpr, 0.2617994, 12.0 * uDpr, 7.9);
  vec3 mul = uPaper * mix(vec3(1.0), uInkA, a) * mix(vec3(1.0), uInkB, b * 0.92);
  vec3 scr = 1.0 - (1.0 - uPaper) * (1.0 - uInkA * a * 0.9) * (1.0 - uInkB * b * 0.8);
  gl_FragColor = vec4(mix(mul, scr, uScreen), 1.0);
}
`

const hex = (v: string): [number, number, number] => {
  const m = v.trim().replace('#', '')
  const n = parseInt(m.length === 3 ? m.replace(/./g, '$&$&') : m, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export type Halftone = { setIntro: (v: number) => void; refreshTheme: () => void; intro: { v: number } }

export function initHalftone(canvas: HTMLCanvasElement): Halftone | null {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'low-power' })
  if (!gl) {
    canvas.remove()
    return null
  }

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
    return s
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'aPos')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const u = (name: string) => gl.getUniformLocation(prog, name)
  const U = {
    res: u('uRes'), time: u('uTime'), mouse: u('uMouse'), mouseAmt: u('uMouseAmt'), dpr: u('uDpr'),
    intro: u('uIntro'), screen: u('uScreen'), paper: u('uPaper'), inkA: u('uInkA'), inkB: u('uInkB'),
  }

  const state = { w: 0, h: 0, dpr: 1, mx: -9999, my: -9999, tx: -9999, ty: -9999, amt: 0, tAmt: 0, visible: true }
  const intro = { v: reducedMotion ? 1 : 0 }

  const refreshTheme = () => {
    const cs = getComputedStyle(document.documentElement)
    const dark = document.documentElement.dataset.theme === 'dark'
    gl.uniform3fv(U.paper, hex(cs.getPropertyValue('--raw-paper')))
    gl.uniform3fv(U.inkA, hex(cs.getPropertyValue('--raw-signal')))
    gl.uniform3fv(U.inkB, hex(cs.getPropertyValue('--raw-overprint')))
    gl.uniform1f(U.screen, dark ? 1 : 0)
    if (reducedMotion) draw(0)
  }

  const resize = () => {
    const r = canvas.getBoundingClientRect()
    state.dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    state.w = Math.max(1, Math.round(r.width * state.dpr))
    state.h = Math.max(1, Math.round(r.height * state.dpr))
    canvas.width = state.w
    canvas.height = state.h
    gl.viewport(0, 0, state.w, state.h)
    gl.uniform2f(U.res, state.w, state.h)
    gl.uniform1f(U.dpr, state.dpr)
    if (reducedMotion) draw(0)
  }

  const draw = (t: number) => {
    gl.uniform1f(U.time, t)
    gl.uniform1f(U.intro, intro.v)
    gl.uniform2f(U.mouse, state.mx, state.my)
    gl.uniform1f(U.mouseAmt, state.amt)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  const hero = canvas.parentElement!
  hero.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect()
    state.tx = (e.clientX - r.left) * state.dpr
    state.ty = (e.clientY - r.top) * state.dpr
    if (state.mx < -999) {
      state.mx = state.tx
      state.my = state.ty
    }
    state.tAmt = 1
  })
  hero.addEventListener('pointerleave', () => (state.tAmt = 0))

  new IntersectionObserver(([e]) => (state.visible = e.isIntersecting)).observe(canvas)
  new ResizeObserver(resize).observe(canvas)
  resize()
  refreshTheme()

  if (!reducedMotion) {
    const t0 = performance.now()
    const loop = (now: number) => {
      requestAnimationFrame(loop)
      if (!state.visible || document.hidden) return
      state.mx = lerp(state.mx, state.tx, 0.12)
      state.my = lerp(state.my, state.ty, 0.12)
      state.amt = lerp(state.amt, state.tAmt, 0.06)
      draw((now - t0) / 1000)
    }
    requestAnimationFrame(loop)
  } else {
    draw(0)
  }

  return { intro, setIntro: (v) => (intro.v = v), refreshTheme }
}
