# DESIGN.md

> 深色终端，数据发光 — 像 Bloomberg 控制台一样思考，像文件管理器一样操作。

## 1. Visual Theme & Atmosphere

**Style**: Dark Financial Terminal
**Keywords**: 专业、深邃、数据密集、克制、精确、终端感、信息层次、可信赖
**Tone**: 像一个安静的交易室，所有重要数据在暗色背景上清晰发光 — NOT 花哨、娱乐化、卡通
**Feel**: 深夜的交易大厅，屏幕上数据流淌，安静但充满信息张力

**Interaction Tier**: L1 精致静态
**Dependencies**: CSS only（数据密集型看板不需要滚动动画，信息需要立即可见）

## 2. Color Palette & Roles

```css
:root {
  /* Backgrounds */
  --bg: #0A0E14;                          /* 页面主背景 — 深蓝黑 */
  --surface: #111820;                     /* 卡片/容器 — 深灰蓝 */
  --surface-alt: #151D28;                 /* 交替 section / 次级容器 */
  --surface-hover: #1A2535;               /* 悬停态表面 */

  /* Borders */
  --border: #1E2A3A;                      /* 默认边框 — 低调分割线 */
  --border-hover: #2A3A50;               /* 悬停边框 */
  --border-active: #3B82F6;              /* 选中/活跃边框 — 蓝色高亮 */

  /* Text */
  --text: #E8ECF1;                        /* 主文字 — 近白但不刺眼 */
  --text-secondary: #8B9BB4;             /* 次文字 — 描述、正文 */
  --text-tertiary: #5A6B82;              /* 三级文字 — 标签、辅助信息 */
  --text-muted: #3D4F66;                 /* 最弱文字 — 占位符、禁用态 */

  /* Accent — 金融蓝 */
  --accent: #3B82F6;                     /* 主强调色 — 链接、活跃态、选中 */
  --accent-hover: #60A5FA;              /* 强调色 hover */
  --accent-soft: rgba(59, 130, 246, 0.12); /* 强调色背景淡版 */

  /* RGB variants for rgba() */
  --bg-rgb: 10, 14, 20;
  --accent-rgb: 59, 130, 246;

  /* Semantic — 金融惯例：红涨绿跌（中国市场） */
  --success: #22C55E;                    /* 上涨/正面 — 绿色 */
  --error: #EF4444;                      /* 下跌/负面 — 红色 */
  --warning: #F59E0B;                    /* 警告/震荡 — 黄色 */
  --info: #06B6D4;                       /* 信息 — 青色 */

  /* 数字色（金融数据专用） */
  --num-up: #EF4444;                     /* 涨 — 红 */
  --num-down: #22C55E;                   /* 跌 — 绿 */
  --num-neutral: #E8ECF1;               /* 平 — 白 */
  --num-accent: #60A5FA;                /* 高亮数字 — 蓝 */
}
```

**Color Rules:**
- 所有颜色通过 CSS 变量引用，禁止硬编码 hex
- 同一 section 内只用一个强调色（蓝色），其他用语义色辅助
- 数字数据必须用 `font-variant-numeric: tabular-nums` 保证等宽对齐
- 涨跌色严格遵循中国金融惯例：红涨绿跌
- 文字层级不超过 4 级（主/次/三/弱），避免信息过载

## 3. Typography Rules

**Font Stack:**
```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
```

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| 页面标题 H1 | Noto Sans SC, Inter | 1.5rem (24px) | 600 | 1.3 | — |
| 区域标题 H2 | Noto Sans SC, Inter | 1.125rem (18px) | 600 | 1.4 | — |
| 卡片标题 H3 | Noto Sans SC, Inter | 0.875rem (14px) | 500 | 1.4 | — |
| 正文 | Noto Sans SC, Inter | 0.8125rem (13px) | 400 | 1.6 | 0.02em |
| 标签/辅助 | Noto Sans SC, Inter | 0.75rem (12px) | 400 | 1.5 | 0.04em |
| 数据数字 | JetBrains Mono | 1.5-2.5rem | 600 | 1.2 | — |
| 小数字 | JetBrains Mono | 0.8125rem (13px) | 500 | 1.3 | — |
| 代码/指标 | JetBrains Mono | 0.75rem (12px) | 400 | 1.5 | — |

**Typography Rules:**
- 中文字体在前，英文字体作为 fallback：`font-family: 'Noto Sans SC', 'Inter', sans-serif`
- 数字一律用 JetBrains Mono + `font-variant-numeric: tabular-nums` 保证对齐
- 正文字号 ≥ 13px，行高 ≥ 1.6（中文可读性最低要求）
- 标题 weight ≥ 500，正文 weight = 400
- **NEVER use**: Comic Sans, 华文彩云, 任何装饰性中文字体

**Text Decoration:**
- Hero/大标题：无渐变、无投影（暗色背景本身就是装饰）
- 区域标题：可用底部 2px border 作为装饰线
- 正文段落：禁止任何装饰

## 4. Component Stylings

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--accent);
  color: #FFFFFF;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}
