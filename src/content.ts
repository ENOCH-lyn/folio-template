/**
 * 内容入口：所有文案、图片与联系方式都在 content/site.json 中。
 * 推荐用后台编辑：npm run admin → http://localhost:5174/admin
 * 中文为主要语言；带 En 后缀的字段只作为英文设计标签出现。
 */
import data from '../content/site.json'

export type Rank = 'SSR' | 'SR' | 'R'
export type Swatch = 'accent' | 'cyan' | 'white' | 'steel' | 'black'

export type Project = {
  id: string
  no: string
  title: string
  titleEn: string
  discipline: string
  disciplineEn: string
  client: string
  year: string
  role: string
  tools: string[]
  summary: string
  /** 卡面稀有度，仅作视觉装饰 */
  rank: Rank
  cover: string
  ratio: 'landscape' | 'portrait' | 'square' | 'wide'
  layout: 'a' | 'b' | 'c' | 'd' | 'e' | 'f'
  gallery: { src: string; caption: string }[]
}

type Section = { title: string; en: string; label: string }

export type Content = {
  site: {
    name: string
    nameEn: string
    initials: string
    codename: string
    role: string
    roleEn: string
    city: string
    cityEn: string
    timezone: string
    timezoneLabel: string
    email: string
    availability: string
    yearRange: string
    wordmark: string[]
    wordmarkZh: string
    intro: string
    introEn: string
    heroMeta: { k: string; v: string }[]
    contacts: { label: string; value: string }[]
    socials: { label: string; href: string }[]
  }
  sections: {
    work: Section
    about: Section
    caps: Section
    toolkit: Section
    process: Section & { lede: string }
    experience: Section
    contact: Omit<Section, 'title'> & { title: string[]; button: string }
  }
  marquee: string[]
  manifesto: { text: string; en: string; images: { src: string; alt: string }[] }
  projects: Project[]
  about: {
    portrait: string
    level: string
    faction: string
    body: string[]
    stats: { value: number; suffix: string; label: string; en: string }[]
    radar: { label: string; en: string; value: number }[]
  }
  capabilities: { name: string; en: string; desc: string; tags: string[] }[]
  tools: { name: string; code: string; use: string; level: number; swatch: Swatch }[]
  process: { no: string; name: string; en: string; desc: string; out: string[] }[]
  experience: { period: string; role: string; place: string; en: string }[]
  awards: { year: string; name: string; cat: string }[]
}

const content = data as Content

export const { site, sections, marquee, manifesto, projects, about, capabilities, tools, process, experience, awards } = content

/** 「精选*作品*」→ 片段数组，奇数位为强调 */
export const emphasis = (s: string) => s.split('*')
