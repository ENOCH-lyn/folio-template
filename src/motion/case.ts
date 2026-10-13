/** 案例详情：幕布自下而上展开，封面从卡片位置 FLIP 放大；Esc 关闭，焦点回到原卡片 */
import { gsap } from 'gsap'
import { projects, type Project } from '../content'
import { $, $$, h, reducedMotion, watchImage } from '../env'
import { startScroll, stopScroll } from './scroll'

export function initCase() {
  const root = $('.case')
  const bg = $('.case__bg', root)
  const scroller = $('.case__scroll', root)
  const cover = $('.case__cover', root)
  const coverImg = $<HTMLImageElement>('img', cover)
  const body = $('.case__body', root)
  const band = $('.case__band', root)
  const close = $<HTMLButtonElement>('[data-case-close]', root)
  const html = document.documentElement
  let returnFocus: HTMLElement | null = null
  let openId: string | null = null
  let tl: gsap.core.Timeline | null = null

  const build = (p: Project) => {
    const i = projects.indexOf(p)
    const next = projects[(i + 1) % projects.length]
    const meta: [string, string][] = [
      ['Client', p.client],
      ['Year', p.year],
      ['Discipline', p.discipline],
      ['Role', p.role],
      ['Tools', p.tools.join(', ')],
      ['Index', `${p.no} / ${String(projects.length).padStart(2, '0')}`],
    ]
    const gallery = p.gallery.map((src, gi) => {
      const img = h('img', { src, alt: `${p.title} — placeholder gallery image ${gi + 1}`, loading: 'lazy', decoding: 'async' })
      watchImage(img)
      return h('figure', null, h('div', { class: 'media' }, img), h('figcaption', { class: 'mono' }, `Fig. ${String(gi + 2).padStart(2, '0')} — Placeholder caption`))
    })
    const nextBtn = h(
      'button',
      { class: 'case__next', type: 'button', 'data-cursor': 'Next', 'data-next': next.id },
      h('span', { class: 'mono' }, 'Next project →'),
      h('span', { class: 'case__next-title' }, next.title, ' ', h('em', { class: 'hl' }, `(${next.no})`)),
    )
    body.replaceChildren(
      h(
        'div',
        { class: 'case__head' },
        h('span', { class: 'case__no mono' }, `(${p.no}) — Case study`),
        h('h2', { class: 'case__title', id: 'case-title' }, h('span', { class: 'case__title-line' }, h('span', null, p.title))),
        h('span', { class: 'case__zh zh' }, p.titleZh),
      ),
      h('dl', { class: 'case__meta' }, ...meta.map(([k, v]) => h('div', null, h('dt', { class: 'mono' }, k), h('dd', null, v)))),
      h('div', { class: 'case__summary' }, h('p', null, p.summary)),
      h('div', { class: 'case__gallery' }, ...gallery),
      nextBtn,
    )
    nextBtn.addEventListener('click', () => swap(next))
    coverImg.src = p.cover
    coverImg.alt = `${p.title} — placeholder cover image`
  }

  const open = (p: Project, from: HTMLElement | null) => {
    if (openId) return
    openId = p.id
    returnFocus = from?.closest('a') ?? null
    build(p)
    scroller.scrollTop = 0
    stopScroll()
    html.classList.add('case-open')
    root.classList.add('is-open')
    root.setAttribute('aria-hidden', 'false')
    history.replaceState(null, '', `#${p.id}`)

    const head = $$('.case__title-line > span, .case__no, .case__zh', body)
    const rest = $$('.case__meta > div, .case__summary, .case__gallery, .case__next', body)

    tl?.kill()
    tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => close.focus({ preventScroll: true }) })
    if (reducedMotion) {
      gsap.set(bg, { clipPath: 'inset(0% 0% 0% 0%)' })
      tl.set(close, { autoAlpha: 1 })
      return
    }

    // 封面：从卡片图片矩形放大到全幅（clip-path 版 FLIP，避免图片拉伸）
    const media = from?.querySelector('.card__media')
    const r = media?.getBoundingClientRect()
    const vw = window.innerWidth
    const ch = cover.offsetHeight
    const startClip = r
      ? `inset(${Math.max(0, r.top)}px ${Math.max(0, vw - r.right)}px ${Math.max(0, ch - r.bottom)}px ${Math.max(0, r.left)}px)`
      : 'inset(100% 0% 0% 0%)'

    // 橙色斜带横扫过场
    tl.fromTo(
      band,
      { clipPath: 'polygon(0% 0%, 0% 0%, -20% 100%, -20% 100%)' },
      { keyframes: [{ clipPath: 'polygon(0% 0%, 120% 0%, 100% 100%, -20% 100%)', duration: 0.5, ease: 'expo.in' }, { clipPath: 'polygon(120% 0%, 120% 0%, 100% 100%, 100% 100%)', duration: 0.6, ease: 'expo.out' }] },
      0,
    )
    tl.fromTo(bg, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut' })
      .fromTo(cover, { clipPath: startClip }, { clipPath: 'inset(0px 0px 0px 0px)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.05)
      .fromTo(coverImg, { scale: 1.2 }, { scale: 1, duration: 1.6 }, 0.1)
      .fromTo(head, { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.1, stagger: 0.06 }, 0.75)
      .fromTo(rest, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.06 }, 0.9)
      .fromTo(close, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.8)
  }

  const shut = () => {
    if (!openId) return
    openId = null
    history.replaceState(null, '', location.pathname + location.search)
    const done = () => {
      root.classList.remove('is-open')
      root.setAttribute('aria-hidden', 'true')
      html.classList.remove('case-open')
      body.replaceChildren()
      startScroll()
      returnFocus?.focus({ preventScroll: true })
    }
    tl?.kill()
    if (reducedMotion) {
      gsap.set(bg, { clipPath: 'inset(100% 0% 0% 0%)' })
      done()
      return
    }
    tl = gsap.timeline({ onComplete: done })
    tl.to([scroller], { autoAlpha: 0, y: -40, duration: 0.5, ease: 'power2.in' })
      .to(bg, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'expo.inOut' }, 0.15)
      .set(scroller, { clearProps: 'opacity,visibility,transform' })
  }

  const swap = (p: Project) => {
    if (reducedMotion) {
      build(p)
      scroller.scrollTop = 0
      openId = p.id
      return
    }
    gsap.to(scroller, {
      autoAlpha: 0,
      duration: 0.45,
      ease: 'power2.in',
      onComplete: () => {
        build(p)
        openId = p.id
        history.replaceState(null, '', `#${p.id}`)
        scroller.scrollTop = 0
        gsap.set(scroller, { autoAlpha: 1 })
        const head = $$('.case__title-line > span', body)
        gsap.fromTo(cover, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut', clearProps: 'clipPath' })
        gsap.fromTo(head, { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', delay: 0.4 })
        gsap.fromTo($$('.case__meta > div, .case__summary, .case__gallery, .case__next', body), { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: 'expo.out', stagger: 0.06, delay: 0.5 })
      },
    })
  }

  // 卡片点击（捕获阶段，先于锚点平滑滚动）
  document.addEventListener(
    'click',
    (e) => {
      const link = (e.target as Element).closest<HTMLAnchorElement>('.card__link')
      if (!link) return
      const p = projects.find((x) => `#${x.id}` === link.getAttribute('href'))
      if (!p) return
      e.preventDefault()
      e.stopPropagation()
      open(p, link)
    },
    true,
  )
  close.addEventListener('click', shut)

  // 焦点陷阱 + Esc
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      shut()
      return
    }
    if (e.key !== 'Tab') return
    const f = $$<HTMLElement>('button, a[href]', root).filter((el) => el.offsetParent !== null || el === close)
    if (!f.length) return
    const first = f[0]
    const last = f[f.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  })
  window.addEventListener('keydown', (e) => e.key === 'Escape' && openId && shut())

  // 深链：/#halcyon 直接打开
  const deep = projects.find((p) => `#${p.id}` === location.hash)
  return {
    openFromHash: () => {
      if (deep) open(deep, $(`.card[data-id="${deep.id}"] .card__link`))
    },
  }
}
