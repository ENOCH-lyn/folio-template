# OPERATOR FILE — 视觉设计系统 / Design System v2.0

> 本模板的视觉概念叫 **OPERATOR FILE（干员档案）**。
> 面向游戏 / 二次元方向的视觉设计师：把作品集当成二游官网里的一份「干员档案」——启动序列、关卡选择、档案卡、装备、任务流程、组队邀请。
> 关键词：**Tactical HUD（战术界面） × Cel Contrast（赛璐璐式高对比） × Signal Orange（信号橙）**。
> 参考气质：明日方舟、绝区零、鸣潮、少女前线 2 等官网与游戏 UI 的现代化排版——不复刻任何具体作品的图形资产。

> v1.0 的「PROOF 打样」暖纸 + 印刷标记方向已废弃（反馈：配色偏传统、不够二次元）。动效系统保留，视觉语言整体替换。

---

## 0. 设计原则 Principles

| # | 原则 | 含义 | 落地 |
|---|------|------|------|
| P1 | **Dark first, one signal** 暗底单信号色 | 近黑底 + 唯一的信号橙承担全部强调；青色只做第二色版点缀 | 默认 NIGHT 主题；橙色面积 ≤ 8%，青色 ≤ 2% |
| P2 | **Cut, don't round** 切角而非圆角 | 所有面板、按钮、标签用 45° 切角（chamfer），全站不出现圆角 | `--cut-s/m/l` + `clip-path: polygon(...)` |
| P3 | **Type as HUD** 字体即界面 | 超宽粗展示字承担视觉冲击；HUD 小字全大写、加字距，像游戏界面标签 | Anybody 125% 宽 900 重；Chakra Petch 标签 |
| P4 | **Motion = system boot** 动效即系统运行 | 进入动效模拟「信号接入」：解码乱码、斜带扫过、扫描线、计数；节奏利落 | 统一缓动 `expo` 与时长阶梯 |
| P5 | **Data as ornament** 数据即装饰 | 编号、稀有度、等级、雷达图、SYNC 进度条——用游戏化的数据代替插画装饰 | `SSR/SR/R` 角标、`LV.80`、战斗数据雷达 |

---

## 1. 色彩 Color

### 1.1 NIGHT 主题（默认 · 黑橙）

| Token | 名称 | HEX | 用途 | 占比 |
|-------|------|-----|------|------|
| `--c-bg` | Void 底 | `#0B0B0D` | 页面底色（带一点冷调的近黑） | ~75% |
| `--c-bg-2` | Panel 面板 | `#141417` | 卡片、面板底 | ~10% |
| `--c-bg-3` | Panel Hi 面板高光 | `#1D1D21` | hover 面板、分段控件 | ~3% |
| `--c-fg` | Signal White 白 | `#F4F4F5` | 标题、正文 | ~8% |
| `--c-mid` | Steel 钢灰 | `#8A8A93` | 次级信息、Meta | ~2% |
| `--c-accent` | Signal Orange 信号橙 | `#FF5B14` | 唯一强调色：交互、关键数据、标题第二行、按钮 | **≤ 8%** |
| `--c-accent-2` | Cyan 青 | `#2DE2E6` | 第二色版：网点、SR 稀有度、少量 HUD 点缀 | **≤ 2%** |
| `--c-line` | Rule 细线 | `fg 12%` | 1px 分隔线 | — |
| `--c-line-strong` | Rule Strong | `fg 30%` | 边框、描边水印 | — |

### 1.2 DAY 主题（冷白灰）

| Token | HEX |
|-------|-----|
| `--c-bg` | `#F3F4F6` |
| `--c-bg-2` | `#E6E7EA` |
| `--c-bg-3` | `#D9DADF` |
| `--c-fg` | `#0B0B0D` |
| `--c-mid` | `#5E5F66` |
| `--c-accent` | `#FF5B14`（不变） |

- DAY 主题下网点第二色版由青改为黑，保持「橙 + 墨」的高对比。
- 刻意避开暖米色 / 暖灰：底色一律是**冷调**中性色。

### 1.3 规则

