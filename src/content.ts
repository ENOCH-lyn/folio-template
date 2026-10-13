/**
 * 内容配置 —— 模板唯一需要修改的地方。
 * 所有文本、链接、图片均为占位内容，替换为你自己的信息即可。
 * Content config — every string here is placeholder copy.
 */

type ImageSize = 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9'

const img = (prompt: string, size: ImageSize) =>
  `https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`

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
  cover: string
  ratio: 'landscape' | 'portrait' | 'square' | 'wide'
  layout: 'a' | 'b' | 'c' | 'd' | 'e' | 'f'
  gallery: string[]
}

export const site = {
  name: 'Your Name',
  initials: 'YN',
  role: 'Visual Designer',
  roleZh: '视觉设计师',
  city: '[City]',
  /** 页眉时钟使用的 IANA 时区，如 'Asia/Shanghai'；label 为显示缩写 */
  timezone: 'UTC',
  timezoneLabel: 'UTC',
  email: 'hello@example.com',
  availability: 'Available — Q1 2027',
  yearRange: '2019—2026',
  wordmark: ['Visual', 'Designer'],
  intro:
    'Independent visual designer crafting identities, editorial systems and motion languages for culture-driven brands. This is placeholder copy — replace it in src/content.ts.',
  introZh: '独立视觉设计师，专注品牌识别、编辑设计与动态语言。（占位文案）',
  socials: [
    { label: 'Instagram', href: '#' },
    { label: 'Behance', href: '#' },
    { label: 'Dribbble', href: '#' },
    { label: 'LinkedIn', href: '#' },
    { label: 'Are.na', href: '#' },
  ],
}

export const marquee = ['Brand Identity', 'Editorial', 'Motion', 'Type Design', 'Packaging', 'Exhibition', 'Art Direction']

/** Manifesto: string = 单词，{ img } = 行内图片胶囊 */
export const manifesto: (string | { img: string; alt: string })[] = [
  'I', 'design', 'systems', 'that', 'feel', 'inevitable', '—',
  { img: img('close up of bold black typography printed on textured warm paper, letterpress, macro photography', 'landscape_4_3'), alt: 'Typography detail' },
  'identities,', 'editorial', 'grids', 'and', 'moving', 'type',
  { img: img('abstract fluorescent orange gradient shape on beige background, minimal 3d render, soft light', 'landscape_4_3'), alt: 'Abstract form' },
  'that', 'give', 'ideas', 'a', 'shape,', 'a', 'rhythm', 'and', 'a', 'voice', 'worth', 'remembering.',
]

