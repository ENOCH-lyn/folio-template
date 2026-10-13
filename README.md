# PROOF — 视觉设计师作品集模板

一个面向视觉设计师的单页作品集模板，纯前端实现。视觉概念为 **PROOF（打样）**：Swiss Grid × Riso Ink × Print Marks，把一份作品集当成一张交付给世界的印刷打样稿来设计。

> 页面里所有文字、链接、图片都是**占位内容**（Your Name、hello@example.com、[City]、Client A…），不含任何真实个人信息。只需修改一个文件即可换成你自己的内容。

## 亮点

| 模块 | 交互 / 动效 |
|------|-------------|
| Hero | WebGL 双色版半调网点场（橙 45° / 蓝 15°，带套准偏移），随时间流动，光标经过处网点膨胀（「Move to lift the ink」）；字标用可变字体的 `wght` / `wdth` 轴随光标距离「呼吸」 |
| 预加载 | 网点从右向左「显影」，字标逐行压印 |
| 宣言 | 逐词随滚动显墨，文字中嵌入圆形图片胶囊 |
| 作品 | 不对称 6 版式网格；hover 时出现裁切线和套准标记；「Grid ⇄ Index」视图用 GSAP Flip 平滑重排；索引视图 hover 时荧光橙铺满整行，大图跟随光标并按速度倾斜 |
| 案例页 | 封面从卡片位置 FLIP 放大成全屏面板；支持 `#project-id` 深链接；`Esc` 关闭，焦点回到原卡片 |
| 工具 | 仿 Pantone 色卡扇：滚动时像从手里摊开，悬停 / 点击选中，网点密度表示熟练度 |
| 流程 | 横向钉住滚动（Pin） |
| 全局 | 自定义光标、磁吸按钮、Lenis 平滑滚动、左下角 Folio 页码随区块切换、滚动进度、跑马灯速度由滚动驱动、纸张颗粒噪点 |
| 主题 | Paper（亮）/ Darkroom（暗），用 View Transitions 以按钮为圆心圆形扩散切换，选择会被记住 |
| 自检 | 按 `G` 键打开 12 栏栅格叠层，可随时检查对齐 |

## 技术栈

- **Vite 8** + **TypeScript**（无框架，原生 DOM，产物约 80 kB gzip JS）
- **GSAP 3**：ScrollTrigger / SplitText / Flip
- **Lenis**：平滑滚动
- **WebGL**：手写片元着色器实现半调网点
- **@fontsource**：Bricolage Grotesque Variable、Instrument Serif、JetBrains Mono Variable，全部本地打包（均为 OFL 授权，不依赖外部 CDN）

## 快速开始

```bash
npm install
npm run dev        # 开发服务器
npm run build      # 类型检查 + 生产构建，输出到 dist/
npm run preview    # 本地预览生产构建
```

`dist/` 是纯静态文件，可以直接部署到任何静态托管服务。

## 替换为你的内容

**只需要修改 [src/content.ts](./src/content.ts)**，页面结构由 [src/render.ts](./src/render.ts) 根据它自动生成。

| 导出 | 内容 |
|------|------|
| `site` | 姓名、缩写、职位、城市、时区（页眉时钟）、邮箱、可接单状态、Hero 字标两行文字、简介、社交链接 |
| `marquee` | 跑马灯关键词 |
| `manifesto` | 宣言：字符串表示单词，`{ img, alt }` 表示行内图片胶囊 |
| `projects` | 作品列表：标题、中文名、领域、客户、年份、角色、工具、摘要、封面、比例、版式 `a`–`f`、案例图集 |
| `about` | 肖像、标题、正文段落、数字统计 |
| `capabilities` | 能力项 |
| `tools` | 工具色卡：名称、编号、用途、熟练度 `1–5`、色板（`ink` / `signal` / `overprint` / `paper` / `mid`） |
| `process` | 工作流程四步 |
| `experience` / `awards` | 经历与奖项 |

