/** Hero 字标：撑满宽度（fit）+ 可变字体按光标距离「呼吸」 */
import { gsap } from 'gsap'
import { $, $$, clamp, finePointer, reducedMotion } from '../env'

type Char = { el: HTMLElement; cx: number; cy: number; w: number; wd: number }

/** 让文本恰好撑满容器宽度，写入 CSS 变量 */
export function fitText(el: HTMLElement, inner: HTMLElement, varName: string, base = 100) {
  const run = () => {
    el.style.setProperty(varName, `${base}px`)
    const avail = el.clientWidth - parseFloat(getComputedStyle(el).paddingLeft) - parseFloat(getComputedStyle(el).paddingRight)
    const w = inner.scrollWidth
    if (w > 0) el.style.setProperty(varName, `${(base * avail) / w}px`)
  }
  run()
  return run
}

export function initWordmark() {
  const wm = $('.wordmark')
  const lines = $$('.wordmark__line', wm)
  const hero = wm.closest<HTMLElement>('.hero')!
  const chars: Char[] = []

  // 宽度：以较长一行撑满；高度：首屏需同时容纳 meta、字标与底部导语
  const fit = () => {
    const longest = lines.reduce((a, b) => (b.textContent!.length > a.textContent!.length ? b : a))
    wm.style.setProperty('--wm-size', '100px')
    const range = document.createRange()
    range.selectNodeContents(longest)
    const w = range.getBoundingClientRect().width
    if (w > 0) {
      const byWidth = (100 * wm.clientWidth) / w
      const hs = getComputedStyle(hero)
      const ws = getComputedStyle(wm)
      const rest =
        parseFloat(hs.paddingTop) + parseFloat(hs.paddingBottom) + parseFloat(ws.marginTop) + parseFloat(ws.marginBottom) +
        $('.hero__meta', hero).offsetHeight + $('.hero__foot', hero).offsetHeight
      const byHeight = (100 * (window.innerHeight - rest)) / wm.offsetHeight
      // 视口过矮（横屏手机）时放弃高度约束，让 hero 自然增高
      wm.style.setProperty('--wm-size', `${byHeight < byWidth * 0.45 ? byWidth : Math.min(byWidth, byHeight)}px`)
    }
    measure()
  }

  const measure = () => {
    chars.length = 0
    for (const el of $$('.wordmark__char', wm)) {
      const r = el.getBoundingClientRect()
      chars.push({ el, cx: r.left + r.width / 2, cy: r.top + r.height / 2 + window.scrollY, w: 700, wd: 100 })
    }
  }

  fit()
  document.fonts?.ready.then(fit)
  let rid = 0
  window.addEventListener('resize', () => {
    cancelAnimationFrame(rid)
    rid = requestAnimationFrame(fit)
  })

  if (reducedMotion || !finePointer) return { fit }

  // 呼吸：越近字重越轻、字宽越窄，像油墨被「提起」
  let mx = -9999
  let my = -9999
  let active = false
  hero.addEventListener('pointermove', (e) => {
    mx = e.clientX
    my = e.clientY + window.scrollY
    active = true
  })
  hero.addEventListener('pointerleave', () => (active = false))

  const radius = () => Math.max(window.innerWidth * 0.22, 220)
  gsap.ticker.add(() => {
    if (!chars.length) return
    const R = radius()
    for (const c of chars) {
      let tw = 700
      let td = 100
      if (active) {
        const d = Math.hypot(mx - c.cx, (my - c.cy) * 1.4)
        const k = clamp(1 - d / R, 0, 1)
        const e = k * k * (3 - 2 * k)
        tw = 700 - e * 480
        td = 100 - e * 25
      }
      c.w += (tw - c.w) * 0.12
      c.wd += (td - c.wd) * 0.12
      c.el.style.fontVariationSettings = `'wght' ${c.w.toFixed(1)}, 'wdth' ${c.wd.toFixed(1)}`
    }
  })

  return { fit }
}
