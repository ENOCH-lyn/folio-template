/**
 * 装备卡扇：色卡绕铆钉展开，悬停预览、点击锁定，左侧面板同步。
 * 所有卡片的角度/位移由「目标状态 → 每帧缓动」统一驱动，滚动展开与悬停不会互相打断；
 * 指针离开卡扇与列表后，回到锁定项（无锁定则回到均匀展开的静止态）。
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { tools } from '../content'
import { $, $$, finePointer, reducedMotion } from '../env'

gsap.registerPlugin(ScrollTrigger)

export function initToolkit() {
  const section = $('#toolkit')
  const fan = $('[data-fan]')
  const list = $('[data-tool-list]')
  const chips = $$('.chip', fan)
  const buttons = $$<HTMLButtonElement>('button', list)
  const panel = {
    code: $('[data-tool="code"]'),
    name: $('[data-tool="name"]'),
    use: $('[data-tool="use"]'),
    level: $('[data-tool="level"]'),
  }
  const bars = $$('i', panel.level)
  const n = chips.length
  let active = -1 // 当前抬起的卡（-1 = 静止态）
  let pinned = -1 // 点击锁定的卡
  let shown = -1 // 面板当前显示的卡
  let spread = reducedMotion ? 1 : 0 // 0 = 收拢，1 = 完全展开（滚动驱动）
  let range = Math.min(150, 12 * (n - 1))
  const PUSH = 9 // 抬起时两侧让开的角度
  const LIFT = 28

  // 每张卡的当前值，逐帧追赶目标值
  const cur = chips.map(() => ({ r: 0, y: 0 }))
  const setR = chips.map((c) => gsap.quickSetter(c, 'rotation', 'deg'))
  const setY = chips.map((c) => gsap.quickSetter(c, 'y', 'px'))

  const layout = () => {
    const w = fan.clientWidth
    const chipH = Math.min(440, Math.max(220, w * 0.56))
    const chipW = Math.round(chipH * 0.22)
    const pivot = Math.round(chipW * 0.36)
    fan.style.setProperty('--fan-chip-h', `${chipH}px`)
    fan.style.setProperty('--fan-chip-w', `${chipW}px`)
    fan.style.setProperty('--fan-pivot', `${pivot}px`)
    fan.style.setProperty('--fan-h', `${Math.round(chipH * 1.08)}px`)
    // 反推最大摆角：最外侧色卡顶角（含让位）不越出栏宽
    const r = chipH - pivot
    const half = chipW / 2
    const fit = Math.asin(Math.min(1, w / 2 / Math.hypot(r, half))) - Math.atan2(half, r)
    range = Math.min(150, 12 * (n - 1), 2 * ((fit * 180) / Math.PI - PUSH))
  }

  const target = (i: number) => {
    const base = -range / 2 + (range / (n - 1)) * i
    if (active < 0) return { r: base * spread, y: 0 }
    if (i === active) return { r: base * spread * 0.35, y: -LIFT * spread }
    return { r: (base + (i < active ? -PUSH : PUSH)) * spread, y: 0 }
  }

  const write = (instant: boolean) => {
    let moving = false
    chips.forEach((_, i) => {
      const t = target(i)
      const c = cur[i]
      if (instant) {
        c.r = t.r
        c.y = t.y
      } else {
        c.r += (t.r - c.r) * 0.16
        c.y += (t.y - c.y) * 0.16
        if (Math.abs(t.r - c.r) < 0.01 && Math.abs(t.y - c.y) < 0.05) {
          c.r = t.r
          c.y = t.y
        } else moving = true
      }
      setR[i](c.r)
      setY[i](c.y)
    })
    return moving
  }

  // 只在需要时跑 ticker：有运动时持续，静止后自动停
  let ticking = false
  const tick = () => {
    if (!write(false)) {
      gsap.ticker.remove(tick)
      ticking = false
    }
  }
  const kick = () => {
    if (reducedMotion) return write(true)
    if (!ticking) {
      ticking = true
      gsap.ticker.add(tick)
    }
  }

  const showPanel = (i: number) => {
    if (i === shown) return
    shown = i
    const t = tools[i]
    buttons.forEach((b, bi) => b.setAttribute('aria-pressed', String(bi === i)))
    panel.code.textContent = `${t.code} — ${String(i + 1).padStart(2, '0')}/${String(n).padStart(2, '0')}`
    panel.use.textContent = t.use
    panel.level.setAttribute('aria-label', `熟练度 ${t.level}/5`)
    bars.forEach((b, bi) => b.classList.toggle('is-on', bi < t.level))
    if (reducedMotion) {
      panel.name.textContent = t.name
      return
    }
    gsap.to(panel.name, {
      yPercent: -30,
      autoAlpha: 0,
      duration: 0.16,
      ease: 'power2.in',
      overwrite: true,
      onComplete: () => {
        panel.name.textContent = tools[shown].name
        gsap.fromTo(panel.name, { yPercent: 30, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: 'expo.out', overwrite: true })
      },
    })
  }

  const lift = (i: number) => {
    active = i
    chips.forEach((c, ci) => {
      c.classList.toggle('is-active', ci === i)
      c.classList.toggle('is-pinned', ci === pinned)
    })
    showPanel(i < 0 ? (pinned < 0 ? 0 : pinned) : i)
    kick()
  }

  const pin = (i: number) => {
    pinned = pinned === i ? -1 : i
    lift(pinned < 0 ? i : pinned)
  }

  // 悬停预览：离开整个装备区（卡扇 + 列表）才复位，避免两者之间移动时抖动
  let leaveTimer = 0
  const rest = () => {
    clearTimeout(leaveTimer)
    leaveTimer = window.setTimeout(() => lift(pinned), 120)
  }
  const hover = (i: number) => {
    clearTimeout(leaveTimer)
    if (i !== active) lift(i)
  }

  chips.forEach((c, i) => {
    if (finePointer) c.addEventListener('pointerenter', () => hover(i))
    c.addEventListener('click', () => pin(i))
  })
  buttons.forEach((b, i) => {
    b.addEventListener('click', () => pin(i))
    if (finePointer) b.addEventListener('pointerenter', () => hover(i))
    b.addEventListener('focus', () => hover(i))
    b.addEventListener('blur', rest)
  })
  if (finePointer) {
    fan.addEventListener('pointerleave', rest)
    list.addEventListener('pointerleave', rest)
  }
  // 触屏：点空白处取消锁定
  section.addEventListener('click', (e) => {
    if (!(e.target as Element).closest('.chip, [data-tool-list] button') && pinned >= 0) {
      pinned = -1
      lift(-1)
    }
  })

  layout()
  window.addEventListener('resize', () => {
    layout()
    write(true)
  })

  lift(-1)
  write(true)
  if (reducedMotion) return

  ScrollTrigger.create({
    trigger: fan,
    start: 'top 85%',
    end: 'center 55%',
    scrub: 0.6,
    onUpdate: (s) => {
      spread = gsap.parseEase('power2.out')(s.progress)
      kick()
    },
  })
}
