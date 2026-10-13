/** Hero 主视觉窗口：轮播精选作品封面（斜切擦除 + 推近），右下进度条同步，滚出首屏时暂停 */
import { gsap } from 'gsap'
import { projects } from '../content'
import { $, $$, h, pad, reducedMotion } from '../env'

const HOLD = 5 // 每张停留秒数

export type Kv = { enter: () => gsap.core.Timeline | null }

export function initKv(): Kv {
  const root = $('[data-kv]')
  const frame = $('.kv__frame', root)
  const slides = $('.kv__slides', root)
  const bars = $('.kv__bars', root)
  const label = $('[data-kv-label]', root)
  const title = $('[data-kv-title]', root)
  const index = $('[data-kv-index]', root)
  // 优先 SSR，其次按顺序，取 3 张
  const picks = [...projects].sort((a, b) => Number(b.rank === 'SSR') - Number(a.rank === 'SSR')).slice(0, 3)
  $('[data-kv-total]', root).textContent = pad(picks.length)

  const imgs = picks.map((p, i) =>
    slides.appendChild(h('img', { src: p.cover, alt: '', decoding: 'async', loading: i ? 'lazy' : 'eager', fetchpriority: i ? 'auto' : 'high' })),
  )
  const fills = picks.map(() => bars.appendChild(h('span', null, h('i'))).firstElementChild as HTMLElement)

  let cur = 0
  const show = (i: number, instant = false) => {
    const p = picks[i]
    label.textContent = p.disciplineEn
    title.textContent = p.title
    index.textContent = pad(i + 1)
    imgs.forEach((img, k) => (img.style.zIndex = k === i ? '2' : k === cur ? '1' : '0'))
    fills.forEach((f, k) => gsap.set(f, { scaleX: k < i ? 1 : 0 }))
    if (instant || reducedMotion) {
      imgs.forEach((img, k) => gsap.set(img, { autoAlpha: k === i ? 1 : 0, clipPath: 'none' }))
    } else {
      const prev = imgs[cur]
      gsap.set(imgs[i], { autoAlpha: 1 })
      gsap.fromTo(
        imgs[i],
        { clipPath: 'polygon(115% 0%, 115% 0%, 100% 100%, 100% 100%)', scale: 1.18 },
        { clipPath: 'polygon(-15% 0%, 115% 0%, 100% 100%, 0% 100%)', scale: 1.04, duration: 1.1, ease: 'expo.inOut', overwrite: true,
          onComplete: () => { if (prev !== imgs[i]) gsap.set(prev, { autoAlpha: 0 }) } },
      )
      gsap.fromTo([label, title], { autoAlpha: 0, x: 16 }, { autoAlpha: 1, x: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06, delay: 0.35 })
    }
    cur = i
  }

  show(0, true)
  if (reducedMotion) return { enter: () => null }

  // 慢速推近 + 进度条：由同一条时间线驱动，便于暂停
  let cycle: gsap.core.Timeline | null = null
  const run = () => {
    cycle?.kill()
    cycle = gsap.timeline({ onComplete: () => { show((cur + 1) % picks.length); run() } })
    cycle.fromTo(fills[cur], { scaleX: 0 }, { scaleX: 1, duration: HOLD, ease: 'none' }, 0)
    cycle.to(imgs[cur], { scale: 1, duration: HOLD, ease: 'none' }, 0)
  }
  new IntersectionObserver(([e]) => cycle && (e.isIntersecting ? cycle.resume() : cycle.pause())).observe(root)

  return {
    enter: () => {
      gsap.set(frame, { clipPath: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)' })
      gsap.set($$('.kv__hud, .kv__bars, .kv__title', root), { autoAlpha: 0 })
      const tl = gsap.timeline({ onComplete: run })
      tl.to(frame, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 1.1, ease: 'expo.inOut', clearProps: 'clipPath' })
        .fromTo(imgs[0], { scale: 1.25 }, { scale: 1.04, duration: 1.6, ease: 'expo.out' }, 0.1)
        .to($$('.kv__hud, .kv__bars, .kv__title', root), { autoAlpha: 1, duration: 0.5, stagger: 0.08 }, 0.7)
      return tl
    },
  }
}
