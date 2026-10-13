/** 预加载「系统启动」→ 斜切色带擦除 → Hero 入场。返回 Promise，在入场开始时 resolve */
import { gsap } from 'gsap'
import { $, $$, pad, reducedMotion } from '../env'
import type { HeroFx } from './herofx'
import type { Kv } from './kv'

/** 等待图片加载，带超时：图片慢也不卡住开场 */
function waitImages(imgs: HTMLImageElement[], onProgress: (p: number) => void, timeout = 2500) {
  let done = 0
  const total = imgs.length || 1
  return Promise.race([
    Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((res) => {
            const fin = () => {
              done++
              onProgress(done / total)
              res()
            }
            if (img.complete) fin()
            else {
              img.addEventListener('load', fin, { once: true })
              img.addEventListener('error', fin, { once: true })
            }
          }),
      ),
    ),
    new Promise<void>((res) => setTimeout(res, timeout)),
  ])
}

export async function runIntro(fx: HeroFx | null, kv: Kv) {
  const loader = $('.loader')
  const html = document.documentElement

  const heroTargets = {
    chars: $$('.wordmark__char'),
    aside: $$('.wordmark__aside > span > span'),
    meta: $$('.hero__meta > span'),
    foot: $$('.hero__foot > *'),
    header: $('.header'),
  }

  if (reducedMotion) {
    loader.remove()
    fx?.setIntro(1)
    html.classList.add('is-ready')
    return
  }

  gsap.set(heroTargets.chars, { yPercent: 110 })
  gsap.set(heroTargets.aside, { yPercent: 110 })
  gsap.set([...heroTargets.meta, ...heroTargets.foot], { autoAlpha: 0, y: 16 })
  gsap.set(heroTargets.header, { autoAlpha: 0 })

  // 进度 = 字体 + 主视觉首图；最短 0.9s 保留仪式感，最长约 2.5s
  const count = $('.loader__count span')
  const bar = $('.loader__bar span')
  const prog = { v: 0, target: 0.1 }
  const render = () => {
    // 数字追赶目标值，不会倒退也不会瞬间跳满
    prog.v += (prog.target - prog.v) * 0.14
    count.textContent = pad(prog.v * 100, 3)
    bar.style.transform = `scaleX(${prog.v})`
  }
  gsap.ticker.add(render)

  gsap.from($$('.loader__log li'), { autoAlpha: 0, x: -12, duration: 0.25, ease: 'power2.out', stagger: 0.12 })

  const imgs = $$<HTMLImageElement>('.kv__slides img').slice(0, 1)
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve()
  let fontsDone = 0
  let imgsDone = 0
  const update = () => (prog.target = Math.max(prog.target, 0.1 + fontsDone * 0.4 + imgsDone * 0.5))
  await Promise.all([
    fonts.then(() => {
      fontsDone = 1
      update()
    }),
    waitImages(imgs, (p) => {
      imgsDone = p
      update()
    }),
    new Promise((r) => setTimeout(r, 900)),
  ])
  prog.target = 1
  await new Promise<void>((r) => gsap.to(prog, { v: 1, duration: 0.25, ease: 'power2.out', onComplete: r }))
  gsap.ticker.remove(render)
  count.textContent = '100'
  bar.style.transform = 'scaleX(1)'

  // 橙色斜带扫过 → 整体斜切退场 → 主视觉窗口 + 字标升起
  const band = $('.loader__band', loader)
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
  tl.to(loader.querySelector('.loader__inner'), { autoAlpha: 0, x: 40, duration: 0.3, ease: 'power2.in' })
    .to(band, { clipPath: 'polygon(0% 0%, 120% 0%, 100% 100%, 0% 100%)', duration: 0.5, ease: 'expo.inOut' }, '-=0.15')
    .set(loader, { background: 'transparent' })
    .fromTo(
      loader,
      { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' },
      { clipPath: 'polygon(120% 0%, 100% 0%, 100% 100%, 100% 100%)', duration: 0.75, ease: 'expo.inOut' },
    )
    .add(() => html.classList.add('is-ready'), '<0.3')
  const kvTl = kv.enter()
  if (kvTl) tl.add(kvTl, '<0.05')
  tl.to(heroTargets.chars, { yPercent: 0, duration: 1.1, stagger: 0.03 }, '<0.15')
    .to(heroTargets.aside, { yPercent: 0, duration: 0.9, stagger: 0.06 }, '<0.25')
    .to(heroTargets.meta, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.05 }, '<0.05')
    .to(heroTargets.foot, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06 }, '<0.1')
    .to(heroTargets.header, { autoAlpha: 1, duration: 0.5 }, '<')
    .add(() => loader.remove())
    // 让入场后的 header 恢复 mix-blend（autoAlpha 只写 opacity/visibility）
    .add(() => gsap.set(heroTargets.header, { clearProps: 'opacity,visibility' }))

  if (fx) tl.to(fx.intro, { v: 1, duration: 2, ease: 'power2.out' }, 0.5)
}
