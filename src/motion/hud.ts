/** HUD 动效词汇：Decode 解码乱码 · Glitch 卡片故障 · Radar 战斗数据展开 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $$, finePointer, reducedMotion } from '../env'

gsap.registerPlugin(ScrollTrigger)

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>_=+'
const rand = () => GLYPHS[(Math.random() * GLYPHS.length) | 0]

/** 收集元素下所有非空文本节点，逐字乱码后按顺序还原 */
function decode(el: HTMLElement, duration = 0.7) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const nodes: { node: Text; text: string }[] = []
  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    if (node.textContent?.trim()) nodes.push({ node, text: (el as any).__decodeSrc?.get(node) ?? node.textContent })
  }
  // 记住原文，避免动画中途再次触发时把乱码当成原文
  const src: Map<Text, string> = ((el as any).__decodeSrc ??= new Map())
  for (const n of nodes) if (!src.has(n.node)) src.set(n.node, n.text)
  const total = nodes.reduce((s, n) => s + n.text.length, 0)
  const o = { p: 0 }
  gsap.killTweensOf((el as any).__decodeTween ?? {})
  ;(el as any).__decodeTween = o
  gsap.to(o, {
    p: 1,
    duration,
    ease: 'none',
    onUpdate: () => {
      let budget = Math.floor(o.p * total)
      for (const { node } of nodes) {
        const text = src.get(node)!
        let out = ''
        for (let i = 0; i < text.length; i++) {
          const c = text[i]
          // 只对拉丁字母/数字做乱码，中文保持原字避免宽度跳动
          if (budget > 0 || !/[A-Za-z0-9]/.test(c)) out += c
          else out += Math.random() < 0.5 ? rand() : c
          budget--
        }
        node.textContent = out
      }
    },
    onComplete: () => nodes.forEach(({ node }) => (node.textContent = src.get(node)!)),
  })
}

function decodes() {
  for (const el of $$('[data-decode]')) {
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => decode(el) })
  }
  if (!finePointer) return
  for (const el of $$('[data-decode-hover]')) {
    el.addEventListener('pointerenter', () => decode(el, 0.45))
  }
}

/** 卡片悬停：短促 RGB 分离故障 */
function glitch() {
  if (!finePointer) return
  for (const card of $$('.card')) {
    let t = 0
    card.addEventListener('pointerenter', () => {
      card.classList.remove('is-glitch')
      void card.offsetWidth
      card.classList.add('is-glitch')
      clearTimeout(t)
      t = window.setTimeout(() => card.classList.remove('is-glitch'), 420)
    })
  }
}

/** 雷达图：多边形自中心展开，数值计数 */
function radar() {
  const svg = document.querySelector('.radar')
  if (!svg) return
  const shape = svg.querySelector('.radar__shape')
  const dots = svg.querySelectorAll('.radar__dots circle')
  const vals = [...svg.querySelectorAll<SVGTSpanElement>('.radar__val')]
  const targets = vals.map((v) => Number(v.textContent))
  vals.forEach((v) => (v.textContent = '00'))
  const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 80%', once: true } })
  tl.from(svg.querySelectorAll('.radar__grid > *'), { autoAlpha: 0, duration: 0.6, stagger: 0.03 })
    .from(shape, { scale: 0, transformOrigin: '0px 0px', duration: 1.2, ease: 'expo.out' }, 0.2)
    .from(dots, { scale: 0, transformOrigin: 'center', transformBox: 'fill-box', duration: 0.5, ease: 'back.out(3)', stagger: 0.06 }, 0.6)
  vals.forEach((v, i) => {
    const o = { n: 0 }
    tl.to(o, { n: targets[i], duration: 1.2, ease: 'expo.out', onUpdate: () => (v.textContent = String(Math.round(o.n)).padStart(2, '0')) }, 0.3)
  })
}

export function initHud() {
  if (reducedMotion) return
  decodes()
  glitch()
  radar()
}
