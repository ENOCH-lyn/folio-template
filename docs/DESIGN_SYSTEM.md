# PROOF — 视觉设计系统 / Design System v1.0

> 本模板的视觉概念叫 **PROOF（打样）**。
> 设计师的作品集，本质上是一张交付给世界的「打样稿」：网格严谨、油墨真实、细节可被放大检验。
> 所有视觉决策都围绕三个关键词：**Swiss Grid（瑞士网格） × Riso Ink（孔版油墨） × Print Marks（印刷标记）**。

---

## 0. 设计原则 Principles

| # | 原则 | 含义 | 落地 |
|---|------|------|------|
| P1 | **Grid is the voice** 网格即语言 | 所有元素必须吸附 12 栏网格；不对称但不随意 | `--grid-*` token；按 `G` 键可随时打开网格叠层自检 |
| P2 | **Ink, not pixels** 油墨感，而非像素感 | 颜色像印上去的：暖纸底、纯黑墨、荧光橙专色、叠印蓝；全站轻微颗粒 | `mix-blend-mode: multiply` 叠印、半调网点 WebGL、SVG 噪点 |
| P3 | **Type does the heavy lifting** 字体承担表达 | 用可变字体的字重/字宽轴做「呼吸」与交互，而不是装饰图形 | Hero 字标随光标改变 `wght`/`wdth` |
| P4 | **Motion = printing** 动效即印刷 | 所有进入动效都模拟「被印出来」：从遮罩下升起、细线从左到右拉出、网点逐渐显影 | 统一缓动曲线与时长阶梯 |
| P5 | **Show the craft** 暴露工艺 | 裁切线、套准标记、色标条、页码（Folio）作为功能性 UI | 卡片 hover 出现裁切线；底部色标条；左下角 Folio 页码 |

---

## 1. 色彩 Color

### 1.1 主色板（Paper 主题 · 默认）

| Token | 名称 | HEX | 用途 | 占比 |
|-------|------|-----|------|------|
| `--c-paper` | Paper 纸 | `#EEEAE2` | 页面底色（暖白，避免纯白刺眼） | ~70% |
| `--c-paper-2` | Paper Shade 纸影 | `#E4DFD4` | 卡片底、图片占位、区块分隔 | ~8% |
| `--c-ink` | Ink 墨 | `#141312` | 正文、大标题、深色区块 | ~18% |
| `--c-mid` | Graphite 石墨 | `#6E6A63` | 次级信息、Meta、说明 | ~3% |
| `--c-signal` | Signal 荧光橙（专色） | `#FF4D1A` | 唯一强调色：交互态、关键数据、光标 | **≤ 3%** |
| `--c-overprint` | Overprint 叠印蓝 | `#2E3BFF` | 仅用于叠印/半调第二色版，不做 UI 色 | ≤ 1% |
| `--c-line` | Rule 细线 | `rgb(20 19 18 / 14%)` | 1px 分隔线 | — |

### 1.2 Darkroom 主题（暗房）

| Token | HEX |
|-------|-----|
| `--c-paper` | `#0F0E0D` |
| `--c-paper-2` | `#1A1917` |
| `--c-ink` | `#EEEAE2` |
| `--c-mid` | `#8F897F` |
| `--c-signal` | `#FF5A2B`（暗底下略提亮） |
| `--c-overprint` | `#5867FF` |
| `--c-line` | `rgb(238 234 226 / 14%)` |

主题切换使用 View Transitions API，以按钮为圆心做圆形扩散揭示（不支持时直接切换）。

### 1.3 色彩规则
- **专色克制**：一屏之内荧光橙出现不超过 2 处。它是「被圈出来的重点」，不是装饰。
- **叠印而非透明**：两种颜色重叠时用 `multiply`，得到真实油墨叠印的深色，而不是 `opacity`。
- **文字对比度**：正文 `ink/paper` ≥ 15:1；`mid/paper` ≥ 4.5:1（AA）；橙色上的文字一律使用 `--c-ink`（黑字），**禁止橙底白字**（对比度不足）。
- 图片不做彩色滤镜；仅在 hover 时允许整体 `grayscale(0) → grayscale(1)` 的反向处理（默认彩色）。

---

## 2. 字体 Typography

### 2.1 字体家族

| 角色 | 字体 | 授权 | 用途 |
|------|------|------|------|
| Display / Sans | **Bricolage Grotesque Variable**（`wght 200–800`, `wdth 75–100`） | OFL | 标题、字标、正文。可变轴用于交互 |
| Accent / Serif | **Instrument Serif Italic** | OFL | 情绪化短语、引用、数字装饰。与粗壮 Grotesk 形成「理性/感性」对比 |
| Meta / Mono | **JetBrains Mono Variable** | OFL | 编号、年份、标签、技术注释（像印刷工单上的字） |
| 中文 | 系统字体 `PingFang SC` → `Noto Sans SC` → `Microsoft YaHei` | — | 中文副标签，统一 `font-weight: 400–500`，字距 `0.04em` |

