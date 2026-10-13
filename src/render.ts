/** 将 content.ts 中的占位内容渲染进 DOM（结构需与 sections.css 对应） */
import { site, sections, marquee, manifesto, projects, about, capabilities, tools, process, experience, awards, emphasis, type Rank, type Swatch } from './content'
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
  document.title = `${site.name} · ${site.role}作品集`
  $('meta[name="description"]').setAttribute('content', site.intro)
}

/** 「精选*作品*」→ 文本 + <em class="hl"> */
function rich(el: Element, s: string) {
  emphasis(s).forEach((part, i) => part && el.append(i % 2 ? h('em', { class: 'hl' }, part) : part))
}

function fillSections() {
  for (const head of $$('[data-sec]')) {
    const sec = sections[head.dataset.sec as keyof typeof sections] as { title: string; en: string; label: string }
    rich($('[data-sec-title]', head), sec.title)
    $('[data-sec-en]', head).textContent = sec.en
    $('[data-sec-label]', head).textContent = sec.label
  }
  const pr = sections.process
  rich($('[data-process-title]'), pr.title)
  $('[data-process-en]').textContent = pr.en
  $('[data-process-label]').textContent = pr.label
  $('[data-process-lede]').textContent = pr.lede

  const c = sections.contact
  $('[data-contact-label]').textContent = c.label
  $('[data-contact-en]').textContent = c.en
  $('[data-contact-button]').textContent = c.button
  const title = $('[data-contact-title]')
  for (const line of c.title) {
    const inner = h('span')
    rich(inner, line)
    title.append(h('span', { class: 'line' }, inner))
  }
}

function renderHeroMeta() {
  $('[data-hero-meta]').append(
    ...site.heroMeta.map((m) => h('span', { 'data-decode': '' }, h('b', null, m.k), ' ', m.v)),
  )
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

/** 宣言：中文按字拆分（便于逐字「显影」），{n} 处插入行内图片，*…* 为强调 */
function renderManifesto() {
  const p = $('.manifesto__text')
  p.setAttribute('aria-label', manifesto.text.replace(/\*|\{\d+\}/g, ''))
  emphasis(manifesto.text).forEach((part, i) => {
    for (const tok of part.split(/(\{\d+\})/)) {
      const m = tok.match(/^\{(\d+)\}$/)
      if (m) {
        const im = manifesto.images[Number(m[1])]
        if (im) p.append(h('span', { class: 'manifesto__pill', 'aria-hidden': 'true' }, image(im.src, im.alt)))
        continue
      }
      // 中文逐字，英文/数字按词
      for (const w of tok.match(/[A-Za-z0-9'’.,-]+|\s+|./gu) ?? []) {
        if (/^\s+$/.test(w)) p.append(' ')
        else p.append(h('span', { class: i % 2 ? 'manifesto__word is-hl' : 'manifesto__word', 'aria-hidden': 'true' }, w))
      }
    }
  })
  $('[data-manifesto-en]').textContent = manifesto.en
}

function card(p: (typeof projects)[number]) {
  const title = h('h3', { class: 'card__title' }, p.title, ' ', h('span', { class: 'card__en mono' }, p.titleEn))
  return h(
    'article',
    { class: 'card', 'data-layout': p.layout, 'data-id': p.id, 'data-rank': p.rank },
    h(
      'a',
      { class: 'card__link', href: `#${p.id}`, 'data-cursor': '查看', 'aria-label': `${p.title}（${p.discipline}，${p.year}）— 查看项目详情` },
      h(
        'div',
        { class: 'card__frame' },
        h('div', { class: 'card__media media', 'data-ratio': p.ratio }, image(p.cover, `${p.title} 封面`)),
        brackets('card__crop'),
        h('span', { class: 'card__rank' }, p.rank),
        h('span', { class: 'card__stars', 'aria-hidden': 'true' }, '★'.repeat(STARS[p.rank])),
        h('span', { class: 'card__tag mono' }, `FILE ${p.no} // ${p.disciplineEn}`),
        h('span', { class: 'card__enter mono', 'aria-hidden': 'true' }, '查看详情 ▶'),
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
    h('p', { class: 'mono works__more-kicker' }, '// LOCKED FILES'),
    h('p', null, '更多项目因保密协议未公开，可单独索取。'),
    h('a', { href: '#contact', 'data-cursor': '索取' }, '索取完整作品集', h('span', { 'aria-hidden': 'true' }, '↗')),
  )
  projects.forEach((p) => {
    // 「更多」块放在最后一张之前，使其与最后一张同行（左 5 栏 / 右 5 栏）
    if (p === projects[projects.length - 1]) works.append(more)
    works.append(card(p))
  })
  $('[data-count-projects]').textContent = `${pad(projects.length)} FILES`
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

  const root = svg('svg', { viewBox: '-150 -128 300 256', class: 'radar', role: 'img', 'aria-label': `能力雷达：${about.radar.map((s) => `${s.label} ${Math.round(s.value * 100)}`).join('，')}` })
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
  host.append(h('p', { class: 'mono about__radar-h' }, '// 能力数据 COMBAT DATA'), root)
}

function renderAbout() {
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
        h('dt', null, s.label),
        h('dd', null, h('span', { 'data-count': String(s.value) }, String(s.value)), s.suffix ? h('sup', null, s.suffix) : null),
        h('span', { class: 'stat__en mono' }, s.en),
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
        h('h3', { class: 'cap__name' }, c.name, h('span', { class: 'cap__en mono' }, c.en)),
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
          { type: 'button', 'aria-pressed': 'false', 'data-tool-index': String(i), 'aria-label': `${t.name}，${t.use}，熟练度 ${t.level}/5` },
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
        h('div', { class: 'step__head mono' }, h('span', null, `STAGE ${s.no} · ${s.en}`), h('span', null, `${s.no} / ${pad(process.length)}`)),
        h('div', { class: 'step__no', 'aria-hidden': 'true' }, s.no),
        h('h3', { class: 'step__name' }, s.name, h('span', { class: 'step__en mono' }, s.en)),
        h('p', { class: 'step__desc' }, s.desc),
        h('ul', { class: 'step__out mono', 'aria-label': '阶段产出' }, ...s.out.map((o) => h('li', null, o))),
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
        h('div', { class: 'exp__role' }, e.role, h('small', null, e.place, h('span', { class: 'exp__en mono' }, e.en))),
      ),
    ),
  )
  $('[data-awards]').append(
    ...awards.map((a) =>
      h('li', null, h('span', { class: 'mono' }, a.year), h('div', { class: 'exp__role' }, a.name), h('span', { class: 'mono' }, a.cat)),
    ),
  )
}

function renderContacts() {
  $('[data-contacts]').append(
    ...[{ label: '邮箱', value: site.email }, ...site.contacts].map((c) => h('div', null, h('dt', { class: 'mono' }, c.label), h('dd', null, c.value))),
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
  fillSections()
  renderHeroMeta()
  renderWordmark()
  renderMarquee()
  renderManifesto()
  renderWorks()
  renderAbout()
  renderCaps()
  renderToolkit()
  renderProcess()
  renderExperience()
  renderContacts()
  renderSocials()
}