.btn-primary:hover {
  background: var(--accent-hover);
  box-shadow: 0 0 12px rgba(var(--accent-rgb), 0.3);
}
.btn-primary:active {
  transform: scale(0.97);
  box-shadow: none;
}
.btn-primary:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.btn-primary:disabled {
  background: var(--text-muted);
  color: var(--text-tertiary);
  cursor: not-allowed;
  box-shadow: none;
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}
.btn-secondary:hover {
  border-color: var(--border-hover);
  color: var(--text);
}
.btn-secondary:active {
  border-color: var(--accent);
}
.btn-secondary:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.btn-secondary:disabled {
  border-color: var(--border);
  color: var(--text-muted);
  cursor: not-allowed;
}
```

### Cards
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  transition: border-color 0.15s ease;
}
.card:hover {
  border-color: var(--border-hover);
}
.card--active {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px rgba(var(--accent-rgb), 0.2);
}
.card__title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 8px;
}
.card__content {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.6;
}
```

### File Tree Navigation
```css
.file-tree {
  background: var(--bg);
  border-right: 1px solid var(--border);
  width: 260px;
  min-width: 200px;
  max-width: 400px;
  overflow-y: auto;
  padding: 8px 0;
}
.file-tree__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px calc(12px + var(--depth, 0) * 16px);
  color: var(--text-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: background 0.1s ease, color 0.1s ease;
  user-select: none;
}
.file-tree__item:hover {
  background: var(--surface-hover);
  color: var(--text);
}
.file-tree__item--active {
  background: var(--accent-soft);
  color: var(--accent);
}
.file-tree__item--folder {
  font-weight: 500;
}
.file-tree__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  opacity: 0.7;
}
.file-tree__drop-zone {
  border: 2px dashed var(--border);
  border-radius: 6px;
  padding: 24px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.8125rem;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.file-tree__drop-zone--active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}
```

### Tabs
```css
.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  overflow-x: auto;
}
.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  border-bottom: 2px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s ease, border-color 0.15s ease;
}
.tab:hover {
  color: var(--text-secondary);
  background: var(--surface-hover);
}
.tab--active {
  color: var(--text);
  border-bottom-color: var(--accent);
}
.tab__close {
  width: 14px;
  height: 14px;
  opacity: 0;
  transition: opacity 0.1s ease;
  cursor: pointer;
}
.tab:hover .tab__close {
  opacity: 0.6;
}
.tab__close:hover {
  opacity: 1;
}
```

### Data Table
```css
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}
.data-table th {
  background: var(--surface-alt);
  color: var(--text-tertiary);
  font-weight: 500;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
}
.data-table td {
  padding: 8px 12px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
  font-variant-numeric: tabular-nums;
}
.data-table tr:hover td {
  background: var(--surface-hover);
}
.data-table td.num-up { color: var(--num-up); }
.data-table td.num-down { color: var(--num-down); }
.data-table td.num-neutral { color: var(--num-neutral); }
```

### Links
```css
a {
  color: var(--accent);
  text-decoration: none;
  transition: color 0.15s ease;
}
a:hover {
  color: var(--accent-hover);
  text-decoration: underline;
  text-underline-offset: 2px;
}
a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

### Tags / Badges
```css
.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 0.6875rem;
  font-weight: 500;
  border-radius: 4px;
  background: var(--surface-alt);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}
.tag--accent {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: transparent;
}
.tag--success {
  background: rgba(34, 197, 94, 0.12);
  color: var(--success);
  border-color: transparent;
}
.tag--error {
  background: rgba(239, 68, 68, 0.12);
  color: var(--error);
  border-color: transparent;
}
.tag--warning {
  background: rgba(245, 158, 11, 0.12);
  color: var(--warning);
  border-color: transparent;
}
```

### Input / Search
```css
.input {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.8125rem;
  color: var(--text);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  width: 100%;
}
.input::placeholder {
  color: var(--text-muted);
}
.input:hover {
  border-color: var(--border-hover);
}
.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.15);
}
```

### KPI Card（数据卡片）
```css
.kpi-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}
.kpi-card__label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.kpi-card__value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}
.kpi-card__value--up { color: var(--num-up); }
.kpi-card__value--down { color: var(--num-down); }
.kpi-card__change {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  margin-top: 4px;
}
.kpi-card__change--up { color: var(--num-up); }
.kpi-card__change--down { color: var(--num-down); }
```

## 5. Layout Principles

**Container:**
- 全宽布局，侧边栏 260px，内容区自适应
- 内容区最大宽度 1400px，内部 padding 24px
- 紧凑间距，信息密度优先

**Spacing Scale:**
- 基础单位：4px
- 组件间距：12-16px
- 区域间距：24px
- 卡片内间距：16px
- Section 标题与内容：12px

**Grid:**
```css
.app-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: 48px 1fr 28px;
  grid-template-areas:
    "sidebar header"
    "sidebar content"
    "sidebar statusbar";
  height: 100vh;
  overflow: hidden;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.statusbar { grid-area: statusbar; }

