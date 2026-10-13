# OPERATOR FILE — 视觉设计师作品集模板

一个面向视觉设计师（游戏 / 二次元方向）的单页作品集模板。视觉概念为 **OPERATOR FILE（干员档案）**：参考二游官网的战术 HUD 语言——黑橙高对比、切角面板、斜切光带、稀有度卡面、解码乱码文字，把作品集当成一份「干员档案」来设计。

- **中文为主语言**，英文只作为设计性的小号标注（导航、栏目、按钮副标）。
- 附带一个**本地可视化后台**（`npm run admin`），不用改代码就能更新作品、联系方式和全部文案。

> 页面里的姓名、邮箱、客户、经历都是**占位内容**（你的名字、hello@example.com、某游戏工作室…），不含任何真实个人信息。

## 亮点

| 模块 | 交互 / 动效 |
|------|-------------|
| 预加载 | 「Operator.sys」启动日志逐行打印 + 百分比计数；完成后橙色斜带横扫、整屏斜切退场 |
| Hero | WebGL 斜向光带场：多层橙 / 青色速度线随时间掠过，光标处产生光斑与偏移；超宽字标可变字体随光标「呼吸」；右侧 **KV 主视觉窗口**自动轮播精选作品（斜切擦除转场 + 进度条） |
| 宣言 | 逐字随滚动点亮，高亮词为橙色，行内图片胶囊从中线展开 |
| 作品 | 「关卡选择」：切角卡面 + SSR / SR / R 稀有度角标；hover 时 RGB 分离故障；「卡片 ⇄ 列表」用 GSAP Flip 重排；列表视图大图跟随光标 |
| 案例页 | 橙色斜带横扫过场，封面从卡片位置 FLIP 放大；支持 `#project-id` 深链接；`Esc` 关闭 |
| 档案 | 干员立绘卡（LV / 星级）、六边形雷达图自中心展开、数值计数 |
| 装备 | 色卡扇：滚动时摊开；悬停预览、点击锁定（LOCK 角标）；指针离开后平滑归位到静止态，不残留中间态 |
| 流程 | 横向钉住滚动，步骤依次「上墨」 |
| 全局 | HUD 文字解码（只乱码英文数字，中文保持原字）、描边水印标题、准星光标、磁吸按钮、Lenis 平滑滚动、区块编号与同步率进度条、斜切跑马灯、扫描线 |
| 主题 | NIGHT（黑橙，默认）/ DAY（冷白灰），View Transitions 圆形扩散切换，选择会被记住 |
| 自检 | 按 `G` 键打开栅格叠层 |

## 技术栈

- **Vite 8** + **TypeScript**（无框架，原生 DOM）
- **GSAP 3**：ScrollTrigger / SplitText / Flip；**Lenis** 平滑滚动
- **WebGL**：手写片元着色器（`src/motion/herofx.ts`）
- **@fontsource**：Noto Sans SC Variable（中文）、Anybody Variable（超宽展示字）、Archivo Variable（西文正文）、Chakra Petch（HUD 标签）、JetBrains Mono Variable（数字），全部本地打包，OFL 授权
- **后台**：零依赖 Node.js（只用内置 `http` / `fs`），单文件前端

## 快速开始

```bash
npm install
npm run dev        # 开发服务器
npm run build      # 类型检查 + 生产构建，输出到 dist/
npm run preview    # 本地预览生产构建
npm run admin      # 内容后台 http://127.0.0.1:5174
```

`dist/` 是纯静态文件，可直接部署到任意静态托管（Vercel / Netlify / GitHub Pages / OSS）。

## 内容后台（推荐）

```bash
npm run admin                       # 默认 127.0.0.1:5174
ADMIN_PORT=8080 npm run admin       # 换端口
ADMIN_TOKEN=换成你的口令 npm run admin  # 开启口令（部署到服务器时务必设置）
```

| 功能 | 说明 |
|------|------|
| 表单编辑 | 基本信息 / 作品 / 个人档案 / 能力 / 装备 / 流程 / 履历 / 栏目文案 共 8 个分页；列表项可折叠、上下移动、复制、删除、拖拽排序 |
| 图片 | 每个图片字段带缩略图、图库选择、上传；**把图片直接拖进窗口**即可上传到 `public/images/`（jpg / png / webp / gif / avif / svg，≤ 12 MB，重名自动加序号） |
| JSON 源码 | 高级用户可直接编辑完整 JSON |
| 保存 | `⌘S` / `Ctrl+S`；保存前校验结构，并自动备份到 `content/.backups/`（保留最近 20 份） |
| 构建发布 | 一键执行 `npm run build`，返回构建日志；之后把 `dist/` 上传即可 |
| 防误操作 | 未保存离开时提醒、一键撤销修改 |

开发时同时开着 `npm run dev`，在后台保存后页面会自动热更新。

