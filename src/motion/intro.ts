/** 预加载「系统启动」→ 斜切色带擦除 → Hero 入场。返回 Promise，在入场开始时 resolve */
import { gsap } from 'gsap'
import { $, $$, pad, reducedMotion } from '../env'
import type { Halftone } from './halftone'

function waitImages(imgs: HTMLImageElement[], onProgress: (p: number) => void, timeout = 3500) {
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

export async function runIntro(halftone: Halftone | null) {
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
    halftone?.setIntro(1)
    html.classList.add('is-ready')
    return
  }

  gsap.set(heroTargets.chars, { yPercent: 110 })
  gsap.set(heroTargets.aside, { yPercent: 110 })
  gsap.set([...heroTargets.meta, ...heroTargets.foot], { autoAlpha: 0, y: 16 })
  gsap.set(heroTargets.header, { autoAlpha: 0 })

  // 进度：字体 + 首屏图片（以首屏可见的作品封面为准），带最短时长保证仪式感
  const count = $('.loader__count span')
  const bar = $('.loader__bar span')
  const prog = { v: 0, target: 0 }
  const tick = gsap.to(prog, {
    v: 1,
    duration: 1.6,
    ease: 'none',
    paused: true,
  })
  const render = () => {
    const v = Math.min(prog.v, prog.target)
    count.textContent = pad(v * 100, 3)
    bar.style.transform = `scaleX(${v})`
  }
  gsap.ticker.add(render)
  tick.play()

  // 启动日志逐行打印
  gsap.from($$('.loader__log li'), { autoAlpha: 0, x: -12, duration: 0.3, ease: 'power2.out', stagger: 0.28 })

  const imgs = $$<HTMLImageElement>('.card__media img').slice(0, 2)
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve()
  let fontsDone = 0
  let imgsDone = 0
  const update = () => (prog.target = 0.15 + fontsDone * 0.35 + imgsDone * 0.5)
  update()
  await Promise.all([
    fonts.then(() => {
      fontsDone = 1
      update()
    }),
    waitImages(imgs, (p) => {
      imgsDone = p
      update()
    }),
    new Promise((r) => setTimeout(r, 1700)),
  ])
  prog.target = 1
  await new Promise<void>((r) => gsap.to(prog, { v: 1, duration: 0.3, onComplete: r }))
  gsap.ticker.remove(render)
  render()

  // 橙色斜带自左扫过盖住画面 → 整体斜切退场 → 字标逐字升起
  const band = $('.loader__band', loader)
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
  tl.to(loader.querySelector('.loader__inner'), { autoAlpha: 0, x: 40, duration: 0.4, ease: 'power2.in' })
    .to(band, { clipPath: 'polygon(0% 0%, 120% 0%, 100% 100%, 0% 100%)', duration: 0.6, ease: 'expo.inOut' }, '-=0.2')
    .set(loader, { background: 'transparent' })
    .fromTo(
      loader,
      { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' },
      { clipPath: 'polygon(120% 0%, 100% 0%, 100% 100%, 100% 100%)', duration: 0.9, ease: 'expo.inOut' },
    )
    .add(() => html.classList.add('is-ready'), '<0.4')
    .to(heroTargets.chars, { yPercent: 0, duration: 1.3, stagger: 0.04 }, '<0.35')
    .to(heroTargets.aside, { yPercent: 0, duration: 1.1, stagger: 0.08 }, '<0.3')
    .to(heroTargets.meta, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.06 }, '<0.1')
    .to(heroTargets.foot, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, '<0.15')
    .to(heroTargets.header, { autoAlpha: 1, duration: 0.6 }, '<')
    .add(() => loader.remove())

  if (halftone) tl.to(halftone.intro, { v: 1, duration: 2.6, ease: 'power2.out' }, 0.6)
  // 让入场后的 header 恢复 mix-blend（autoAlpha 只写 opacity/visibility）
  tl.add(() => gsap.set(heroTargets.header, { clearProps: 'opacity,visibility' }))
}
