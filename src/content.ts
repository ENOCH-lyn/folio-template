/**
 * 内容配置 —— 模板唯一需要修改的地方。
 * 所有文本、链接、图片均为占位内容，替换为你自己的信息即可。
 * Content config — every string here is placeholder copy.
 */

type ImageSize = 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9'

const img = (prompt: string, size: ImageSize) =>
  `https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`

/** 统一画风后缀：保证占位图整体是同一套二次元主视觉语言 */
const STYLE = 'anime key visual, cel shading, official game art, crisp linework, high contrast, orange and black color scheme, cinematic lighting, highly detailed'
const art = (subject: string, size: ImageSize) => img(`${subject}, ${STYLE}`, size)

export type Rank = 'SSR' | 'SR' | 'R'

export type Project = {
  id: string
  no: string
  title: string
  titleZh: string
  discipline: string
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
  gallery: string[]
}

export const site = {
  name: 'Your Name',
  initials: 'YN',
  /** 代号：出现在 HUD 与档案编号中 */
  codename: 'OPERATOR-01',
  role: 'Visual Designer',
  roleZh: '视觉设计师',
  city: '[City]',
  /** 页眉时钟使用的 IANA 时区，如 'Asia/Shanghai'；label 为显示缩写 */
  timezone: 'UTC',
  timezoneLabel: 'UTC',
  email: 'hello@example.com',
  availability: 'Online — open for Q1 2027',
  yearRange: '2019—2026',
  wordmark: ['Visual', 'Designer'],
  /** 字标右侧的竖排中文 */
  wordmarkZh: '视觉设计',
  intro:
    'Visual designer building key visuals, game UI and character-driven identities for games, anime and youth-culture brands. Placeholder copy — replace it in src/content.ts.',
  introZh: '视觉设计师，专注游戏 / 二次元方向的主视觉、界面与角色视觉。（占位文案）',
  socials: [
    { label: 'Bilibili', href: '#' },
    { label: 'X / Twitter', href: '#' },
    { label: 'Pixiv', href: '#' },
    { label: 'ArtStation', href: '#' },
    { label: 'Behance', href: '#' },
  ],
}

export const marquee = ['Key Visual', 'Game UI', 'Character Design', 'Motion Graphics', 'Brand Identity', 'Illustration', 'Event Visual']

/** Manifesto: string = 单词，{ img } = 行内图片切片；以 * 开头的词高亮为强调色 */
export const manifesto: (string | { img: string; alt: string })[] = [
  'I', 'design', '*worlds', 'people', 'want', 'to', 'step', 'into', '—',
  { img: art('close up of a glowing orange hud interface overlay on a dark screen, sci-fi typography', 'landscape_4_3'), alt: 'HUD detail' },
  'key', 'visuals,', 'interfaces', 'and', 'characters', 'with',
  { img: art('anime girl silhouette with headphones looking at neon city skyline at night', 'landscape_4_3'), alt: 'Character silhouette' },
  'a', 'rhythm,', 'a', 'signal', 'and', 'a', '*story', 'worth', 'playing.',
]