1. 一屏之内只允许**一个**大面积橙色块（按钮、高亮行、斜带三者择一）。
2. 橙色文字只用于标题第二行 / 关键词 / 编号；正文永远不用橙色。
3. `--raw-*` 为原始色值，`--c-*` 为语义 token；组件只引用 `--c-*`，WebGL 读取 `--raw-*`。
4. 对比度：正文 ≥ 4.5:1，`--c-mid` 只用于 ≤ 14px 的 Meta 且 ≥ 4.5:1。

---

## 2. 字体 Typography

| 角色 | 字体 | 设置 | 用途 |
|------|------|------|------|
| Display | **Anybody Variable** | `wght 900` · `wdth 125%` · 全大写 · 字距 -0.02em | Hero 字标、区块标题、超大编号、水印 |
| Text | **Archivo Variable** | `wght 400–600` | 正文、简介 |
| HUD | **Chakra Petch** 500/600 | 全大写 · 字距 0.08–0.14em · 12px | 导航、标签、Meta、按钮 |
| Number | **JetBrains Mono Variable** | `tabular-nums` | 计数、时钟、进度百分比 |
| 中文 | 系统黑体（PingFang SC / Noto Sans SC） | 字距 0.1em | 中文副标题、竖排字 |

字号阶梯（流式 `clamp`）：

| Token | 范围 |
|-------|------|
| `--fs-d1` | 52 → 192px |
| `--fs-d2` | 36 → 96px |
| `--fs-h1` | 32 → 64px |
| `--fs-h2` | 22 → 32px |
| `--fs-lead` | 17 → 22px |
| `--fs-body` | 16px |
| `--fs-small` | 14px |
| `--fs-meta` | 12px |

---

## 3. 网格与间距 Grid & Spacing

| 断点 | 栏数 | 间距 | 页边距 |
|------|------|------|--------|
| ≥ 1200px | 12 | 24px | 48px |
| 900–1199px | 12 | 20px | 32px |
| 600–899px | 8 | 16px | 24px |
| < 600px | 4 | 12px | 16px |

- 间距阶梯：`--s-1` 4 → `--s-11` 192（4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 / 192）。
- 区块标题统一占 1–2 栏放编号，3–10 栏放标题，右侧放中文副标题；背后为超大描边英文水印（`data-ghost`）。
- 按 `G` 打开栅格叠层自检。

---

## 4. 形状 Shape

| Token | 值 | 用途 |
|-------|----|------|
| `--cut-s` | 8px | 标签、chip、小按钮 |
| `--cut-m` | 16px | 卡片、面板 |
| `--cut-l` | 28px | 大按钮、立绘卡 |

- 切角一律用 `clip-path: polygon(...)`，通常切**右上 + 左下**两个对角，形成方向感。
- 描边边框用 1px `--c-line-strong`；强调边框用 2–3px `--c-accent`，只出现在卡片一侧或左边线。
- 斜切元素（高亮词、跑马灯色带、过场斜带）统一倾角约 **-3° ~ -12°**。

---

## 5. 动效 Motion

### 5.1 缓动与时长

