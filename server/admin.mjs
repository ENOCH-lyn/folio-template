/**
 * 内容管理后台（零依赖）：可视化编辑 content/site.json、上传图片到 public/images、一键构建。
 * 用法：npm run admin  →  http://localhost:5174
 * 仅监听 127.0.0.1；如需远程访问请自行加反向代理与鉴权，或设置 ADMIN_TOKEN。
 */
import { createServer } from 'node:http'
import { readFile, writeFile, readdir, mkdir, copyFile, stat, unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { join, extname, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = join(ROOT, 'content/site.json')
const BACKUPS = join(ROOT, 'content/.backups')
const IMAGES = join(ROOT, 'public/images')
const PAGE = join(ROOT, 'server/admin.html')
const PORT = Number(process.env.ADMIN_PORT ?? 5174)
const HOST = process.env.ADMIN_HOST ?? '127.0.0.1'
const TOKEN = process.env.ADMIN_TOKEN ?? ''
const MAX_UPLOAD = 12 * 1024 * 1024
const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg'])
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif', '.svg': 'image/svg+xml' }

const send = (res, code, body, type = 'application/json; charset=utf-8') => {
  res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' })
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body))
}

const readBody = (req, limit) =>
  new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (c) => {
      size += c.length
      if (size > limit) {
        reject(Object.assign(new Error('文件过大'), { code: 413 }))
        req.destroy()
      } else chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })

/** 文件名白名单：只保留字母数字、- _ .，防止路径穿越 */
const safeName = (name) => {
  const ext = extname(name).toLowerCase()
  const stem = basename(name, extname(name)).normalize('NFKD').replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'image'
  return { stem, ext }
}

async function saveContent(data) {
  // 基本结构校验：缺少关键字段时拒绝写入，避免页面白屏
  for (const k of ['site', 'sections', 'projects', 'about', 'tools']) if (!(k in data)) throw new Error(`缺少字段：${k}`)
  if (!Array.isArray(data.projects) || !data.projects.length) throw new Error('至少需要 1 个作品')
  await mkdir(BACKUPS, { recursive: true })
  if (existsSync(CONTENT)) await copyFile(CONTENT, join(BACKUPS, `site-${new Date().toISOString().replace(/[:.]/g, '-')}.json`))
  // 只保留最近 20 份备份
  const olds = (await readdir(BACKUPS)).filter((f) => f.endsWith('.json')).sort()
  for (const f of olds.slice(0, Math.max(0, olds.length - 20))) await unlink(join(BACKUPS, f))
  await writeFile(CONTENT, JSON.stringify(data, null, 2) + '\n')
}

let building = false
const build = () =>
  new Promise((resolve) => {
    building = true
    const p = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], { cwd: ROOT })
    let log = ''
    p.stdout.on('data', (d) => (log += d))
    p.stderr.on('data', (d) => (log += d))
    p.on('close', (code) => {
      building = false
      resolve({ ok: code === 0, log: log.split('\n').slice(-30).join('\n') })
    })
  })

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const path = decodeURIComponent(url.pathname)
  try {
    if (path === '/' || path === '/index.html') return send(res, 200, await readFile(PAGE), 'text/html; charset=utf-8')

    // 预览图片：public/images 下的文件
    if (req.method === 'GET' && path.startsWith('/images/')) {
      const { stem, ext } = safeName(path.slice(8))
      const file = join(IMAGES, stem + ext)
      if (!IMG_EXT.has(ext) || !existsSync(file)) return send(res, 404, { error: 'not found' })
      return send(res, 200, await readFile(file), MIME[ext])
    }

    if (!path.startsWith('/api/')) return send(res, 404, { error: 'not found' })
    if (TOKEN && req.headers['x-admin-token'] !== TOKEN) return send(res, 401, { error: '需要令牌（ADMIN_TOKEN）' })

    if (path === '/api/content' && req.method === 'GET') return send(res, 200, await readFile(CONTENT))
    if (path === '/api/content' && req.method === 'PUT') {
      const data = JSON.parse((await readBody(req, 2 * 1024 * 1024)).toString('utf8'))
      await saveContent(data)
      return send(res, 200, { ok: true, savedAt: new Date().toISOString() })
    }

    if (path === '/api/images' && req.method === 'GET') {
      await mkdir(IMAGES, { recursive: true })
      const files = (await readdir(IMAGES)).filter((f) => IMG_EXT.has(extname(f).toLowerCase())).sort()
      const list = await Promise.all(files.map(async (f) => ({ name: f, src: `images/${f}`, size: (await stat(join(IMAGES, f))).size })))
      return send(res, 200, list)
    }

    if (path === '/api/upload' && req.method === 'POST') {
      const { stem, ext } = safeName(url.searchParams.get('name') ?? '')
      if (!IMG_EXT.has(ext)) return send(res, 400, { error: `不支持的格式：${ext || '无扩展名'}` })
      const buf = await readBody(req, MAX_UPLOAD)
      if (!buf.length) return send(res, 400, { error: '空文件' })
      await mkdir(IMAGES, { recursive: true })
      // 重名时追加序号，避免覆盖已有作品图
      let name = stem + ext
      for (let i = 2; existsSync(join(IMAGES, name)); i++) name = `${stem}-${i}${ext}`
      await writeFile(join(IMAGES, name), buf)
      return send(res, 200, { ok: true, src: `images/${name}` })
    }

    if (path === '/api/build' && req.method === 'POST') {
      if (building) return send(res, 409, { error: '正在构建中' })
      return send(res, 200, await build())
    }

    send(res, 404, { error: 'not found' })
  } catch (e) {
    send(res, e.code === 413 ? 413 : 400, { error: e instanceof SyntaxError ? `JSON 格式错误：${e.message}` : e.message })
  }
})

server.listen(PORT, HOST, () => {
  console.log(`\n  内容后台已启动  →  http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`)
  console.log(`  编辑文件：content/site.json   图片目录：public/images`)
  console.log(`  同时运行 npm run dev 可实时预览（保存后自动刷新）\n`)
})