/* 内容区看板网格 */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
  padding: 16px;
}
```

**响应式内容区内部布局：**
```css
/* 双列布局（左图表 + 右表格） */
.split-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* 全宽单列 */
.full-width {
  grid-column: 1 / -1;
}
```

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | 无阴影，`--bg` 背景 | 页面底层背景 |
| Surface (Level 1) | `--surface` + `1px solid var(--border)` | 卡片、容器、侧边栏 |
| Elevated (Level 2) | `--surface` + `0 4px 12px rgba(0,0,0,0.25)` | 弹窗、下拉菜单、Tooltip |
| Floating (Level 3) | `--surface` + `0 8px 24px rgba(0,0,0,0.35)` | 模态框、拖拽预览 |
| Glow (Level Special) | `0 0 12px rgba(var(--accent-rgb), 0.2)` | 选中态、活跃焦点 |

**Shadow Rules:**
- 暗色背景下阴影要更深更重才有层次感
- 用 `rgba(0,0,0,0.25-0.35)` 替代亮色方案的 `rgba(0,0,0,0.05)`
- 选中/活跃态用蓝色 glow 边框代替阴影

## 7. Animation & Interaction

**Motion Philosophy**: 数据优先，动画服务于信息反馈，不抢注意力
**Tier**: L1 精致静态

### Entrance Animation
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease both;
}

.fade-in-up {
  animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}
```

### Loading States
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface) 25%,
    var(--surface-alt) 50%,
    var(--surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}
```

### 数据变化动画
```css
@keyframes pulse-number {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.number-updating {
  animation: pulse-number 0.6s ease-in-out;
}
```

### Hover & Focus States
```css
/* 所有可交互元素统一 hover 过渡 */
.interactive {
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

/* Focus ring — 全局统一 */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 8. Do's and Don'ts

### Do
- 所有颜色通过 CSS 变量引用，保持主题一致性
- 数字数据必须用等宽字体 + `tabular-nums` 保证列对齐
- 涨跌色严格遵循中国市场惯例（红涨绿跌）
- 表格/列表行必须有 hover 高亮态，方便追踪数据行
- 侧边栏文件树必须支持键盘导航（方向键 + Enter）
- 加载状态必须有骨架屏，不能白屏等待
- 空状态必须有引导提示（如"拖拽研报到此处开始分析"）
- 文件拖拽必须有视觉反馈（边框高亮 + 图标变化）
- 每个 AI 分析结果卡片必须有"重新分析"按钮
- 中文内容行高 ≥ 1.6，字距 ≥ 0.02em

### Don't
- ❌ 不要在数据看板区域使用滚动 reveal 动画（信息需要立即可见）
- ❌ 不要使用纯白色背景或亮色主题（伤害长时间阅读的眼睛）
- ❌ 不要在数字显示区域使用比例字体（会导致列不对齐）
- ❌ 不要在一个视图中混合超过 4 种颜色层级（视觉混乱）
- ❌ 不要在文件树中使用大于 16px 的图标（信息密度优先）
- ❌ 不要在暗色背景上使用 `filter: blur()` 做毛玻璃（性能差且视觉效果差）
- ❌ 不要让 AI 分析结果占据整个屏幕（保持卡片式布局，便于对比）
- ❌ 不要隐藏加载进度（研报分析可能耗时较长，必须有进度条或状态提示）
- ❌ 不要使用 Emoji 作为图标（用 lucide-react 或内联 SVG）
- ❌ 不要自动播放任何声音或通知

## 9. Responsive Behavior

**Breakpoints:**
| Name | Width | Key Changes |
|------|-------|-------------|
| Desktop | > 1024px | 完整布局：左侧文件树 + 右侧内容区 + 多标签 |
| Tablet | 768-1024px | 文件树可折叠为图标模式，内容区全宽 |
| Mobile | < 768px | 文件树抽屉式弹出，单列布局，标签页改为下拉选择 |

**Touch Targets:** 最小 44×44px
**Collapsing Strategy:**
- 文件树：桌面端常驻，平板端折叠为 48px 图标栏，移动端抽屉
- 标签页：桌面端横排，移动端改为下拉选择器
- 看板网格：桌面端 2-3 列，平板端 2 列，移动端单列
- 表格：移动端水平滚动

```css
@media (max-width: 1024px) {
  .app-layout {
    grid-template-columns: 48px 1fr;
  }
  .file-tree {
    width: 48px;
    overflow: hidden;
  }
  .file-tree__item span {
    display: none;
  }
}

@media (max-width: 768px) {
  .app-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 48px auto 1fr 28px;
    grid-template-areas:
      "header"
      "tabs"
      "content"
      "statusbar";
  }
  .sidebar {
    position: fixed;
    left: -280px;
    top: 48px;
    bottom: 28px;
    width: 280px;
    z-index: 100;
    transition: left 0.2s ease;
  }
  .sidebar--open {
    left: 0;
    box-shadow: 4px 0 24px rgba(0,0,0,0.5);
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
```