> 后台只用于本地或受信任的内网。默认只监听 `127.0.0.1`；如需公网访问，请设置 `ADMIN_TOKEN` 并放在 HTTPS 反向代理之后。

## 手动修改内容

所有内容都在 **[content/site.json](./content/site.json)**，[src/content.ts](./src/content.ts) 为它提供类型，[src/render.ts](./src/render.ts) 据此渲染页面。

| 字段 | 内容 |
|------|------|
| `site` | 姓名（中 / 英）、缩写、代号、职位、城市、时区（页眉时钟）、邮箱、接单状态、Hero 字标与简介、`heroMeta`、`contacts`（邮箱 / 微信 / 电话…）、`socials` |
| `sections` | 各栏目的中文标题、英文标注、编号、导语 |
| `marquee` | 跑马灯关键词 |
| `manifesto` | 宣言正文；`{0}` `{1}` 表示插入 `images` 中的第 n 张行内图 |
| `projects` | 作品：标题、英文名、领域、客户、年份、角色、工具、摘要、稀有度 `SSR` / `SR` / `R`、封面、比例、版式、案例图集。**SSR 作品会优先进入 Hero KV 轮播** |
| `about` | 立绘、等级、阵营、正文、统计数字、雷达图（0–1） |
| `capabilities` / `tools` / `process` | 能力、装备卡（熟练度 1–5、卡色 `accent` / `cyan` / `white` / `steel` / `black`）、工作流程 |
| `experience` / `awards` | 履历与奖项 |

文本中用 `*星号*` 包裹的词会渲染成橙色强调。

**品牌色 / 字体 / 间距**：统一在 [src/styles/tokens.css](./src/styles/tokens.css) 修改，规则见设计规范。

## 图片素材来源

`public/images/` 中的示意图来自 [StockCake](https://stockcake.com)，按其条款为公共领域（CC0），可免费商用、无需署名。它们**仅作版式演示**，正式使用时请换成你自己的作品。

## 目录结构

```text
folio-template/
├── index.html              # 页面骨架（语义化结构 + 首帧主题恢复）
├── content/site.json       # ★ 全部内容（后台编辑的就是它）
├── public/images/          # 图片
├── server/
│   ├── admin.mjs           # 内容后台服务（零依赖）
│   └── admin.html          # 后台界面
├── src/
│   ├── content.ts          # 内容类型定义
│   ├── render.ts           # 根据内容渲染各区块
│   ├── main.ts             # 入口
│   ├── env.ts              # 工具函数、设备能力探测
│   ├── motion/
│   │   ├── herofx.ts       # WebGL 斜向光带场
│   │   ├── kv.ts           # Hero KV 主视觉轮播
│   │   ├── wordmark.ts     # 字标适配 + 可变字体呼吸
│   │   ├── intro.ts        # 启动序列与入场
│   │   ├── scroll.ts       # Lenis + 锚点
│   │   ├── reveal.ts       # 进入动效、区块编号
│   │   ├── works.ts        # 作品卡片 ⇄ 列表（Flip）
│   │   ├── case.ts         # 案例页转场、焦点管理、深链接
│   │   ├── toolkit.ts      # 装备卡扇（目标状态 + 逐帧缓动）
│   │   ├── process.ts      # 横向钉住滚动
│   │   ├── hud.ts          # 解码文字、卡片故障、雷达图
│   │   └── ui.ts           # 光标、磁吸、主题、栅格、时钟、菜单、复制
│   └── styles/             # tokens / base / sections
├── docs/                   # 设计规范、视觉验收记录
├── scripts/visual-qa.mjs   # 自动化截图与指标采集
└── qa/report.json          # 最近一次验收结果
```

## 视觉验收

```bash
npm run build
npm run preview -- --port 4173 --strictPort   # 另开一个终端
npm run qa                                    # 3 个视口 × 2 个主题 + reduced motion
```

截图输出到 `qa/shots/`（不入库），指标写入 `qa/report.json`。需要本机安装 Chrome，可用 `CHROME_PATH` 指定路径。

## 快捷键

| 键 | 作用 |
|----|------|
| `G` | 打开 / 关闭栅格叠层 |
| `Esc` | 关闭案例页 / 移动端菜单 |
| `Tab` | 案例页打开时，焦点限制在面板内 |

## 降级与无障碍

- **`prefers-reduced-motion: reduce`**：关闭平滑滚动、预加载、视差、跑马灯、字标呼吸、解码与故障、KV 自动轮播；光带场只渲染静态一帧；装备卡扇直接呈现展开态。
- **不支持 WebGL**：移除画布，Hero 退化为纯排版。
- **触屏设备**：关闭自定义光标与磁吸，装备卡改为点击锁定、点空白处取消。
- 语义化结构、「跳到正文」链接、2px 橙色 `:focus-visible` 轮廓、所有图片都有 `alt`。

## 许可

模板代码采用 MIT 许可；字体均为 OFL 授权；示意图片为 CC0。
