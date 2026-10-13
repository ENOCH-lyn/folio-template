/** 运行环境标记：所有动效模块据此降级 */

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel) as T

export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel))

export const pad = (n: number, len = 2) => String(Math.round(n)).padStart(len, '0')

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** 构造带属性与子节点的元素 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> | null = null,
  ...children: (Node | string | null | undefined | false)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)
  if (attrs) for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  for (const c of children) if (c != null && c !== false) el.append(c)
  return el
}

/** 读取 CSS 自定义属性（px 数值） */
export const cssPx = (name: string, el: Element = document.documentElement) =>
  parseFloat(getComputedStyle(el).getPropertyValue(name)) || 0

/** 图片加载完成后添加 is-loaded，触发淡入 */
export function watchImage(img: HTMLImageElement) {
  const done = () => img.classList.add('is-loaded')
  if (img.complete && img.naturalWidth > 0) done()
  else img.addEventListener('load', done, { once: true })
}
