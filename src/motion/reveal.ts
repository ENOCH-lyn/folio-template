/** 滚动驱动的动效词汇：Rise 升起 · Rule 拉线 · Develop 显影 · Velocity 速度 · 计数 · Folio */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { $, $$, pad, reducedMotion } from '../env'
import { lenis } from './scroll'
import { fitText } from './wordmark'

gsap.registerPlugin(ScrollTrigger, SplitText)

const once = { once: true } as const

/** Rise：按行从遮罩下升起 */
function rise() {
  const targets = [...$$('.section-head__title'), ...$$('.process__title'), ...$$('[data-split]')]

  for (const el of targets) {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 88%', ...once },
        }),
    })
  }

  // 联系区大标题：结构固定，直接对内层 span 动画
  gsap.from($$('.contact__title .line > span'), {
    yPercent: 110,
    duration: 1.3,
    ease: 'expo.out',
    stagger: 0.1,
    scrollTrigger: { trigger: '.contact__title', start: 'top 85%', ...once },
  })

  // 宣言：逐词由浅墨压深，随滚动「印」出来
  const words = $$('.manifesto__word, .manifesto__pill')
  gsap.fromTo(
    words,
    { opacity: 0.14 },
    {
      opacity: 1,
      ease: 'none',
      stagger: 0.05,
      scrollTrigger: { trigger: '.manifesto__text', start: 'top 80%', end: 'bottom 55%', scrub: true },
    },
  )
  gsap.fromTo(
    $$('.manifesto__pill'),
    { clipPath: 'inset(0% 50% 0% 50% round 999px)' },
    {
      clipPath: 'inset(0% 0% 0% 0% round 999px)',
      duration: 1.3,
      ease: 'expo.inOut',
      stagger: 0.2,
      scrollTrigger: { trigger: '.manifesto__text', start: 'top 75%', ...once },
    },
  )
  gsap.from($$('.manifesto__pill img'), {
    scale: 1.6,
    duration: 1.8,
    ease: 'expo.out',
    stagger: 0.2,
    scrollTrigger: { trigger: '.manifesto__text', start: 'top 75%', ...once },
  })
}

/** Rule：分隔线自左向右拉出 */
function rules() {
  for (const r of $$('.section-head__rule')) {
    gsap.from(r, { scaleX: 0, duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: r, start: 'top 92%', ...once } })
  }
  for (const head of $$('.section-head')) {
    const bits = $$('.section-head__no, .section-head__zh, .section-head__aside', head)
    gsap.from(bits, { autoAlpha: 0, y: 12, duration: 0.9, ease: 'expo.out', stagger: 0.08, delay: 0.25, scrollTrigger: { trigger: head, start: 'top 90%', ...once } })
  }
  // 列表行：顶线拉出 + 内容淡入
  for (const list of $$('.caps__list, .exp__list')) {
    const items = $$(':scope > li', list)
    gsap.from(items, {
      autoAlpha: 0,
      y: 24,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.08,
      scrollTrigger: { trigger: list, start: 'top 85%', ...once },
    })
  }
}

/** Develop：图片从下往上显影，内部轻微缩放 */
export function develop(root: ParentNode = document) {
  const frames = $$('.card__media, .about__portrait .media', root)
  for (const f of frames) {
    const img = f.querySelector('img')
    const tl = gsap.timeline({ scrollTrigger: { trigger: f, start: 'top 90%', ...once } })
    tl.fromTo(f, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' })
    if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: 'expo.out', clearProps: 'transform' }, 0.1)
  }
  for (const m of $$('.card__meta', root)) {
    gsap.from(m, { autoAlpha: 0, y: 16, duration: 1, ease: 'expo.out', delay: 0.3, scrollTrigger: { trigger: m, start: 'top 96%', ...once } })
  }
}

/** Velocity：跑马灯速度与倾斜由滚动速度驱动 */
function marquee() {
  const track = $('.marquee__track')
  const group = $('.marquee__group', track)
  let x = 0
  let skew = 0
  let dir = -1
  const base = 60 // px/s
  gsap.ticker.add((_, dt) => {
    const w = group.offsetWidth
    if (!w) return
    const v = lenis ? lenis.velocity : 0
    if (Math.abs(v) > 0.5) dir = v > 0 ? -1 : 1
    x += dir * (base + Math.abs(v) * 28) * (dt / 1000)
    x = ((x % w) - w) % w
    skew += (gsap.utils.clamp(-12, 12, -v * 0.6) - skew) * 0.1
    track.style.transform = `translate3d(${x}px,0,0) skewX(${skew.toFixed(2)}deg)`
  })
}

/** 统计数字：滚入视口时从 0 计数 */
function counters() {
  for (const el of $$('[data-count]')) {
    const to = Number(el.dataset.count)
    const o = { v: 0 }
    el.textContent = '0'
    gsap.to(o, {
      v: to,
      duration: 1.8,
      ease: 'expo.out',
      onUpdate: () => (el.textContent = String(Math.round(o.v))),
      scrollTrigger: { trigger: el, start: 'top 90%', ...once },
    })
  }
}

/** 视差：大号元素随滚动轻微位移 */
function parallax() {
  gsap.to('.wordmark', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
  gsap.to('.hero__canvas', { yPercent: 20, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
  // 页脚大字：从墨迹压低处升起
  const giant = $('.footer__giant > span')
  gsap.from(giant, { yPercent: 60, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } })
}

/** Folio 页码 + 阅读进度 + 导航高亮 */
function folio() {
  const no = $('.folio__no')
  const name = $('.folio__name')
  const val = $('.progress__val')
  const navLinks = $$<HTMLAnchorElement>('[data-nav]')
  let current = ''

  const set = (n: string, label: string) => {
    if (current === n) return
    const down = current < n
    current = n
    const els = [no, name]
    gsap.to(els, {
      yPercent: down ? -110 : 110,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        no.textContent = `[${n}]`
        name.textContent = label
        gsap.fromTo(els, { yPercent: down ? 110 : -110 }, { yPercent: 0, duration: 0.5, ease: 'expo.out', stagger: 0.04 })
      },
    })
    for (const a of navLinks) {
      const id = a.getAttribute('href')!.slice(1)
      const sec = document.getElementById(id)
      a.classList.toggle('is-current', !!sec && sec.dataset.folio === n)
    }
  }

  // Hero + 宣言都算作 [00]，跳转式滚动（锚点 / 回到顶部）时也能正确复位
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', endTrigger: '#work', end: 'top center', onToggle: (s) => s.isActive && set('00', 'Index') })
  for (const sec of $$('[data-folio]')) {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top center',
      end: 'bottom center',
      onToggle: (s) => s.isActive && set(sec.dataset.folio!, sec.dataset.folioName!),
    })
  }

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (s) => (val.textContent = pad(s.progress * 100, 3)),
  })
}

/** 页脚大字撑满宽度 */
function footerFit() {
  const g = $('.footer__giant')
  const run = fitText(g, $('span', g), '--fg-size')
  document.fonts?.ready.then(run)
  window.addEventListener('resize', run)
}

export function initReveals() {
  footerFit()
  folio()
  if (reducedMotion) return
  rise()
  rules()
  develop()
  marquee()
  counters()
  parallax()
}