export const projects: Project[] = [
  {
    id: 'halcyon',
    no: '01',
    title: 'Halcyon',
    titleZh: '品牌识别系统',
    discipline: 'Brand Identity',
    client: 'Client A',
    year: '2026',
    role: 'Creative Direction, Identity, Guidelines',
    tools: ['Figma', 'Illustrator', 'Glyphs'],
    summary:
      'A modular identity built on a single variable glyph that adapts across packaging, signage and digital touchpoints. Placeholder description for your case study.',
    cover: img('minimalist brand identity mockup, business cards and letterhead on warm grey paper, fluorescent orange accent, overhead studio shot, soft shadows, high detail', 'landscape_4_3'),
    ratio: 'landscape',
    layout: 'a',
    gallery: [
      img('brand guidelines book open on concrete table, swiss grid layout pages, black and orange, natural window light', 'landscape_16_9'),
      img('tote bag and stickers with bold geometric logo, black and fluorescent orange, flat lay on beige paper', 'square_hd'),
    ],
  },
  {
    id: 'north-archive',
    no: '02',
    title: 'North Archive',
    titleZh: '出版与编辑设计',
    discipline: 'Editorial Design',
    client: 'Client B',
    year: '2025',
    role: 'Art Direction, Layout, Typesetting',
    tools: ['InDesign', 'Photoshop'],
    summary:
      'A 320-page archival publication with a rigorous 12-column grid and expressive typographic openers. Placeholder description for your case study.',
    cover: img('editorial magazine spread with bold swiss typography and large black and white photograph, open book on light grey surface, overhead', 'portrait_4_3'),
    ratio: 'portrait',
    layout: 'b',
    gallery: [
      img('stack of art books with minimal typographic covers, off-white and black, studio photography, soft daylight', 'landscape_4_3'),
      img('close up of book binding and paper edges, editorial design detail, warm tones, macro', 'portrait_4_3'),
    ],
  },
  {
    id: 'kinetic',
    no: '03',
    title: 'Kinetic Type Lab',
    titleZh: '动态字体实验',
    discipline: 'Motion & Type',
    client: 'Self-initiated',
    year: '2025',
    role: 'Concept, Motion, Type Design',
    tools: ['After Effects', 'Glyphs', 'TouchDesigner'],
    summary:
      'An ongoing study of variable fonts in motion — letterforms that stretch, breathe and respond to sound. Placeholder description for your case study.',
    cover: img('abstract 3d kinetic typography, stretched chrome letters on beige background, motion blur, soft studio lighting, minimal', 'portrait_4_3'),
    ratio: 'portrait',
    layout: 'c',
    gallery: [
      img('large led screen showing bold animated black typography in white gallery space, people silhouettes, architectural photography', 'landscape_16_9'),
      img('sequence of distorted letterforms printed as posters, black on white, grid arrangement, studio photo', 'square_hd'),
    ],
  },
  {
    id: 'meridian',
    no: '04',
    title: 'Meridian',
    titleZh: '展览与导视',
    discipline: 'Exhibition & Wayfinding',
    client: 'Client C',
    year: '2024',
    role: 'Spatial Graphics, Signage System',
    tools: ['Illustrator', 'Cinema 4D'],
    summary:
      'Wayfinding and exhibition graphics for a contemporary art space, using oversized numerals as spatial anchors. Placeholder description for your case study.',
    cover: img('exhibition wayfinding signage in white contemporary gallery, oversized black numerals on wall, architectural photography, clean light', 'landscape_4_3'),
    ratio: 'landscape',
    layout: 'd',
    gallery: [
      img('gallery entrance with large vinyl typography on glass wall, fluorescent orange accents, architectural photography', 'landscape_4_3'),
      img('directional signage detail with arrows and numbers, black and white, minimal, close up', 'portrait_4_3'),
    ],
  },
  {
    id: 'monolith',
    no: '05',
    title: 'Monolith',
    titleZh: '包装设计',
    discipline: 'Packaging',
    client: 'Client D',
    year: '2023',
    role: 'Packaging, Illustration, Print Production',
    tools: ['Illustrator', 'Blender', 'Photoshop'],
    summary:
      'A monochrome packaging family where each product is distinguished only by a fluorescent band and typographic scale. Placeholder description for your case study.',
    cover: img('premium minimalist packaging boxes, matte black and off-white with fluorescent orange labels, studio product photography, hard shadows, wide shot', 'landscape_16_9'),
    ratio: 'wide',
    layout: 'e',
    gallery: [
      img('minimal cosmetic bottles with bold typography labels, beige background, soft studio light, product photography', 'square_hd'),
      img('packaging dieline and printed proofs on designer desk, overhead, warm light', 'landscape_4_3'),
    ],
  },
  {
    id: 'overprint',
    no: '06',
    title: 'Overprint',
    titleZh: '海报与印刷实验',
    discipline: 'Print & Poster',
    client: 'Client E',
    year: '2022',
    role: 'Poster Series, Risograph Printing',
    tools: ['Risograph', 'Illustrator', 'p5.js'],
    summary:
      'A series of two-colour risograph posters exploring misregistration as a deliberate graphic language. Placeholder description for your case study.',
    cover: img('risograph printed posters pinned on white wall, halftone texture, fluorescent orange and blue inks, overprint, editorial photography', 'square_hd'),
    ratio: 'square',
    layout: 'f',
    gallery: [
      img('risograph printer machine in design studio with stacks of colorful prints, soft daylight, documentary photography', 'landscape_4_3'),
      img('macro detail of risograph halftone dots blue and orange overprint on paper', 'square_hd'),
    ],
  },
]

export const about = {
  portrait: img('silhouette of a designer working at a desk in a sunlit studio, backlit, face not visible, film grain, warm muted tones, editorial photography', 'portrait_4_3'),
  heading: 'Form follows feeling.',
  headingZh: '形式追随感受',
  body: [
    'Placeholder bio — I am a visual designer working at the intersection of typography, systems and motion. I partner with studios, cultural institutions and founders to build visual languages that scale without losing their soul.',
    'Before going independent I spent several years in studio environments leading identity and editorial projects. Replace this paragraph with your own story.',
  ],
  stats: [
    { value: 8, suffix: '+', label: 'Years of practice', zh: '从业年限' },
    { value: 120, suffix: '+', label: 'Projects shipped', zh: '完成项目' },
    { value: 14, suffix: '', label: 'Awards & mentions', zh: '奖项与提名' },
    { value: 6, suffix: '', label: 'Countries', zh: '合作国家' },
  ],
}

