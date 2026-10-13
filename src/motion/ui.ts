/** 界面外壳：自定义光标 · 磁吸按钮 · 主题（View Transition 圆形揭示）· 网格叠层 · 时钟 · 菜单 · 复制邮箱 */
import { gsap } from 'gsap'
import { site } from '../content'
import { $, $$, finePointer, h, reducedMotion } from '../env'
import { startScroll, stopScroll } from './scroll'

/* ---------- Cursor ---------- */
export function initCursor() {
  if (!finePointer || reducedMotion) return
  const html = document.documentElement
  const cursor = $('.cursor')
  const ring = $('.cursor__ring', cursor)
  const dot = $('.cursor__dot', cursor)
  const label = $('.cursor__label', cursor)
  html.classList.add('has-cursor')

  const rx = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'expo.out' })
  const ry = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'expo.out' })
  const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' })
  const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' })
  let seen = false

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return
    if (!seen) {
      seen = true
      gsap.set([ring, dot], { x: e.clientX, y: e.clientY })
      cursor.classList.remove('is-hidden')
    }
    rx(e.clientX)
    ry(e.clientY)
    dx(e.clientX)
    dy(e.clientY)
  })
  document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'))
  document.addEventListener('pointerenter', () => cursor.classList.remove('is-hidden'))

  const LINK = 'a, button, [role="button"], .chip'
  document.addEventListener('pointerover', (e) => {
    const t = e.target as Element
    const labelled = t.closest<HTMLElement>('[data-cursor]')
    const inIndex = !!t.closest('.is-index .card__link')
    if (labelled && !inIndex && !labelled.matches('.icon-btn, .view-toggle button, .header__brand, .hero__scroll, [data-copy-email], .case__close, .case__next, .footer__row a')) {
      label.textContent = labelled.dataset.cursor ?? ''
      cursor.classList.add('is-active')
      cursor.classList.remove('is-link')
    } else if (t.closest(LINK)) {
      cursor.classList.remove('is-active')
      cursor.classList.add('is-link')
    } else {
      cursor.classList.remove('is-active', 'is-link')
    }
  })
  window.addEventListener('pointerdown', () => gsap.to(ring, { scale: 0.85, duration: 0.2 }))
  window.addEventListener('pointerup', () => gsap.to(ring, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' }))
}

/* ---------- Magnetic ---------- */
export function initMagnetic() {
  if (!finePointer || reducedMotion) return
  for (const el of $$('[data-magnetic]')) {
    const inner = el.firstElementChild as HTMLElement | null
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'expo.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'expo.out' })
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - (r.left + r.width / 2)
      const y = e.clientY - (r.top + r.height / 2)
      const k = 0.3
      xTo(x * k)
      yTo(y * k)
      if (inner) gsap.to(inner, { x: x * 0.12, y: y * 0.12, duration: 0.6, ease: 'expo.out' })
    })
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' })
      if (inner) gsap.to(inner, { x: 0, y: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' })
    })
  }
}

/* ---------- Theme ---------- */
export function initTheme(onChange: () => void) {
  const btn = $<HTMLButtonElement>('[data-theme-toggle]')
  const html = document.documentElement
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  const sync = () => {
    const dark = html.dataset.theme === 'dark'
    btn.setAttribute('aria-pressed', String(dark))
    btn.setAttribute('aria-label', dark ? 'Switch to day theme' : 'Switch to night theme')
    meta?.setAttribute('content', dark ? '#0b0b0d' : '#f3f4f6')
  }
  sync()

  btn.addEventListener('click', () => {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark'
    const swap = () => {
      html.dataset.theme = next
      try {
        localStorage.setItem('operator-theme', next)
      } catch {}
      sync()
      onChange()
    }
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }
    if (!doc.startViewTransition || reducedMotion) return swap()

    const r = btn.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    html.classList.add('vt-theme')
    const vt = doc.startViewTransition(swap)
    vt.ready.then(() => {
      const anim = document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 900, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', pseudoElement: '::view-transition-new(root)' },
      )
      anim.finished.finally(() => html.classList.remove('vt-theme'))
    })
  })
}

