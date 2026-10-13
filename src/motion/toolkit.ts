/** 工具色卡扇：色卡绕铆钉展开，悬停/点击选中，左侧面板同步 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { tools } from '../content'
import { $, $$, finePointer, reducedMotion } from '../env'

gsap.registerPlugin(ScrollTrigger)

export function initToolkit() {
  const fan = $('[data-fan]')
  const chips = $$('.chip', fan)
  const buttons = $$<HTMLButtonElement>('[data-tool-list] button')
  const panel = {
    code: $('[data-tool="code"]'),
    name: $('[data-tool="name"]'),
    use: $('[data-tool="use"]'),
    level: $('[data-tool="level"]'),
  }
  const bars = $$('i', panel.level)
  const n = chips.length
  let active = -1
  let spread = 0 // 0 = 收拢，1 = 完全展开（由滚动驱动）
  let range = Math.min(150, 12 * (n - 1))
  const PUSH = 9 // 选中时两侧色卡让开的角度

  // 尺寸随容器响应
  const layout = () => {
    const w = fan.clientWidth
    const chipH = Math.min(440, Math.max(220, w * 0.56))
    const chipW = Math.round(chipH * 0.22)
    const pivot = Math.round(chipW * 0.36)
    fan.style.setProperty('--fan-chip-h', `${chipH}px`)
    fan.style.setProperty('--fan-chip-w', `${chipW}px`)
    fan.style.setProperty('--fan-pivot', `${pivot}px`)
    fan.style.setProperty('--fan-h', `${Math.round(chipH * 1.08)}px`)
    // 反推最大摆角：最外侧色卡顶角（含让位）不越出栏宽，不压页边距
    const r = chipH - pivot
    const half = chipW / 2
    const fit = Math.asin(Math.min(1, w / 2 / Math.hypot(r, half))) - Math.atan2(half, r)
    range = Math.min(150, 12 * (n - 1), 2 * ((fit * 180) / Math.PI - PUSH))
  }

  const angleOf = (i: number) => {
    const base = -range / 2 + (range / (n - 1)) * i
    if (active < 0) return base * spread
    // 选中卡片立起，其余向两侧让开
    if (i === active) return base * spread * 0.35
    const push = i < active ? -PUSH : PUSH
    return (base + push) * spread
  }

  const apply = (instant = false) => {
    chips.forEach((c, i) => {
      gsap.to(c, {
        rotation: angleOf(i),
        y: i === active ? -28 : 0,
        duration: instant ? 0 : 0.9,
        ease: 'expo.out',
        overwrite: 'auto',
      })
    })
  }

  const select = (i: number) => {
    if (i === active) return
    active = i
    const t = tools[i]
    chips.forEach((c, ci) => c.classList.toggle('is-active', ci === i))
    buttons.forEach((b, bi) => b.setAttribute('aria-pressed', String(bi === i)))
    panel.code.textContent = `${t.code} — ${String(i + 1).padStart(2, '0')}/${String(n).padStart(2, '0')}`
    panel.use.textContent = t.use
    panel.level.setAttribute('aria-label', `Proficiency ${t.level} of 5`)
    bars.forEach((b, bi) => b.classList.toggle('is-on', bi < t.level))
    if (reducedMotion) panel.name.textContent = t.name
    else {
      gsap.to(panel.name, {
        yPercent: -30,
        autoAlpha: 0,
        duration: 0.18,
        ease: 'power2.in',
        overwrite: true,
        onComplete: () => {
          panel.name.textContent = t.name
          gsap.fromTo(panel.name, { yPercent: 30, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'expo.out' })
        },
      })
    }
    apply()
  }

  layout()
  window.addEventListener('resize', () => {
    layout()
    apply(true)
  })

  chips.forEach((c, i) => {
    if (finePointer) c.addEventListener('pointerenter', () => select(i))
    c.addEventListener('click', () => select(i))
  })
  buttons.forEach((b, i) => {
    b.addEventListener('click', () => select(i))
    if (finePointer) b.addEventListener('pointerenter', () => select(i))
  })

  select(0)

  if (reducedMotion) {
    spread = 1
    apply(true)
    return
  }
  // 滚动驱动展开：像把色卡从手里摊开
  apply(true)
  ScrollTrigger.create({
    trigger: fan,
    start: 'top 85%',
    end: 'center 55%',
    scrub: 0.6,
    onUpdate: (s) => {
      spread = gsap.parseEase('power2.out')(s.progress)
      apply(true)
    },
  })
}