| Token | 值 | 用途 |
|-------|----|------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)`（≈ expo.out） | 进入 |
| `--ease-in-out` | `cubic-bezier(0.76, 0, 0.24, 1)` | 擦除、过场 |
| `--ease-snap` | `cubic-bezier(0.7, 0, 0.2, 1)` | HUD 切换 |
| `--d-micro` | 180ms | hover、按下 |
| `--d-ui` | 420ms | 控件状态 |
| `--d-reveal` | 900ms | 滚动进入 |
| `--d-scene` | 1400ms | 过场、预加载 |

### 5.2 动效词汇表

| 名称 | 描述 | 位置 | 实现 |
|------|------|------|------|
| **Boot** 启动 | 启动日志逐行打印、百分比计数、进度条 | 预加载 | `intro.ts` |
| **Slash** 斜带 | 橙色斜带横扫盖住画面，随后整屏斜切退场 | 预加载退场、案例页过场 | `clip-path` polygon |
| **Rise** 升起 | 标题按行从遮罩下升起 | 区块标题、字标 | SplitText |
| **Decode** 解码 | 文字先显示随机字符，再逐字还原 | 区块编号、HUD Meta、导航 hover | `hud.ts` |
| **Glitch** 故障 | 卡片 hover 时 400ms 的 RGB 分离抖动 | 作品卡 | `.card.is-glitch` |
| **Scan** 扫描 | 横向扫描光带循环掠过 | Hero、滚动提示 | CSS keyframes |
| **Deploy** 展开 | 雷达多边形自中心展开、数据点弹出、数值计数 | 档案 | `hud.ts` |
| **Develop** 显影 | 图片自下而上 clip 显出，内部轻微缩放 | 卡片、立绘 | `reveal.ts` |
| **Velocity** 速度 | 跑马灯速度与倾斜由滚动速度驱动 | 斜切色带 | `reveal.ts` |
| **Fan** 扇开 | 装备卡随滚动从手中摊开，悬停选中 | 装备 | `toolkit.ts` |
| **Flip** 重排 | Cards ⇄ List 视图平滑重排 | 作品 | GSAP Flip |
| **Breathe** 呼吸 | 字标可变字体轴随光标距离变化 | Hero | `wordmark.ts` |
| **Halftone** 网点 | 双色版网点场流动 + 光标膨胀 | Hero | WebGL |

### 5.3 规则

- 进入动效只播放一次（`once`），不反复打扰阅读。
- 解码文字时长 ≤ 0.7s，hover 解码 ≤ 0.45s。
- `prefers-reduced-motion`：关闭 Boot / Slash / Decode / Glitch / Scan / 视差 / 跑马灯 / 平滑滚动；保留颜色与透明度过渡。

---

## 6. 组件 Components

| 组件 | 要点 |
|------|------|
| Header | 左：切角 logo 方块 + 姓名；中：编号导航（hover 解码，当前项下划线）；右：在线状态 + 时钟 + 栅格 / 主题按钮 |
| HUD Chip | 左下 `区块编号 + 名称`、右下 `SYNC` 进度条与百分比，均为切角小面板 |
| Hero | 四角取景框、Meta 行（ID / CLASS / BASE / FILES）、超宽双行字标（第二行橙）、竖排中文、左边线简介、`PRESS START` 大按钮 |
| Section Head | `编号 + 英文小标` / 双色大标题 / 中文副标题 / 描边水印 / 左侧橙色短线 + 通长细线 |
| Work Card | 切角卡面、`FILE 0X // 领域` 标签、右上稀有度角标（SSR 橙 / SR 青 / R 灰）、星级、hover 故障 |
| Profile | 立绘卡（LV、星级、橙色描边）、简介、战斗数据雷达、数字统计面板 |
| Skill Row | `SK-0X` 编号框、标题 + 中文、说明、标签组；hover 面板提亮 |
| Equipment Fan | 卡色 `accent / cyan / white / steel / black`，条带数表示熟练度 |
| Mission Stage | 横向卡片：超大斜体橙色编号、标题、说明、标签 |
| Contact | `READY TO JOIN THE PARTY?` 大标题、菱形 `START A PROJECT` 按钮、邮箱（点击复制）、社交 chip |
| Footer | 警示斜纹条、版权行、超大描边姓名 |

---

## 7. 图像 Imagery

- 统一风格词 `STYLE`（见 `src/content.ts`）：anime key visual、cel shading、high contrast、orange and black、cinematic lighting。
- 卡片封面比例：landscape 4:3 / portrait 3:4 / square / wide；在卡面内一律 `object-fit: cover`。
- 替换为真实作品时，优先选择**暗部较多、有一个橙 / 暖色焦点**的画面，和整体配色最搭。

---

## 8. 文案语气 Voice

- 英文用游戏系统语汇：Stage select、Operator file、Skill tree、Equipment、Mission flow、Archive log、Party invite。
- 中文副标题朴素直白（精选作品、干员档案、能力范围……），保证非玩家也能读懂。
- 所有占位文案都带「Placeholder / 占位」字样或明显的占位符（`[City]`、Client A）。

---

## 9. 无障碍 Accessibility

- 语义化结构；Skip link；`:focus-visible` 2px 橙色轮廓。
- 装饰元素（扫描线、颗粒、取景框、水印）全部 `aria-hidden` / `pointer-events: none`。
- 雷达图带完整 `aria-label`；解码动画只改文本节点，结束后还原原文。
- 窄屏（< 600px）Hero 网点场不透明度降至 0.38，保证橙色标题可读。