/* ---------- Grid overlay (G) ---------- */
export function initGrid() {
  const html = document.documentElement
  const cols = $('.grid-overlay__cols')
  const label = $('.grid-overlay__label')
  const btn = $<HTMLButtonElement>('[data-grid-toggle]')
  for (let i = 0; i < 12; i++) cols.append(h('span'))
  const spans = $$('span', cols)
  let on = false

  const describe = () => {
    const cs = getComputedStyle(html)
    const c = cs.getPropertyValue('--cols').trim()
    const g = cs.getPropertyValue('--gutter').trim()
    const m = cs.getPropertyValue('--margin').trim()
    label.textContent = `${c} cols · gutter ${g} · margin ${m} · ${innerWidth}px`
  }

  const toggle = () => {
    on = !on
    btn.setAttribute('aria-pressed', String(on))
    describe()
    if (on) html.classList.add('show-grid')
    const visible = spans.filter((s) => getComputedStyle(s).display !== 'none')
    if (reducedMotion) {
      gsap.set(visible, { scaleY: on ? 1 : 0 })
      gsap.set(label, { autoAlpha: on ? 1 : 0 })
      if (!on) html.classList.remove('show-grid')
      return
    }
    gsap.to(visible, {
      scaleY: on ? 1 : 0,
      transformOrigin: on ? 'top' : 'bottom',
      duration: 0.8,
      ease: 'expo.inOut',
      stagger: { each: 0.04, from: on ? 'start' : 'end' },
      overwrite: true,
      onComplete: () => {
        if (!on) html.classList.remove('show-grid')
      },
    })
    gsap.to(label, { autoAlpha: on ? 1 : 0, y: on ? 0 : 8, duration: 0.4, delay: on ? 0.4 : 0 })
  }

  btn.addEventListener('click', toggle)
  window.addEventListener('resize', describe)
  window.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement
    if (e.metaKey || e.ctrlKey || e.altKey || t.matches('input, textarea, [contenteditable]')) return
    if (e.key === 'g' || e.key === 'G') toggle()
  })
}

/* ---------- Clock ---------- */
export function initClock() {
  const el = $('[data-clock]')
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: site.timezone })
  const tick = () => (el.textContent = `${fmt.format(new Date())} ${site.timezoneLabel}`)
  tick()
  setInterval(tick, 1000)
}

/* ---------- Mobile menu ---------- */
export function initMenu() {
  const html = document.documentElement
  const btn = $<HTMLButtonElement>('[data-menu-toggle]')
  const menu = $('#menu')
  const links = $$('a', menu)
  let open = false

  const set = (next: boolean) => {
    open = next
    btn.setAttribute('aria-expanded', String(open))
    menu.setAttribute('aria-hidden', String(!open))
    $('.menu-btn__label', btn).textContent = open ? 'Close' : 'Menu'
    html.classList.toggle('menu-open', open)
    open ? stopScroll() : startScroll()
    if (reducedMotion) {
      gsap.set(menu, { clipPath: open ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)', visibility: open ? 'visible' : 'hidden' })
      return
    }
    if (open) {
      gsap.set(menu, { visibility: 'visible' })
      gsap.to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.inOut', overwrite: true })
      gsap.fromTo(links, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'expo.out', stagger: 0.06, delay: 0.35 })
    } else {
      gsap.to(menu, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.7,
        ease: 'expo.inOut',
        overwrite: true,
        onComplete: () => {
          if (!open) gsap.set(menu, { visibility: 'hidden' })
        },
      })
    }
  }

  btn.addEventListener('click', () => set(!open))
  links.forEach((a) => a.addEventListener('click', () => set(false)))
  window.addEventListener('keydown', (e) => e.key === 'Escape' && open && set(false))
  window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => e.matches && open && set(false))
}

/* ---------- Toast + copy email ---------- */
let toastTimer = 0
export function toast(msg: string) {
  const el = $('.toast')
  el.textContent = msg
  el.classList.add('is-visible')
  clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => el.classList.remove('is-visible'), 2200)
}

export function initCopyEmail() {
  for (const btn of $$('[data-copy-email]')) {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(site.email)
        toast(`Copied — ${site.email}`)
      } catch {
        toast(site.email)
      }
    })
  }
}
