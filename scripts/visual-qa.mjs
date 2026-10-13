/**
 * 视觉验收脚本：多断点 × 双主题截图 + 交互态 + 控制台错误收集
 * 用法：npm run build && npx vite preview --port 4173 & npm run qa
 * 输出：qa/shots/*.png 与 qa/report.json
 */
import puppeteer from 'puppeteer-core'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const BASE = process.env.QA_URL ?? 'http://localhost:4173/'
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUT = 'qa/shots'
const ONLY = process.env.QA_ONLY // 例如 "1440-light"

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900, mobile: false },
  { name: '1024', width: 1024, height: 768, mobile: false },
  { name: '390', width: 390, height: 844, mobile: true },
]
const THEMES = ['light', 'dark']

const SECTIONS = ['.manifesto', '#work', '#about', '#capabilities', '#toolkit', '#process', '#experience', '#contact', '.footer']

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * 预热图片：文生图接口是异步生成的，未就绪时 302 到 default.jpeg（「生成中」占位图）。
 * 轮询直到全部就绪或超时（QA_WARM_TIMEOUT 秒，默认 300）。
 */
async function warmImages() {
  const src = await readFile('src/content.ts', 'utf8')
  const style = src.match(/const STYLE = '([^']+)'/)?.[1] ?? ''
  const prompts = [...src.matchAll(/\b(img|art)\('([^']+)',\s*'([a-z_0-9]+)'\)/g)].map(
    ([, fn, raw, s]) => [fn === 'art' ? `${raw}, ${style}` : raw, s],
  ).map(
    ([p, s]) => `https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=${encodeURIComponent(p)}&image_size=${s}`,
  )
  const ready = (u) =>
    fetch(u, { redirect: 'manual' })
      .then((r) => !(r.headers.get('location') ?? '').includes('default.jpeg'))
      .catch(() => false)
  const deadline = Date.now() + Number(process.env.QA_WARM_TIMEOUT ?? 300) * 1000
  for (;;) {
    const ok = (await Promise.all(prompts.map(ready))).filter(Boolean).length
    console.log(`warm: ${ok}/${prompts.length} images generated`)
    if (ok === prompts.length || Date.now() > deadline) return ok === prompts.length
    await sleep(15000)
  }
}

async function scrollToSel(page, sel, offset = 0) {
  await page.evaluate(
    async (sel, offset) => {
      const el = document.querySelector(sel)
      if (!el) return
      const y = el.getBoundingClientRect().top + window.scrollY + offset
      window.scrollTo(0, y)
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    },
    sel,
    offset,
  )
}

/** 逐段滚过整页，确保所有一次性 reveal 都已触发 */
async function sweep(page) {
  await page.evaluate(async () => {
    const H = document.documentElement.scrollHeight
    for (let y = 0; y < H; y += window.innerHeight * 0.6) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 60))
    }
    window.scrollTo(0, 0)
  })
  await sleep(400)
}

