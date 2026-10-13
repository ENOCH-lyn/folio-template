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
      page.on('requestfailed', (r) => errors.push(`requestfailed ${r.url()}`))

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

      // 装备卡扇：悬停后移开，应回到均匀展开的静止态（无中间态残留）
      let fanReset = null
      if (!vp.mobile) {
        // 先把指针移到空白处，避免上一步残留的指针位置让基准态处于悬停
        await page.mouse.move(8, vp.height / 2)
        await scrollToSel(page, '#toolkit .toolkit__grid', -vp.height * 0.2)
        await sleep(1500)
        const rest = await page.$$eval('.chip', (cs) => cs.map((c) => c.style.transform))
        const b = await page.evaluate(() => {
          const r = document.querySelectorAll('.chip')[4].getBoundingClientRect()
          return { x: r.left + r.width / 2, y: r.top + 30 }
        })
        await page.mouse.move(b.x, b.y, { steps: 6 })
        await sleep(800)
        await shot('27-toolkit-hover')
        await page.mouse.move(8, vp.height / 2, { steps: 6 })
        await sleep(1400)
        const after = await page.$$eval('.chip', (cs) => cs.map((c) => c.style.transform))
        // 缓动收敛存在亚像素浮点尾差：按数值容差比较
        const nums = (t) => (t.match(/-?\d+(\.\d+)?/g) || []).map(Number)
        fanReset = rest.every((t, k) => {
          const a = nums(t), b2 = nums(after[k])
          return a.length === b2.length && a.every((v, j) => Math.abs(v - b2[j]) < 0.5)
        })
        if (!fanReset) console.log('fan diff', rest.slice(0, 3), after.slice(0, 3))
        await shot('28-toolkit-leave')
      }

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
            return b.width > 0 && b.right > doc.clientWidth + 1 && !el.closest('.marquee, .process, .preview, .footer__giant, .kv, .case, .cursor, .menu, .toast, .loader, .hero__frame, .scanlines')
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

      report.push({ key, introMs, errors, caseFocus, afterClose, fanReset, ...checks })
      console.log(key, JSON.stringify({ introMs, errors: errors.length, ...checks, caseFocus, afterClose, fanReset }))
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
