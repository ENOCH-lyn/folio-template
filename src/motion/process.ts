/** 工作流程：≥900px 横向钉住滚动，步骤依次「上墨」；以下回落为纵向堆叠 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $, $$, reducedMotion } from '../env'

gsap.registerPlugin(ScrollTrigger)

export function initProcess() {
  const section = $('#process')
  const track = $('[data-process]')
  const steps = $$('.step', track)
  const bar = $('.process__bar span')
  const mm = gsap.matchMedia()

  const activate = (idx: number) => steps.forEach((s, i) => s.classList.toggle('is-active', i <= idx))

  mm.add('(min-width: 900px)', () => {
    if (reducedMotion) {
      // 不做横向位移：改为可横向滚动的静态轨道
      $('.process__pin', section).style.overflowX = 'auto'
      activate(steps.length - 1)
      return
    }
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth)
    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin: '.process__pin',
        start: 'top top',
        end: () => `+=${dist()}`,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (s) => {
          gsap.set(bar, { scaleX: s.progress })
        },
      },
    })
    for (const [i, step] of steps.entries()) {
      ScrollTrigger.create({
        trigger: step,
        containerAnimation: tween,
        start: 'left 70%',
        onEnter: () => activate(i),
        onLeaveBack: () => activate(i - 1),
      })
      gsap.from($$('.step__name, .step__desc, .step__out', step), {
        y: 30,
        autoAlpha: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.06,
        scrollTrigger: { trigger: step, containerAnimation: tween, start: 'left 80%', once: true },
      })
    }
    return () => activate(-1)
  })

  mm.add('(max-width: 899px)', () => {
    for (const [i, step] of steps.entries()) {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 65%',
        onEnter: () => activate(i),
        onLeaveBack: () => activate(i - 1),
      })
    }
    if (reducedMotion) activate(steps.length - 1)
  })
}
