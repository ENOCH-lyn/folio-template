import '@fontsource-variable/bricolage-grotesque/standard.css'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource-variable/jetbrains-mono/index.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/sections.css'

import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $ } from './env'
import { render } from './render'
import { initScroll, initAnchors } from './motion/scroll'
import { initHalftone } from './motion/halftone'
import { initWordmark } from './motion/wordmark'
import { runIntro } from './motion/intro'
import { initReveals } from './motion/reveal'
import { initWorks } from './motion/works'
import { initCase } from './motion/case'
import { initToolkit } from './motion/toolkit'
import { initProcess } from './motion/process'
import { initCursor, initMagnetic, initTheme, initGrid, initClock, initMenu, initCopyEmail, toast } from './motion/ui'

render()
initScroll()
initAnchors(() => toast('Placeholder link — set it in src/content.ts'))

let halftone: ReturnType<typeof initHalftone> = null
try {
  halftone = initHalftone($<HTMLCanvasElement>('.hero__canvas'))
} catch (err) {
  console.warn('[proof] halftone disabled:', err)
}

initWordmark()
initTheme(() => halftone?.refreshTheme())
initCursor()
initMagnetic()
initGrid()
initClock()
initMenu()
initCopyEmail()
initWorks()
initToolkit()
initProcess()
initReveals()
const caseStudy = initCase()

runIntro(halftone).then(() => {
  ScrollTrigger.refresh()
  caseStudy.openFromHash()
})

// 字体与懒加载图片会改变布局，统一刷新触发点
document.fonts?.ready.then(() => ScrollTrigger.refresh())
window.addEventListener('load', () => ScrollTrigger.refresh())