export const projects: Project[] = [
  {
    id: 'neon-protocol',
    no: '01',
    title: 'Neon Protocol',
    titleZh: '游戏主视觉',
    discipline: 'Key Visual',
    client: 'Client A',
    year: '2026',
    role: 'Art Direction, Key Visual, Logo',
    tools: ['Photoshop', 'Clip Studio', 'After Effects'],
    summary:
      'A launch key visual and logo system for a near-future action game — one hero pose, five layout crops, built to survive every store banner. Placeholder description for your case study.',
    rank: 'SSR',
    cover: art('anime heroine with mechanical arm standing on rooftop of neon cyberpunk city at night, dynamic low angle', 'landscape_4_3'),
    ratio: 'landscape',
    layout: 'a',
    gallery: [
      art('wide game launch banner layout with anime characters, bold title logo, futuristic city background', 'landscape_16_9'),
      art('anime character close up portrait with orange rim light and holographic hud elements', 'square_hd'),
    ],
  },
  {
    id: 'starfall',
    no: '02',
    title: 'Starfall Unit',
    titleZh: '角色视觉设计',
    discipline: 'Character Design',
    client: 'Client B',
    year: '2025',
    role: 'Character Sheet, Costume, Palette',
    tools: ['Clip Studio', 'Photoshop'],
    summary:
      'Six playable characters designed as one squad — shared silhouette rules, a strict palette and a costume language that reads at thumbnail size. Placeholder description for your case study.',
    rank: 'SR',
    cover: art('full body anime character design sheet, girl in tactical jacket with orange accents, turnaround poses, white background', 'portrait_4_3'),
    ratio: 'portrait',
    layout: 'b',
    gallery: [
      art('lineup of six anime characters in matching tactical uniforms, character select screen', 'landscape_4_3'),
      art('anime costume detail sheet, jacket patches, boots, color swatches', 'portrait_4_3'),
    ],
  },
  {
    id: 'hud-07',
    no: '03',
    title: 'HUD//07',
    titleZh: '游戏界面设计',
    discipline: 'Game UI',
    client: 'Self-initiated',
    year: '2025',
    role: 'UI Design, Motion, Design System',
    tools: ['Figma', 'After Effects', 'Unity'],
    summary:
      'A tactical HUD and menu system explored as a design-system exercise: chamfers, scanlines, a 4pt grid and 40 animated components. Placeholder description for your case study.',
    rank: 'SSR',
    cover: art('futuristic game menu ui screen, character portrait on right, orange hud panels, black background', 'portrait_4_3'),
    ratio: 'portrait',
    layout: 'c',
    gallery: [
      art('game inventory interface with item cards, rarity stars, orange and black tactical ui', 'landscape_16_9'),
      art('game ui component sheet, buttons, progress bars, icons, orange accent on dark', 'square_hd'),
    ],
  },
  {
    id: 'afterglow',
    no: '04',
    title: 'Afterglow Fest',
    titleZh: '活动视觉与导视',
    discipline: 'Event Visual',
    client: 'Client C',
    year: '2024',
    role: 'Event Identity, Signage, Merch',
    tools: ['Illustrator', 'Cinema 4D'],
    summary:
      'Visual identity and on-site wayfinding for an anime & game convention — giant numerals, hazard-tape banners and an animated stage loop. Placeholder description for your case study.',
    rank: 'SR',
    cover: art('anime convention stage with huge led screen showing character art, crowd silhouettes, orange stage lights', 'landscape_4_3'),
    ratio: 'landscape',
    layout: 'd',
    gallery: [
      art('event wayfinding banners with bold numbers and hazard stripes in a convention hall', 'landscape_4_3'),
      art('anime event merch, acrylic stands, badges and tote bags on a black table', 'portrait_4_3'),
    ],
  },
  {
    id: 'ripple',
    no: '05',
    title: 'Ripple Records',
    titleZh: '品牌与周边',
    discipline: 'Brand & Merch',
    client: 'Client D',
    year: '2023',
    role: 'Identity, Album Art, Packaging',
    tools: ['Illustrator', 'Blender', 'Photoshop'],
    summary:
      'A virtual-idol music label: a modular logo, album covers drawn as one continuous panorama, and limited-run vinyl packaging. Placeholder description for your case study.',
    rank: 'R',
    cover: art('panoramic anime illustration of virtual idol singer on stage, vinyl record packaging mockup, wide shot', 'landscape_16_9'),
    ratio: 'wide',
    layout: 'e',
    gallery: [
      art('album cover series with anime idol characters, consistent typography layout', 'square_hd'),
      art('vinyl record and cd packaging with anime artwork, studio product shot', 'landscape_4_3'),
    ],
  },
  {
    id: 'glitch-bloom',
    no: '06',
    title: 'Glitch Bloom',
    titleZh: '动态海报实验',
    discipline: 'Motion & Poster',
    client: 'Client E',
    year: '2022',
    role: 'Poster Series, Motion, Creative Code',
    tools: ['After Effects', 'TouchDesigner', 'p5.js'],
    summary:
      'Twelve animated posters where anime portraits are torn apart by RGB-split glitches and rebuilt as halftone dots. Placeholder description for your case study.',
    rank: 'SR',
    cover: art('glitch art anime portrait poster, rgb split, halftone dots, bold japanese style typography layout', 'square_hd'),
    ratio: 'square',
    layout: 'f',
    gallery: [
      art('grid of animated glitch posters with anime faces on a dark wall', 'landscape_4_3'),
      art('macro detail of halftone dots and rgb split glitch on anime illustration', 'square_hd'),
    ],
  },
]

export const about = {
  portrait: art('anime style portrait of a designer from behind wearing headphones at a glowing monitor, face not visible, dark room', 'portrait_4_3'),
  heading: 'Operator Profile',
  headingZh: '干员档案',
  /** 档案卡上的等级/阵营等装饰字段 */
  level: 'LV.80',
  faction: 'Independent Studio',
  body: [
    'Placeholder bio — I am a visual designer working where illustration, interface and motion meet. I help game studios, anime IPs and youth-culture brands build visual worlds that feel alive the moment you press start.',
    'Before going independent I spent several years in game and agency teams leading key visual and UI projects. Replace this paragraph with your own story.',
  ],
  stats: [
    { value: 8, suffix: '+', label: 'Years in play', zh: '从业年限' },
    { value: 120, suffix: '+', label: 'Missions cleared', zh: '完成项目' },
    { value: 14, suffix: '', label: 'Achievements', zh: '奖项与提名' },
    { value: 6, suffix: '', label: 'Regions', zh: '合作地区' },
  ],
  /** 能力雷达：0–1，建议 5–8 项 */
  radar: [
    { label: 'Key Visual', zh: '主视觉', value: 0.94 },
    { label: 'Game UI', zh: '界面', value: 0.88 },
    { label: 'Character', zh: '角色', value: 0.76 },
    { label: 'Motion', zh: '动态', value: 0.84 },
    { label: 'Brand', zh: '品牌', value: 0.7 },
    { label: '3D', zh: '三维', value: 0.58 },
  ],
}

