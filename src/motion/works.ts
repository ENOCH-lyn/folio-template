/** 作品区：Grid ⇄ Index（GSAP Flip 重排）· 卡片视差 · Index 悬停大图（按速度倾斜） */
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../content'
import { $, $$, clamp, finePointer, h, reducedMotion } from '../env'
import { scrollToTarget } from './scroll'

gsap.registerPlugin(Flip, ScrollTrigger)

type View = 'grid' | 'index'

let parallaxTweens: gsap.core.Tween[] = []

function setupParallax() {
  parallaxTweens.forEach((t) => {
    t.scrollTrigger?.kill()
    t.kill()
  })
  parallaxTweens = []
  if (reducedMotion || window.innerWidth < 900) return
  for (const card of $$('.is-grid .card[data-layout="b"], .is-grid .card[data-layout="d"], .is-grid .card[data-layout="f"]')) {
    const frame = $('.card__frame', card)
    parallaxTweens.push(
      gsap.fromTo(frame, { y: 70 }, { y: -70, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } }),
    )
  }
}

function clearParallax() {
  parallaxTweens.forEach((t) => {
    t.scrollTrigger?.kill()
    t.kill()
  })
  parallaxTweens = []
  gsap.set($$('.card__frame'), { clearProps: 'transform' })
}

function initPreview(works: HTMLElement) {
  const preview = $('.preview')
  const inner = $('.preview__inner', preview)
  const imgs = projects.map((p) => {
    const img = h('img', { src: p.cover, alt: '', decoding: 'async', loading: 'lazy' })
    gsap.set(img, { clipPath: 'inset(100% 0% 0% 0%)' })
    inner.append(img)
    return img
  })

  const xTo = gsap.quickTo(preview, 'x', { duration: 0.7, ease: 'expo.out' })
  const yTo = gsap.quickTo(preview, 'y', { duration: 0.7, ease: 'expo.out' })
  const rTo = gsap.quickTo(preview, 'rotation', { duration: 0.9, ease: 'expo.out' })
  let lastX = 0
  let current = -1
  let shown = false

  const pw = () => preview.offsetWidth
  const ph = () => preview.offsetHeight

  works.addEventListener('pointermove', (e) => {
    if (!works.classList.contains('is-index')) return
    xTo(e.clientX - pw() / 2)
    yTo(e.clientY - ph() / 2)
    rTo(clamp((e.clientX - lastX) * 0.6, -12, 12))
    lastX = e.clientX
  })

  const show = (i: number) => {
    if (!shown) {
      shown = true
      gsap.set(preview, { visibility: 'visible' })
      gsap.to(inner, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'expo.out', overwrite: true })
    }
    if (i === current) return
    const prev = current
    current = i
    const img = imgs[i]
    img.style.zIndex = '2'
    gsap.fromTo(img, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.25 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.8, ease: 'expo.out', overwrite: true })
    if (prev > -1) {
      imgs[prev].style.zIndex = '1'
      gsap.to(imgs[prev], { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.8, ease: 'expo.out', delay: 0.1 })
    }
  }
  const hide = () => {
    if (!shown) return
    shown = false
    gsap.to(inner, {
      clipPath: 'inset(50% 50% 50% 50%)',
      duration: 0.5,
      ease: 'expo.out',
      overwrite: true,
      onComplete: () => {
        if (!shown) gsap.set(preview, { visibility: 'hidden' })
      },
    })
    rTo(0)
  }

  for (const card of $$('.card', works)) {
    const i = projects.findIndex((p) => p.id === card.dataset.id)
    card.addEventListener('pointerenter', (e) => {
      if (!works.classList.contains('is-index')) return
      // 首次进入时直接定位，避免从左上角飞来
      if (!shown) {
        gsap.set(preview, { x: e.clientX - pw() / 2, y: e.clientY - ph() / 2 })
        lastX = e.clientX
      }
      show(i)
    })
  }
  works.addEventListener('pointerleave', hide)
  return { hide }
}

export function initWorks() {
  const section = $('#work')
  const works = $('[data-works]')
  const buttons = $$<HTMLButtonElement>('[data-view]')
  const preview = finePointer && !reducedMotion ? initPreview(works) : null
  let view: View = 'grid'
  let busy = false

  const setView = (next: View) => {
    if (next === view || busy) return
    view = next
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === next)))
    section.classList.toggle('is-index-view', next === 'index')
    preview?.hide()

    const apply = () => {
      works.classList.toggle('is-grid', next === 'grid')
      works.classList.toggle('is-index', next === 'index')
    }

    if (reducedMotion) {
      apply()
      next === 'grid' ? setupParallax() : clearParallax()
      ScrollTrigger.refresh()
      return
    }

    busy = true
    clearParallax()
    // 若已滚过作品区顶部，先回到区块开头，保证读者看见重排过程
    if (window.scrollY > section.offsetTop + 40) scrollToTarget(section, true)

    const media = $$('.card__media', works)
    const texts = $$('.card__no, .card__title, .card__disc, .card__client, .card__year, .card__arrow', works)
    const more = $$('.works__more', works)
    // 尚未显影的卡片直接完成显影，避免 Index 中出现空行
    for (const st of ScrollTrigger.getAll()) {
      const t = st.trigger as HTMLElement | undefined
      if (t && (media.includes(t) || t.classList.contains('card__meta'))) {
        st.animation?.progress(1)
        st.kill()
      }
    }
    const state = Flip.getState([...media, ...texts], { props: 'clipPath' })
    apply()
    // 新进入的元素（如 Index 才显示的 client）淡入
    const tl = gsap.timeline({
      onComplete: () => {
        busy = false
        if (next === 'grid') setupParallax()
        ScrollTrigger.refresh()
      },
    })
    tl.add(
      Flip.from(state, {
        targets: media,
        duration: 1.1,
        ease: 'expo.inOut',
        stagger: 0.035,
        absolute: false,
        nested: true,
      }),
      0,
    )
    tl.add(
      Flip.from(state, {
        targets: texts,
        duration: 1.1,
        ease: 'expo.inOut',
        scale: true,
        stagger: 0.012,
        nested: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.5 }),
      }),
      0,
    )
    if (next === 'grid') tl.fromTo(more, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 0.7)
  }

  buttons.forEach((b) => b.addEventListener('click', () => setView(b.dataset.view as View)))
  setupParallax()
  let w = window.innerWidth
  window.addEventListener('resize', () => {
    if (Math.abs(window.innerWidth - w) < 2) return
    w = window.innerWidth
    if (view === 'grid') setupParallax()
  })
}