export const capabilities = [
  { name: 'Brand Identity', zh: '品牌识别', desc: 'Strategy-led logo systems, typography, colour and guidelines that hold up across every touchpoint.', tags: ['Naming', 'Logo', 'Guidelines'] },
  { name: 'Editorial & Print', zh: '编辑与印刷', desc: 'Books, magazines and printed matter built on rigorous grids and expressive typesetting.', tags: ['Books', 'Grids', 'Production'] },
  { name: 'Motion & Kinetic Type', zh: '动态与字体动画', desc: 'Motion principles and animated type systems that give brands a recognisable rhythm.', tags: ['Motion system', 'Title design'] },
  { name: 'Digital Product', zh: '数字产品视觉', desc: 'Interface art direction and design systems translating identity into product.', tags: ['UI', 'Design tokens'] },
  { name: 'Packaging', zh: '包装设计', desc: 'Structural and graphic packaging from concept to press check.', tags: ['Dielines', 'Print finishing'] },
  { name: 'Exhibition & Wayfinding', zh: '展览与导视', desc: 'Spatial graphics and signage that guide, inform and delight.', tags: ['Signage', 'Spatial'] },
]

/** 工具色卡：swatch 取自设计系统色板 */
export const tools: { name: string; code: string; use: string; level: number; swatch: 'ink' | 'signal' | 'overprint' | 'paper' | 'mid' }[] = [
  { name: 'Figma', code: 'TL 001 C', use: 'Interface · Systems', level: 5, swatch: 'ink' },
  { name: 'Illustrator', code: 'TL 002 C', use: 'Vector · Identity', level: 5, swatch: 'signal' },
  { name: 'InDesign', code: 'TL 003 C', use: 'Editorial · Layout', level: 5, swatch: 'mid' },
  { name: 'Photoshop', code: 'TL 004 C', use: 'Image · Retouch', level: 4, swatch: 'paper' },
  { name: 'After Effects', code: 'TL 005 C', use: 'Motion · Type', level: 4, swatch: 'overprint' },
  { name: 'Cinema 4D', code: 'TL 006 C', use: '3D · Render', level: 3, swatch: 'ink' },
  { name: 'Blender', code: 'TL 007 C', use: '3D · Product', level: 3, swatch: 'mid' },
  { name: 'Glyphs', code: 'TL 008 C', use: 'Type Design', level: 4, swatch: 'signal' },
  { name: 'TouchDesigner', code: 'TL 009 C', use: 'Generative', level: 3, swatch: 'paper' },
  { name: 'p5.js', code: 'TL 010 C', use: 'Creative Code', level: 3, swatch: 'overprint' },
  { name: 'Spline', code: 'TL 011 C', use: 'Web 3D', level: 3, swatch: 'ink' },
  { name: 'Risograph', code: 'TL 012 C', use: 'Print · Craft', level: 4, swatch: 'signal' },
]

export const process = [
  { no: '01', name: 'Listen', zh: '倾听', desc: 'Workshops, research and audits to find the tension worth designing for.', out: ['Research', 'Brief', 'Moodboard'] },
  { no: '02', name: 'Frame', zh: '定义', desc: 'A clear creative territory — principles, references and a single sharp idea.', out: ['Concept', 'Principles'] },
  { no: '03', name: 'Make', zh: '创作', desc: 'Rapid iteration across type, colour, image and motion until the system clicks.', out: ['Identity', 'Prototypes'] },
  { no: '04', name: 'Refine', zh: '打磨', desc: 'Obsessive detailing, guidelines and handover so the work keeps its integrity.', out: ['Guidelines', 'Assets', 'Support'] },
]

export const experience = [
  { period: '2023 — Now', role: 'Independent Visual Designer', place: 'Self-employed', zh: '独立设计师' },
  { period: '2020 — 2023', role: 'Senior Visual Designer', place: 'Studio Name', zh: '高级视觉设计师' },
  { period: '2018 — 2020', role: 'Visual Designer', place: 'Agency Name', zh: '视觉设计师' },
  { period: '2014 — 2018', role: 'BFA, Visual Communication', place: 'University Name', zh: '视觉传达 学士' },
]

export const awards = [
  { year: '2026', name: 'Award Name', cat: 'Brand Identity — Gold' },
  { year: '2025', name: 'Award Name', cat: 'Editorial Design — Shortlist' },
  { year: '2024', name: 'Award Name', cat: 'Typography — Merit' },
  { year: '2023', name: 'Award Name', cat: 'Packaging — Silver' },
  { year: '2022', name: 'Award Name', cat: 'Poster — Selected' },
]
