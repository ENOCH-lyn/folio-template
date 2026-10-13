/** Lenis 平滑滚动 × ScrollTrigger 同步；锚点导航 */
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reducedMotion } from '../env'

gsap.registerPlugin(ScrollTrigger)

export let lenis: Lenis | null = null

export function initScroll() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
  if (reducedMotion) return

  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.2 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis?.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

export function scrollToTarget(target: HTMLElement | number, immediate = false) {
  if (lenis) {
    lenis.scrollTo(target, { duration: immediate ? 0 : 1.6, immediate, easing: (t) => 1 - Math.pow(1 - t, 4) })
  } else {
    const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: y, behavior: immediate || reducedMotion ? 'auto' : 'smooth' })
  }
}

export const stopScroll = () => lenis?.stop()
export const startScroll = () => lenis?.start()

/** 页内锚点：交给平滑滚动；空链接（占位）给出提示 */
export function initAnchors(onPlaceholder: () => void) {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
    if (!a || e.defaultPrevented) return
    const id = a.getAttribute('href')!.slice(1)
    if (!id) {
      e.preventDefault()
      onPlaceholder()
      return
    }
    const target = id === 'top' ? 0 : document.getElementById(id)
    if (target === null) return
    e.preventDefault()
    scrollToTarget(target)
    if (target !== 0) target.setAttribute('tabindex', '-1')
    if (target !== 0) target.focus({ preventScroll: true })
  })
}