所有字体通过 `@fontsource` 本地打包，不依赖外部 CDN。

### 2.2 字号阶梯（流体，`clamp()`）

| Token | 尺寸 | 行高 | 字距 | 用途 |
|-------|------|------|------|------|
| `--fs-mega` | 由 JS 自适应撑满容器宽度 | 0.8 | -0.04em | Hero 字标 |
| `--fs-d1` | `clamp(3.5rem, 11vw, 13rem)` | 0.86 | -0.045em | 联系区大标题 |
| `--fs-d2` | `clamp(2.5rem, 6.4vw, 7rem)` | 0.92 | -0.035em | 区块标题 |
| `--fs-h1` | `clamp(2rem, 4vw, 4rem)` | 1.0 | -0.03em | 案例标题、宣言 |
| `--fs-h2` | `clamp(1.5rem, 2.4vw, 2.25rem)` | 1.1 | -0.02em | 卡片标题 |
| `--fs-lead` | `clamp(1.125rem, 1.5vw, 1.5rem)` | 1.35 | -0.01em | 导语 |
| `--fs-body` | `1rem`（16px） | 1.55 | 0 | 正文 |
| `--fs-small` | `0.875rem` | 1.45 | 0 | 说明 |
| `--fs-meta` | `0.6875rem`（11px） | 1.3 | 0.06em, 大写 | Mono 标签 |

### 2.3 排版规则
- 正文行宽 **45–68ch**；导语 ≤ 36ch。
- 大标题允许负字距，**正文禁止负字距**。
- 编号统一格式：`(01)`、`01 / 06`，使用 Mono + `font-variant-numeric: tabular-nums`。
- 英文主标题 + 中文副标签：中文永远更小、更灰，放在右侧或下方，不与英文抢层级。
- 衬线斜体只用于**单个词或短语**（≤ 5 词），作为语气重音。

---

## 3. 网格与间距 Grid & Spacing

### 3.1 网格

| 断点 | 范围 | 栏数 | 槽宽 Gutter | 页边距 Margin |
|------|------|------|-------------|---------------|
| `xs` | < 600px | 4 | 12px | 16px |
| `sm` | 600–899px | 8 | 16px | 24px |
| `md` | 900–1199px | 12 | 20px | 32px |
| `lg` | ≥ 1200px | 12 | 24px | 48px |

- 最大内容宽度不设限（作品集是展厅，全幅出血）；超大屏下字号与网格随 vw 缩放。
- 作品网格采用 **不对称编排**（a–f 六种版式），竖向错位以制造阅读节奏，但每张卡片的左右边缘必须落在栏线上。

### 3.2 间距（4pt 基准）

`--s-1: 4px` · `--s-2: 8px` · `--s-3: 12px` · `--s-4: 16px` · `--s-5: 24px` · `--s-6: 32px` · `--s-7: 48px` · `--s-8: 64px` · `--s-9: 96px` · `--s-10: 128px` · `--s-11: 192px`

区块垂直间距：`--section-y: clamp(96px, 14vw, 224px)`。

### 3.3 圆角与线
- 圆角：**0**（印刷品没有圆角）。唯一例外：圆形元素（光标、磁吸按钮、状态点、宣言中的图片胶囊 `999px`）。
- 线：统一 1px `--c-line`；强调线 2px `--c-ink`。

---

## 4. 动效 Motion

### 4.1 缓动与时长

