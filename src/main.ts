import '@fontsource-variable/anybody/standard.css'
import '@fontsource-variable/archivo/standard.css'
import '@fontsource/chakra-petch/400.css'
import '@fontsource/chakra-petch/500.css'
import '@fontsource/chakra-petch/600.css'
import '@fontsource/chakra-petch/700.css'
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
import { initHud } from './motion/hud'
import { initCursor, initMagnetic, initTheme, initGrid, initClock, initMenu, initCopyEmail, toast } from './motion/ui'

render()
initScroll()
initAnchors(() => toast('Placeholder link — set it in src/content.ts'))

let halftone: ReturnType<typeof initHalftone> = null
try {
  halftone = initHalftone($<HTMLCanvasElement>('.hero__canvas'))
} catch (err) {
  console.warn('[operator] halftone disabled:', err)
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
initHud()
const caseStudy = initCase()

runIntro(halftone).then(() => {
  ScrollTrigger.refresh()
  caseStudy.openFromHash()
})

// 字体与懒加载图片会改变布局，统一刷新触发点
document.fonts?.ready.then(() => ScrollTrigger.refresh())
window.addEventListener('load', () => ScrollTrigger.refresh())
