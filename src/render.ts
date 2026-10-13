/** 将 content.ts 中的占位内容渲染进 DOM（结构需与 sections.css 对应） */
import { site, marquee, manifesto, projects, about, capabilities, tools, process, experience, awards, type Rank, type Swatch } from './content'
import { $, $$, h, pad, watchImage } from './env'

/** 装备卡底色：固定色值，不随主题变化 */
export const SWATCH: Record<Swatch, string> = {
  accent: '#ff5b14',
  cyan: '#2de2e6',
  white: '#f4f4f5',
  steel: '#5e5f66',
  black: '#141417',
}

const STARS: Record<Rank, number> = { SSR: 6, SR: 5, R: 4 }

const SVG_NS = 'http://www.w3.org/2000/svg'
const svg = (tag: string, attrs: Record<string, string | number>) => {
  const el = document.createElementNS(SVG_NS, tag)
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v))
  return el
}

function image(src: string, alt: string, eager = false) {
  const img = h('img', { src, alt, decoding: 'async', loading: eager ? 'eager' : 'lazy' })
  watchImage(img)
  return img
}

const brackets = (cls: string) => h('div', { class: cls, 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i'))

function fillSite() {
  for (const el of $$('[data-site]')) {
    const key = el.dataset.site as keyof typeof site
    const v = site[key]
    if (typeof v === 'string') el.textContent = v
  }
  for (const el of $$('[data-year]')) el.textContent = String(new Date().getFullYear())
  for (const a of $$<HTMLAnchorElement>('[data-email-link]')) a.href = `mailto:${site.email}`
  document.title = `${site.name} — ${site.role} · Portfolio Template`
}

function renderWordmark() {
  const wm = $('.wordmark')
  wm.setAttribute('aria-label', `${site.name} — ${site.wordmark.join(' ')}`)
  site.wordmark.forEach((word, i) => {
    const line = $(`.wordmark__line[data-line="${i}"]`, wm)
    line.setAttribute('aria-hidden', 'true')
    for (const ch of word) line.append(h('span', { class: 'wordmark__char', 'data-char': ch }, ch))
  })
  // 侧注每行包一层，用于遮罩升起
  for (const s of $$('.wordmark__aside > span', wm)) {
    const t = s.textContent ?? ''
    s.textContent = ''
    s.append(h('span', { style: 'display:inline-block' }, t))
  }
  $('.wordmark__aside', wm).setAttribute('aria-hidden', 'true')
}

function renderMarquee() {
  const track = $('.marquee__track')
  const group = () =>
    h(
      'div',
      { class: 'marquee__group' },
      ...marquee.map((word, i) =>
        h(
          'span',
          { class: 'marquee__item' },
          h('span', { class: 'marquee__no mono' }, pad(i + 1)),
          h('span', { class: 'marquee__word' }, word),
          h('span', { class: 'marquee__sep', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
        ),
      ),
    )
  track.append(group(), group())
}

function renderManifesto() {
  const p = $('.manifesto__text')
  manifesto.forEach((item, i) => {
    if (i) p.append(' ')
    if (typeof item === 'string') {
      const hl = item.startsWith('*')
      p.append(h('span', { class: hl ? 'manifesto__word is-hl' : 'manifesto__word' }, hl ? item.slice(1) : item))
    } else p.append(h('span', { class: 'manifesto__pill' }, image(item.img, item.alt)))
  })
}

function card(p: (typeof projects)[number]) {
  const title = h('h3', { class: 'card__title' }, p.title, ' ', h('span', { class: 'zh' }, p.titleZh))
  return h(
    'article',
    { class: 'card', 'data-layout': p.layout, 'data-id': p.id, 'data-rank': p.rank },
    h(
      'a',
      { class: 'card__link', href: `#${p.id}`, 'data-cursor': 'Enter', 'aria-label': `${p.title} — ${p.discipline}, ${p.year}. Open case study` },
      h(
        'div',
        { class: 'card__frame' },
        h('div', { class: 'card__media media', 'data-ratio': p.ratio }, image(p.cover, `${p.title} — placeholder project image`)),
        brackets('card__crop'),
        h('span', { class: 'card__rank' }, p.rank),
        h('span', { class: 'card__stars', 'aria-hidden': 'true' }, '★'.repeat(STARS[p.rank])),
        h('span', { class: 'card__tag mono' }, `File ${p.no} // ${p.discipline}`),
        h('span', { class: 'card__enter mono', 'aria-hidden': 'true' }, 'Enter ▶'),
      ),
      h(
        'div',
        { class: 'card__meta' },
        h('span', { class: 'card__no mono' }, p.no),
        title,
        h('span', { class: 'card__disc mono' }, p.discipline),
        h('span', { class: 'card__client mono' }, p.client),
        h('span', { class: 'card__year mono' }, p.year),
        h('span', { class: 'card__arrow', 'aria-hidden': 'true' }, '↗'),
      ),
    ),
  )
}

function renderWorks() {
  const works = $('[data-works]')
  const more = h(
    'div',
    { class: 'works__more' },
    h('p', { class: 'mono works__more-kicker' }, '// Locked files'),
    h('p', null, 'More stages unlock on request.'),
    h('a', { href: '#contact', 'data-cursor': 'Ask' }, 'Request full archive', h('span', { 'aria-hidden': 'true' }, '↗')),
  )
  projects.forEach((p) => {
    // 「更多」块放在最后一张之前，使其与最后一张同行（左 5 栏 / 右 5 栏）
    if (p === projects[projects.length - 1]) works.append(more)
    works.append(card(p))
  })
  $('[data-count-projects]').textContent = `${pad(projects.length)} Files`
}

/** 六边形能力雷达：底网 + 数值多边形 + 顶点标签（动画见 motion/hud.ts） */
function renderRadar() {
  const host = $('[data-radar]')
  const n = about.radar.length
  const R = 100
  const pt = (i: number, r: number) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2
    return [Math.cos(a) * r, Math.sin(a) * r] as const
  }
  const poly = (r: (i: number) => number) => about.radar.map((_, i) => pt(i, r(i)).map((v) => v.toFixed(2)).join(',')).join(' ')

  const root = svg('svg', { viewBox: '-150 -128 300 256', class: 'radar', role: 'img', 'aria-label': `Skill radar: ${about.radar.map((s) => `${s.label} ${Math.round(s.value * 100)}`).join(', ')}` })
  const grid = svg('g', { class: 'radar__grid' })
  for (const k of [0.25, 0.5, 0.75, 1]) grid.append(svg('polygon', { points: poly(() => R * k) }))
  about.radar.forEach((_, i) => {
    const [x, y] = pt(i, R)
    grid.append(svg('line', { x1: 0, y1: 0, x2: x.toFixed(2), y2: y.toFixed(2) }))
  })
  const shape = svg('polygon', { class: 'radar__shape', points: poly((i) => R * about.radar[i].value) })
  const dots = svg('g', { class: 'radar__dots' })
  const labels = svg('g', { class: 'radar__labels' })
  about.radar.forEach((s, i) => {
    const [x, y] = pt(i, R * s.value)
    dots.append(svg('circle', { cx: x.toFixed(2), cy: y.toFixed(2), r: 3 }))
    const [lx, ly] = pt(i, R + 16)
    const anchor = Math.abs(lx) < 4 ? 'middle' : lx > 0 ? 'start' : 'end'
    const t = svg('text', { x: lx.toFixed(2), y: (ly + (ly < -R ? -4 : ly > R ? 10 : 3)).toFixed(2), 'text-anchor': anchor })
    t.append(svg('tspan', { class: 'radar__val' }), document.createTextNode(` ${s.label}`))
    ;(t.firstChild as Element).textContent = pad(s.value * 100)
    labels.append(t)
  })
  root.append(grid, shape, dots, labels)
  host.append(h('p', { class: 'mono about__radar-h' }, '// Combat data'), root)
}

function renderAbout() {
  const words = about.heading.split(' ')
  const last = words.pop()
  const heading = $('[data-about="heading"]')
  heading.append(words.join(' ') + ' ', h('em', { class: 'hl' }, last ?? ''))
  $('[data-about="headingZh"]').textContent = about.headingZh
  $('[data-about="level"]').textContent = about.level
  $('[data-about="faction"]').textContent = about.faction

  const portrait = $<HTMLImageElement>('[data-about="portrait"]')
  portrait.src = about.portrait
  watchImage(portrait)

  $('[data-about="body"]').append(...about.body.map((t) => h('p', { 'data-split': '' }, t)))
  $('[data-about="stats"]').append(
    ...about.stats.map((s) =>
      h(
        'div',
        { class: 'stat' },
        h('dt', { class: 'mono' }, s.label),
        h('dd', null, h('span', { 'data-count': String(s.value) }, String(s.value)), s.suffix ? h('sup', null, s.suffix) : null),
        h('span', { class: 'zh' }, s.zh),
      ),
    ),
  )
  renderRadar()
}

function renderCaps() {
  $('[data-caps]').append(
    ...capabilities.map((c, i) =>
      h(
        'li',
        { class: 'cap' },
        h('span', { class: 'cap__no mono' }, `SK-${pad(i + 1)}`),
        h('h3', { class: 'cap__name' }, c.name, h('span', { class: 'zh' }, c.zh)),
        h('p', { class: 'cap__desc' }, c.desc),
        h('ul', { class: 'cap__tags mono' }, ...c.tags.map((t) => h('li', null, t))),
      ),
    ),
  )
}

function renderToolkit() {
  $('[data-tool-list]').append(
    ...tools.map((t, i) =>
      h(
        'li',
        null,
        h(
          'button',
          { type: 'button', 'aria-pressed': 'false', 'data-tool-index': String(i), 'aria-label': `${t.name}, ${t.use}, level ${t.level} of 5` },
          h('span', null, t.name),
          h('span', null, t.code.replace(/^EQ /, '')),
        ),
      ),
    ),
  )
  const fan = $('[data-fan]')
  fan.setAttribute('aria-hidden', 'true')
  tools.forEach((t, i) => {
    const chip = h(
      'div',
      { class: 'chip', 'data-tool-index': String(i), 'data-swatch': t.swatch, style: `--sw:${SWATCH[t.swatch]};z-index:${i + 1}` },
      h('div', { class: 'chip__swatch' }, h('span', { class: 'chip__mono' }, t.name.slice(0, 2))),
      h(
        'div',
        { class: 'chip__label' },
        h('span', null, t.code),
        h('b', null, t.name),
        h('span', null, t.use),
        h('span', { class: 'chip__stars' }, '★'.repeat(t.level) + '☆'.repeat(5 - t.level)),
      ),
    )
    fan.append(chip)
  })
  const level = $('[data-tool="level"]')
  for (let i = 0; i < 5; i++) level.append(h('i'))
}

function renderProcess() {
  $('[data-process]').append(
    ...process.map((s) =>
      h(
        'div',
        { class: 'step' },
        h('div', { class: 'step__head mono' }, h('span', null, `Stage ${s.no}`), h('span', null, `${s.no} / ${pad(process.length)}`)),
        h('div', { class: 'step__no', 'aria-hidden': 'true' }, s.no),
        h('h3', { class: 'step__name' }, s.name, h('span', { class: 'zh' }, s.zh)),
        h('p', { class: 'step__desc' }, s.desc),
        h('ul', { class: 'step__out mono', 'aria-label': 'Rewards' }, ...s.out.map((o) => h('li', null, o))),
      ),
    ),
  )
}

function renderExperience() {
  $('[data-exp]').append(
    ...experience.map((e) =>
      h(
        'li',
        null,
        h('span', { class: 'exp__period mono' }, e.period),
        h('div', { class: 'exp__role' }, e.role, h('small', null, e.place)),
        h('span', { class: 'zh' }, e.zh),
      ),
    ),
  )
  $('[data-awards]').append(
    ...awards.map((a) =>
      h('li', null, h('span', { class: 'mono' }, a.year), h('div', { class: 'exp__role' }, a.name), h('span', { class: 'mono' }, a.cat)),
    ),
  )
}

function renderSocials() {
  $('[data-socials]').append(
    ...site.socials.map((s) =>
      h(
        'li',
        null,
        h(
          'a',
          { href: s.href, target: '_blank', rel: 'noopener noreferrer' },
          h('span', { class: 'roll' }, h('span', null, s.label)),
          h('span', { 'aria-hidden': 'true' }, '↗'),
        ),
      ),
    ),
  )
}

export function render() {
  fillSite()
  renderWordmark()
  renderMarquee()
  renderManifesto()
  renderWorks()
  renderAbout()
  renderCaps()
  renderToolkit()
  renderProcess()
  renderExperience()
  renderSocials()
}