| Token | 值 | 用途 |
|-------|-----|------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)`（expo.out） | 所有进入动效（默认） |
| `--ease-in-out` | `cubic-bezier(0.76, 0, 0.24, 1)`（quart.inOut） | 面板、幕布、视图切换 |
| `--ease-spring` | GSAP `elastic.out(1, 0.5)` | 仅限磁吸按钮回弹 |
| `--d-micro` | 200ms | hover 颜色/位移 |
| `--d-ui` | 450ms | 按钮、开关、光标形变 |
| `--d-reveal` | 900ms | 文字/图片进入 |
| `--d-scene` | 1400ms | 预加载、案例页转场 |
| 交错 stagger | 文字 0.04s/字 · 0.08s/行 · 卡片 0.12s | — |

### 4.2 动效词汇表（只允许使用以下几种）

1. **Rise 升起**：文字行从 `overflow: hidden` 遮罩下 `yPercent: 110 → 0`（像墨迹被压印上纸）。
2. **Rule 拉线**：分隔线 `scaleX: 0 → 1`，`transform-origin: left`。
3. **Develop 显影**：图片 `clip-path: inset(100% 0 0 0) → inset(0)` 同时内部 `scale 1.25 → 1`。
4. **Halftone 网点**：WebGL 半调网点场，双色版（橙 45° / 蓝 15°）+ 轻微套准偏移，随时间流动、随光标膨胀。
5. **Breathe 呼吸**：可变字体轴 `wght`/`wdth` 按光标距离插值。
6. **Velocity 速度感**：跑马灯速度与倾斜由滚动速度驱动。
7. **Flip 重排**：作品「网格 ⇄ 索引」视图切换，元素从旧位置平滑重排到新位置（GSAP Flip）。

### 4.3 动效规则
- 滚动驱动动画全部使用 `ScrollTrigger`，**不监听原生 scroll 事件**。
- 只动画 `transform`、`opacity`、`clip-path`、`font-variation-settings`；禁止动画 `width/height/top/left`。
- 每屏同时进行的「主动画」≤ 1 个。
- `prefers-reduced-motion: reduce` 时：关闭平滑滚动、预加载、视差、跑马灯、半调动画（渲染静态帧）、字标呼吸；保留颜色与透明度过渡。
- 触屏设备（`pointer: coarse`）关闭自定义光标与磁吸。

---

## 5. 组件 Components

| 组件 | 规范 |
|------|------|
| **Header** | 固定顶部，`mix-blend-mode: difference`，在任意背景上自动反相；左：字母标 + 身份；中：导航；右：可用状态点、网格开关、主题开关 |
| **Section Head** | 顶部 1px 拉线 → 左 `(0N)` Mono 编号 → 英文 D2 标题 → 右侧中文副标与计数 |
| **Work Card** | 图片 + 下方 Meta 行（编号 / 标题 / 领域 / 年份）。Hover：图片内缩 + 四角出现裁切线 + 光标变为 `View` 圆 |
| **Index Row** | 编号 / 缩略图 / 标题 / 领域 / 客户 / 年份 / ↗。Hover：荧光橙自下而上铺满，大图跟随光标并按速度倾斜 |
| **Case Study** | 全屏面板自下而上幕布展开；封面图从卡片位置 FLIP 放大；`Esc` 关闭；焦点回到原卡片 |
| **Swatch Chip** | 仿 Pantone 色卡：上半色块 + 半调网点（密度=熟练度），下半白色标签（编号/名称/用途） |
| **Cursor** | 8px 实心点 + 36px 圆环；交互元素上圆环放大为 88px 橙色实心并显示标签 |
| **Magnetic Button** | 圆形，橙底黑字；光标靠近时向光标偏移（≤ 30% 半径），离开时弹性回位 |
| **Folio** | 左下角固定页码 `[03] About`，随滚动所在区块滚动切换 |
| **Color Bar** | 页脚色标条：墨 100/75/50/25%、纸、橙、蓝、叠印，作为品牌签名 |

---

## 6. 图像 Imagery
- 比例只使用：`4:3`、`3:4`、`1:1`、`16:9`、`21:9`。
- 作品图优先「真实物料摄影」（样机、印刷品、空间），避免纯平面截图堆砌。
- 人像：剪影/背光/不露脸亦可，强调工作状态而非自拍。
- 所有图片必须写 `alt`；装饰性图片 `alt=""`。
- 加载时以 `--c-paper-2` 底色 + 网点纹理占位，避免空白闪烁。

---

## 7. 文案语气 Voice
- 英文为主、中文为辅（双语作品集标准做法），模板中均为 **占位文案**。
- 语气：自信、简短、具体。用动词开头，避免「热爱设计」之类空话。
- 数字要具体（`120+ projects`），并可被核实。

---

## 8. 无障碍 Accessibility
- 语义化结构：`header / nav / main / section[aria-labelledby] / footer / dialog`。
- 提供「跳到内容」链接；所有交互元素可键盘访问并有 2px 橙色 `:focus-visible` 轮廓。
- 动效遵循 `prefers-reduced-motion`；颜色从不作为唯一信息载体。
- 自定义光标不替代系统焦点，不影响可点击区域。

---

## 9. 文件对照
| 规范 | 实现文件 |
|------|----------|
| 色彩 / 字体 / 间距 / 缓动 token | `src/styles/tokens.css` |
| 基础排版与全局元素 | `src/styles/base.css` |
| 区块与组件 | `src/styles/sections.css` |
| 动效模块 | `src/motion/*.ts` |
| 占位内容 | `src/content.ts` |