export const capabilities = [
  { name: 'Key Visual & Illustration', zh: '主视觉与插画', desc: 'Launch art, event visuals and banners with one strong idea that survives every crop.', tags: ['KV', 'Banner', 'Layout'] },
  { name: 'Game UI / HUD', zh: '游戏界面', desc: 'Menus, HUDs and design systems that feel like part of the world, not on top of it.', tags: ['HUD', 'Menu', 'System'] },
  { name: 'Character & IP', zh: '角色与 IP', desc: 'Character sheets, costume language and palettes that read at thumbnail size.', tags: ['Sheet', 'Costume'] },
  { name: 'Motion & Live2D', zh: '动态与 Live2D', desc: 'Title sequences, UI motion and rigged illustrations with a recognisable rhythm.', tags: ['Motion', 'Rigging'] },
  { name: 'Brand & Merch', zh: '品牌与周边', desc: 'Logos, packaging and merchandise for labels, idols and fan communities.', tags: ['Logo', 'Merch'] },
  { name: 'Event & Exhibition', zh: '活动与展陈', desc: 'Convention booths, stage screens and wayfinding that guide a crowd.', tags: ['Booth', 'Signage'] },
]

/** 装备卡：swatch 取自设计系统色板 */
export type Swatch = 'accent' | 'cyan' | 'white' | 'steel' | 'black'
export const tools: { name: string; code: string; use: string; level: number; swatch: Swatch }[] = [
  { name: 'Photoshop', code: 'EQ 001', use: 'Paint · Composite', level: 5, swatch: 'accent' },
  { name: 'Clip Studio', code: 'EQ 002', use: 'Illustration', level: 5, swatch: 'white' },
  { name: 'Figma', code: 'EQ 003', use: 'UI · Systems', level: 5, swatch: 'steel' },
  { name: 'Illustrator', code: 'EQ 004', use: 'Vector · Logo', level: 4, swatch: 'black' },
  { name: 'After Effects', code: 'EQ 005', use: 'Motion · Title', level: 4, swatch: 'cyan' },
  { name: 'Live2D', code: 'EQ 006', use: 'Rigging', level: 3, swatch: 'accent' },
  { name: 'Blender', code: 'EQ 007', use: '3D · Scene', level: 3, swatch: 'steel' },
  { name: 'Cinema 4D', code: 'EQ 008', use: '3D · Render', level: 3, swatch: 'white' },
  { name: 'Spine', code: 'EQ 009', use: '2D Animation', level: 3, swatch: 'black' },
  { name: 'Unity', code: 'EQ 010', use: 'UI Implement', level: 2, swatch: 'cyan' },
  { name: 'TouchDesigner', code: 'EQ 011', use: 'Generative', level: 3, swatch: 'accent' },
  { name: 'Procreate', code: 'EQ 012', use: 'Sketch', level: 4, swatch: 'steel' },
]

export const process = [
  { no: '01', name: 'Scout', zh: '调研', desc: 'Worldview, references and player research to find what the visuals must carry.', out: ['Research', 'Brief', 'Moodboard'] },
  { no: '02', name: 'Concept', zh: '概念', desc: 'A clear visual territory — silhouette rules, palette and one sharp idea.', out: ['Concept', 'Rules'] },
  { no: '03', name: 'Craft', zh: '制作', desc: 'Rapid iteration across art, UI and motion until the system clicks.', out: ['Key Visual', 'UI Kit'] },
  { no: '04', name: 'Launch', zh: '交付', desc: 'Polish, guidelines and asset handover so the world stays consistent.', out: ['Guidelines', 'Assets', 'Support'] },
]

export const experience = [
  { period: '2023 — Now', role: 'Independent Visual Designer', place: 'Self-employed', zh: '独立设计师' },
  { period: '2020 — 2023', role: 'Senior Visual Designer', place: 'Game Studio Name', zh: '高级视觉设计师' },
  { period: '2018 — 2020', role: 'UI / Visual Designer', place: 'Agency Name', zh: '界面与视觉设计师' },
  { period: '2014 — 2018', role: 'BFA, Visual Communication', place: 'University Name', zh: '视觉传达 学士' },
]

export const awards = [
  { year: '2026', name: 'Award Name', cat: 'Key Visual — Gold' },
  { year: '2025', name: 'Award Name', cat: 'Game UI — Shortlist' },
  { year: '2024', name: 'Award Name', cat: 'Character — Merit' },
  { year: '2023', name: 'Award Name', cat: 'Event Visual — Silver' },
  { year: '2022', name: 'Award Name', cat: 'Motion Poster — Selected' },
]