**图片**：模板默认通过 `img(prompt, size)` 调用 AI 文生图接口生成占位图。首次访问时接口可能先返回「The image is generating… Please refresh page」，生成完成后刷新即可。换成自己的作品时，把 `img(...)` 直接替换为图片 URL 或 `/images/xxx.jpg`（放在 `public/images/` 下）即可。

**品牌色 / 字体 / 间距**：统一在 [src/styles/tokens.css](./src/styles/tokens.css) 修改，规则见设计规范。

## 目录结构

```text
folio-template/
├── index.html              # 页面骨架（语义化结构 + 首帧主题恢复）
├── public/favicon.svg
├── src/
│   ├── content.ts          # ★ 唯一需要修改的内容配置
│   ├── render.ts           # 根据 content 渲染各区块
│   ├── main.ts             # 入口：按顺序初始化各模块
│   ├── env.ts              # 工具函数、设备能力探测（reduced motion / 精确指针）
│   ├── motion/
│   │   ├── halftone.ts     # WebGL 半调网点场
│   │   ├── wordmark.ts     # Hero 字标适配 + 可变字体呼吸
│   │   ├── intro.ts        # 预加载与入场
│   │   ├── scroll.ts       # Lenis + 锚点
│   │   ├── reveal.ts       # Rise / Rule / Develop 进入动效、Folio 页码
│   │   ├── works.ts        # 作品网格 ⇄ 索引（Flip）、悬停预览
│   │   ├── case.ts         # 案例页转场、焦点管理、深链接
│   │   ├── toolkit.ts      # 色卡扇
│   │   ├── process.ts      # 横向钉住滚动
│   │   └── ui.ts           # 光标、磁吸、主题、栅格叠层、时钟、移动端菜单、复制邮箱
│   └── styles/
│       ├── tokens.css      # 设计 token
│       ├── base.css        # 全局排版与固定元素
│       └── sections.css    # 区块与组件
├── docs/
│   ├── DESIGN_SYSTEM.md    # 视觉设计规范
│   └── VISUAL_QA.md        # 视觉验收记录
├── scripts/visual-qa.mjs   # 自动化截图与指标采集
└── qa/report.json          # 最近一次验收结果
```

## 文档

- [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md)：设计原则、色彩、字体、网格、间距、动效词汇表、组件、图像、文案语气、无障碍
- [docs/VISUAL_QA.md](./docs/VISUAL_QA.md)：验收矩阵、自动化指标、人工审图清单、问题与修复记录

## 视觉验收

```bash
npm run build
npm run preview -- --port 4173 --strictPort   # 另开一个终端
npm run qa                                    # 3 个视口 × 2 个主题 + reduced motion
```

截图输出到 `qa/shots/`（不入库），指标写入 `qa/report.json`。脚本需要本机安装 Chrome，路径可以通过 `CHROME_PATH` 指定。更多参数见 [docs/VISUAL_QA.md](./docs/VISUAL_QA.md)。

## 快捷键

| 键 | 作用 |
|----|------|
| `G` | 打开 / 关闭栅格叠层 |
| `Esc` | 关闭案例页 / 移动端菜单 |
| `Tab` | 案例页打开时，焦点限制在面板内 |

## 降级与无障碍

- **`prefers-reduced-motion: reduce`**：关闭平滑滚动、预加载、视差、跑马灯、字标呼吸；网点场只渲染一帧静态画面；色卡扇直接呈现展开状态；保留颜色和透明度过渡。
- **不支持 WebGL**：自动移除画布，Hero 退化为纯排版，不影响其他功能。
- **触屏设备**：关闭自定义光标和磁吸效果，色卡改为点击选中。
- **不支持 View Transitions**：主题直接切换。
- 语义化结构、「Skip to content」跳转链接、2px 橙色 `:focus-visible` 轮廓、所有图片都有 `alt`。

## 许可

模板代码采用 MIT 许可；字体均为 OFL 授权。