async function run() {
  await mkdir(OUT, { recursive: true })
  if (!process.env.QA_SKIP_WARM) await warmImages()

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--hide-scrollbars', '--force-color-profile=srgb'],
  })
  const report = []

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      const key = `${vp.name}-${theme}`
      if (ONLY && !ONLY.split(',').includes(key)) continue
      const page = await browser.newPage()
      const errors = []
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
      page.on('pageerror', (e) => errors.push(String(e)))
      page.on('requestfailed', (r) => !r.url().includes('text_to_image') && errors.push(`requestfailed ${r.url()}`))

      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1, isMobile: vp.mobile, hasTouch: vp.mobile })
      await page.evaluateOnNewDocument((t) => localStorage.setItem('operator-theme', t), theme)
      const t0 = Date.now()
      await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 })
      await page.waitForFunction(() => !document.querySelector('.loader') && document.documentElement.classList.contains('is-ready'), { timeout: 20000 })
      const introMs = Date.now() - t0
      await sleep(2400)

      // captureBeyondViewport:false —— 避免截图时临时改视口导致 fixed 元素被平铺重复
      const shot = (name) => page.screenshot({ path: `${OUT}/${key}-${name}.png`, captureBeyondViewport: false })

      // Hero（含光标交互态）
      await shot('00-hero')
      if (!vp.mobile) {
        await page.mouse.move(vp.width * 0.3, vp.height * 0.62)
        await page.mouse.move(vp.width * 0.36, vp.height * 0.6, { steps: 12 })
        await sleep(900)
        await shot('01-hero-hover')
      }

      await sweep(page)

      // 各区块
      let i = 2
      for (const sel of SECTIONS) {
        const off = sel === '#process' && vp.width >= 900 ? 'mid' : 0
        if (off === 'mid') {
          await page.evaluate(() => {
            const sec = document.querySelector('#process')
            const spacer = sec.querySelector('.pin-spacer') ?? sec
            const top = sec.getBoundingClientRect().top + window.scrollY
            window.scrollTo(0, top + (spacer.offsetHeight - window.innerHeight) * 0.55)
          })
        } else {
          await scrollToSel(page, sel, sel === '.footer' ? -vp.height * 0.4 : -1)
        }
        await sleep(1700)
        await shot(`${String(i++).padStart(2, '0')}-${sel.replace(/[#.]/g, '')}`)
      }

      // 网格叠层
      if (!vp.mobile) {
        await scrollToSel(page, '#work')
        await sleep(600)
        await page.keyboard.press('g')
        await sleep(1300)
        await shot('20-grid-overlay')
        await page.keyboard.press('g')
        await sleep(1000)
      }

      // Index 视图 + 悬停预览
      await scrollToSel(page, '#work')
      await sleep(500)
      await page.click('[data-view="index"]')
      await sleep(1700)
      await shot('21-index')
      if (!vp.mobile) {
        const box = await page.evaluate(() => {
          const r = document.querySelectorAll('.is-index .card__link')[2].getBoundingClientRect()
          return { x: r.left + r.width * 0.45, y: r.top + r.height / 2 }
        })
        await page.mouse.move(box.x - 60, box.y)
        await page.mouse.move(box.x, box.y, { steps: 10 })
        await sleep(1100)
        await shot('22-index-hover')
        await page.mouse.move(5, 5)
      }
      await page.click('[data-view="grid"]')
      await sleep(1600)
      await shot('23-grid-back')

      // 案例详情
      await scrollToSel(page, '#work')
      await sleep(400)
      await page.evaluate(() => document.querySelector('.card__link').click())
      await sleep(2300)
      await shot('24-case')
      await page.evaluate(() => (document.querySelector('.case__scroll').scrollTop = window.innerHeight * 0.9))
      await sleep(600)
      await shot('25-case-body')
      const caseFocus = await page.evaluate(() => document.activeElement?.className ?? '')
      await page.keyboard.press('Escape')
      await sleep(1400)
      const afterClose = await page.evaluate(() => ({
        open: document.querySelector('.case').classList.contains('is-open'),
        focus: document.activeElement?.className ?? '',
      }))

      // 移动端菜单
      if (vp.mobile) {
        await page.click('[data-menu-toggle]')
        await sleep(1400)
        await shot('26-menu')
        await page.click('[data-menu-toggle]')
        await sleep(900)
      }

      // 结构检查：横向溢出、字标是否撑满
      const checks = await page.evaluate(() => {
        const doc = document.documentElement
        const wm = document.querySelector('.wordmark')
        const line = document.querySelector('.wordmark__line[data-line="1"]')
        const r = document.createRange()
        r.selectNodeContents(line)
        const overflowers = [...document.querySelectorAll('body *')]
          .filter((el) => {
            const b = el.getBoundingClientRect()
            return b.width > 0 && b.right > doc.clientWidth + 1 && !el.closest('.marquee, .process, .preview, .grain, .footer__giant, .case, .cursor, .menu, .toast, .loader, .hero__frame, .scanlines')
          })
          .slice(0, 8)
          .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} < ${el.parentElement?.className} "${el.textContent.trim().slice(0, 24)}" right=${Math.round(el.getBoundingClientRect().right)}`)
        const imgs = [...document.querySelectorAll('main img')]
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          overflowers,
          wordmarkFill: +(r.getBoundingClientRect().width / wm.clientWidth).toFixed(3),
          imagesLoaded: `${imgs.filter((i) => i.complete && i.naturalWidth).length}/${imgs.length}`,
          webgl: !!document.querySelector('.hero__canvas'),
        }
      })

      report.push({ key, introMs, errors, caseFocus, afterClose, ...checks })
      console.log(key, JSON.stringify({ introMs, errors: errors.length, ...checks, caseFocus, afterClose }))
      await page.close()
    }
  }

  // 减弱动效模式
  if (!ONLY || ONLY.includes('reduced')) {
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
    await page.setViewport({ width: 1440, height: 900 })
    await page.goto(BASE, { waitUntil: 'networkidle2' })
    await sleep(1200)
    await page.screenshot({ path: `${OUT}/reduced-00-hero.png` })
    await scrollToSel(page, '#toolkit')
    await sleep(600)
    await page.screenshot({ path: `${OUT}/reduced-01-toolkit.png` })
    report.push({ key: 'reduced-motion', errors })
    console.log('reduced-motion', JSON.stringify({ errors }))
    await page.close()
  }

  await browser.close()
  const prev = existsSync('qa/report.json') && ONLY ? JSON.parse(await readFile('qa/report.json', 'utf8')) : []
  const merged = [...prev.filter((p) => !report.some((r) => r.key === p.key)), ...report]
  await writeFile('qa/report.json', JSON.stringify(merged, null, 2))
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
