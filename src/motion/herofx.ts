/**
 * Hero 主视觉（WebGL）：斜切光带 + 动漫速度线 + 光标光斑
 * 三条信号光带沿 -16° 斜向缓慢摆动，细密速度线沿光带方向流过；
 * 光标附近光带被「拨」向指针并点亮。暗色主题加色合成，亮色主题按正片叠底。
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
uniform float uDark;
uniform vec3 uBg;
uniform vec3 uFg;
uniform vec3 uA;
uniform vec3 uB;

float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }

// 一条斜向光带：中心 c、半宽 w，边缘带硬切 + 柔光晕
vec2 band(float y, float c, float w) {
  float d = abs(y - c);
  float core = 1.0 - smoothstep(w - 0.0025, w + 0.0025, d);
  float glow = exp(-d * d / (w * w * 9.0));
  return vec2(core, glow);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 uv = frag / uRes.y;           // 以高度归一，保持比例
  float aspect = uRes.x / uRes.y;
  float t = uTime;

  // 旋转到光带坐标系（-16°）
  float a = -0.28;
  mat2 R = mat2(cos(a), -sin(a), sin(a), cos(a));
  vec2 c = vec2(aspect * 0.62, 0.5);
  vec2 p = R * (uv - c);

  // 光标「拨动」：靠近指针的光带向指针弯曲
  vec2 m = R * (uMouse / uRes.y - c);
  float md = length(p - m);
  float pull = uMouseAmt * exp(-md * md * 9.0) * 0.06;
  float y = p.y + (m.y - p.y) * pull * 6.0 * smoothstep(0.6, 0.0, md);

  // 入场：光带从左向右「拉」出
  float reveal = smoothstep(-0.9 + uIntro * 2.6, -1.0 + uIntro * 2.6, p.x - 0.8);
  reveal = 1.0 - reveal;

  vec3 col = uBg;
  float lum = 0.0;

  // 三条光带：主橙（宽）· 细橙 · 青色细线
  vec2 b1 = band(y, -0.06 + sin(t * 0.22) * 0.035, 0.085 + sin(t * 0.31) * 0.012);
  vec2 b2 = band(y, 0.14 + sin(t * 0.17 + 1.3) * 0.03, 0.012);
  vec2 b3 = band(y, -0.22 + sin(t * 0.26 + 2.1) * 0.04, 0.004);

  // 光带沿 x 的明暗起伏：像扫描中的能量条
  float flow = 0.72 + 0.28 * sin(p.x * 5.0 - t * 1.2);
  // 主带内部的斜纹（警示胶带般的细切线）
  float hatch = step(0.5, fract((p.x + y) * 42.0 - t * 0.6)) * 0.18;

  // 速度线：按行散列，每行一段流动亮线
  float rowH = 0.0065;
  float row = floor(y / rowH);
  float rnd = hash(row);
  float on = step(0.82, rnd);
  float speed = 0.25 + hash(row + 7.0) * 0.9;
  float len = 0.08 + hash(row + 3.0) * 0.35;
  float xs = fract((p.x * 0.5 + t * speed * 0.18 + rnd * 9.0));
  float seg = smoothstep(0.0, len * 0.3, xs) * (1.0 - smoothstep(len * 0.3, len, xs));
  float lineY = 1.0 - smoothstep(0.0, uDpr / uRes.y * 1.2, abs(fract(y / rowH) - 0.5) * rowH);
  // 速度线集中在主光带附近
  float near = exp(-pow(y + 0.04, 2.0) * 14.0);
  float speedLines = on * seg * lineY * near * 0.55;

  // 大圆光晕（右侧）——给画面一个视觉重心
  vec2 q = uv - vec2(aspect * 0.78, 0.46);
  float halo = exp(-dot(q, q) * 4.5) * 0.35;

  // 光标光斑
  float spot = uMouseAmt * exp(-md * md * 28.0) * 0.5;

  vec3 add = vec3(0.0);
  add += uA * (b1.x * (0.78 + hatch) * flow + b1.y * 0.22);
  add += uA * (b2.x * 0.9 + b2.y * 0.12);
  add += uB * (b3.x * 1.0 + b3.y * 0.18);
  add += mix(uFg, uA, 0.35) * speedLines;
  add += uA * halo * 0.5 + uB * halo * 0.12;
  add += mix(uA, uFg, 0.4) * spot;

  // 文字安全带：顶部 meta 行、底部导语处减弱
  float yy = frag.y / uDpr;
  float hb = uRes.y / uDpr;
  float safe = mix(0.35, 1.0, smoothstep(110.0, 260.0, yy)) * mix(0.45, 1.0, smoothstep(hb - 80.0, hb - 300.0, yy));
  // 左侧渐隐，保证字标可读
  safe *= mix(0.25, 1.0, smoothstep(0.0, aspect * 0.55, uv.x));
  add *= safe * reveal;

  // 暗色：加色；亮色：把「光」转为油墨（正片叠底）
  vec3 dark = uBg + add;
  vec3 light = mix(uBg, uA, clamp(dot(add, vec3(0.5)), 0.0, 0.94));
  light = mix(light, uFg, clamp(speedLines * 0.8 + b3.x * 0.6, 0.0, 1.0) * safe * reveal);

  // 轻微暗角
  vec2 v = frag / uRes - 0.5;
  float vig = 1.0 - dot(v, v) * 0.55 * uDark;

  gl_FragColor = vec4(mix(light, dark, uDark) * vig, 1.0);
}
`

const hex = (v: string): [number, number, number] => {
  const m = v.trim().replace('#', '')
  const n = parseInt(m.length === 3 ? m.replace(/./g, '$&$&') : m, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export type HeroFx = { setIntro: (v: number) => void; refreshTheme: () => void; intro: { v: number } }

export function initHeroFx(canvas: HTMLCanvasElement): HeroFx | null {
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
    intro: u('uIntro'), dark: u('uDark'), bg: u('uBg'), fg: u('uFg'), a: u('uA'), b: u('uB'),
  }

  const state = { w: 0, h: 0, dpr: 1, mx: -9999, my: -9999, tx: -9999, ty: -9999, amt: 0, tAmt: 0, visible: true }
  const intro = { v: reducedMotion ? 1 : 0 }
  // 静态模式下给一个有构图的时间点
  const STILL = 6.0

  const refreshTheme = () => {
    const cs = getComputedStyle(document.documentElement)
    const dark = document.documentElement.dataset.theme !== 'light'
    gl.uniform3fv(U.bg, hex(cs.getPropertyValue('--raw-bg')))
    gl.uniform3fv(U.fg, hex(cs.getPropertyValue('--raw-fg')))
    gl.uniform3fv(U.a, hex(cs.getPropertyValue('--raw-accent')))
    gl.uniform3fv(U.b, hex(cs.getPropertyValue('--raw-accent-2')))
    gl.uniform1f(U.dark, dark ? 1 : 0)
    if (reducedMotion) draw(STILL)
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
    if (reducedMotion) draw(STILL)
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
      state.mx = lerp(state.mx, state.tx, 0.1)
      state.my = lerp(state.my, state.ty, 0.1)
      state.amt = lerp(state.amt, state.tAmt, 0.05)
      draw(STILL + (now - t0) / 1000)
    }
    requestAnimationFrame(loop)
  } else {
    draw(STILL)
  }

  return { intro, setIntro: (v) => (intro.v = v), refreshTheme }
}
