/** 将 content.ts 中的占位内容渲染进 DOM（结构需与 sections.css 对应） */
import { site, marquee, manifesto, projects, about, capabilities, tools, process, experience, awards } from './content'
import { $, $$, h, pad, watchImage } from './env'

/** 色卡使用固定的「实体油墨」色值，不随主题变化 */
export const SWATCH: Record<string, string> = {
  ink: '#141312',
  signal: '#ff4d1a',
  overprint: '#2e3bff',
  paper: '#d9d3c6',
  mid: '#6e6a63',
}

const SEP = {
  circle: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" /><path d="M10 0v20M0 10h20" /></svg>',
  cross: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 3l14 14M17 3L3 17" /></svg>',
}

function image(src: string, alt: string, eager = false) {
  const img = h('img', { src, alt, decoding: 'async', loading: eager ? 'eager' : 'lazy' })
  watchImage(img)
  return img
}

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
  wm.setAttribute('aria-label', `${site.name} — ${site.wordmark.join(' ')} & art direction`)
  site.wordmark.forEach((word, i) => {
    const line = $(`.wordmark__line[data-line="${i}"]`, wm)
    line.setAttribute('aria-hidden', 'true')
    for (const ch of word) line.append(h('span', { class: 'wordmark__char' }, ch))
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
      ...marquee.map((word, i) => {
        const sep = h('span', { class: 'marquee__sep' })
        sep.innerHTML = i % 2 ? SEP.cross : SEP.circle
        return h('span', { class: 'marquee__item' }, h('span', { class: 'marquee__word' }, word), sep)
      }),
    )
  track.append(group(), group())
}

function renderManifesto() {
  const p = $('.manifesto__text')
  manifesto.forEach((item, i) => {
    if (i) p.append(' ')
    if (typeof item === 'string') p.append(h('span', { class: 'manifesto__word' }, item))
    else p.append(h('span', { class: 'manifesto__pill' }, image(item.img, item.alt)))
  })
}

function card(p: (typeof projects)[number]) {
  const title = h('h3', { class: 'card__title' }, p.title, ' ', h('span', { class: 'zh' }, p.titleZh))
  return h(
    'article',
    { class: 'card', 'data-layout': p.layout, 'data-id': p.id },
    h(
      'a',
      { class: 'card__link', href: `#${p.id}`, 'data-cursor': 'View', 'aria-label': `${p.title} — ${p.discipline}, ${p.year}. Open case study` },
      h(
        'div',
        { class: 'card__frame' },
        h('div', { class: 'card__media media', 'data-ratio': p.ratio }, image(p.cover, `${p.title} — placeholder project image`)),
        h('div', { class: 'card__crop', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i')),
        h('span', { class: 'card__tag mono' }, p.discipline),
      ),
      h(
        'div',
        { class: 'card__meta' },
        h('span', { class: 'card__no mono' }, `(${p.no})`),
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
    h('p', null, 'More work is available on request.'),
    h('a', { href: '#contact', 'data-cursor': 'Ask' }, 'Request the full archive', h('span', { 'aria-hidden': 'true' }, '↗')),
  )
  projects.forEach((p) => {
    // 「更多」块放在最后一张之前，使其与最后一张同行（左 5 栏 / 右 5 栏）
    if (p === projects[projects.length - 1]) works.append(more)
    works.append(card(p))
  })
  $('[data-count-projects]').textContent = `${pad(projects.length)} Projects`
}

function renderAbout() {
  const words = about.heading.split(' ')
  const last = words.pop()
  const heading = $('[data-about="heading"]')
  heading.append(words.join(' ') + ' ', h('em', { class: 'serif' }, last ?? ''))
  $('[data-about="headingZh"]').textContent = about.headingZh

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
}

function renderCaps() {
  $('[data-caps]').append(
    ...capabilities.map((c, i) =>
      h(
        'li',
        { class: 'cap' },
        h('span', { class: 'cap__no mono' }, `(${pad(i + 1)})`),
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
          h('span', null, t.code.replace(/^TL /, '').replace(/ C$/, '')),
        ),
      ),
    ),
  )
  const fan = $('[data-fan]')
  fan.setAttribute('aria-hidden', 'true')
  tools.forEach((t, i) => {
    const chip = h(
      'div',
      { class: 'chip', 'data-tool-index': String(i), style: `--sw:${SWATCH[t.swatch]};--dot:${(t.level * 0.55).toFixed(2)};z-index:${i + 1}` },
      h('div', { class: 'chip__swatch' }),
      h('div', { class: 'chip__label' }, h('span', null, t.code), h('b', null, t.name), h('span', null, t.use)),
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
        h('div', { class: 'step__head mono' }, h('span', null, `Step ${s.no}`), h('span', null, `${s.no} / ${pad(process.length)}`)),
        h('div', { class: 'step__no', 'aria-hidden': 'true' }, s.no),
        h('h3', { class: 'step__name' }, s.name, h('span', { class: 'zh' }, s.zh)),
        h('p', { class: 'step__desc' }, s.desc),
        h('ul', { class: 'step__out mono', 'aria-label': 'Deliverables' }, ...s.out.map((o) => h('li', null, o))),
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
