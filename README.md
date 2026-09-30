# 研报智析 ReportMind

> 面向投研新人的智能研报学习工具。通过 AI 解析券商研报，帮助快速建立行业研究框架。

## ✨ 核心功能

### ① 研报导入
- 📁 多文件夹管理（按行业/主题分类）
- 📄 拖拽上传 PDF 研报
- 📅 自动从 PDF 第一页提取研报发布日期
- 👁️ 单击文件名即可预览
- ✏️ 文件重命名、拖拽排序
- 💾 数据持久化（刷新不丢失）

### ② 智能解读
对单篇研报进行结构化拆解，输出 8 大模块：
- 一句话逻辑 — 核心论证链浓缩
- 研究思路 — 三层递进证伪式框架
- 章节逻辑框架 — 树状结构展示
- 技术模块拆解 — 核心模块 + 关键数据
- 指标总表 — 按类别分表，含读数/区间/方向
- 图表清单 — 每张图回答什么问题
- 判定规则 — 确认信号/证伪条件/跟踪要点
- 可复用点与局限 — 批判性总结

### ③ 框架搭建
- 选择研究主题（文件夹），AI 自动生成研究框架
- 研究维度 + 权重分配
- 可操作的执行建议

### ④ 数据看板
- KPI 指标卡（涨跌色高亮）
- 季度财务数据表格
- 接入 AKShare 数据源

### ⑤ 趋势研判
- AI 生成短期/中期趋势判断
- 关键支撑/阻力位
- 风险提示 + 免责声明

### 📖 PDF 预览与问答
- 左侧 PDF 原文渲染（react-pdf，支持连续滚动/翻页模式）
- 右侧研报导读分析
- 划线提问：选中文本后弹出提问按钮
- 多轮对话问答（接入 Mimo AI 模型）
- 可拖拽分割线调整左右比例

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 16 + React + Tailwind CSS |
| PDF 渲染 | react-pdf (pdf.js) |
| 图表 | ECharts |
| 后端 | Python FastAPI |
| PDF 解析 | pdfplumber + MarkItDown |
| 数据源 | AKShare（免费金融数据） |
| AI 模型 | Mimo（小米）via OpenAI 兼容 API |
| 数据持久化 | localStorage（元数据）+ IndexedDB（PDF 文件） |

## 🚀 快速开始

### 前置要求
- Node.js 18+
- Python 3.12+
- uv（Python 包管理器）

### 1. 克隆项目
```bash
git clone https://github.com/wangow196-oss/research-builder.git
cd research-builder
```

### 2. 安装前端依赖
```bash
cd frontend
npm install
```

### 3. 安装后端依赖
```bash
cd ../
uv venv .venv
uv pip install fastapi uvicorn python-multipart pdfplumber akshare markitdown openai
```

### 4. 启动后端
```bash
# 设置 AI API Key（可选，不设置则使用模拟回答）
$env:MIMO_API_KEY="你的API Key"

# 启动
cd backend
../.venv/Scripts/python.exe -m uvicorn main:app --reload
```

### 5. 启动前端
```bash
cd frontend
npm run dev
```

### 6. 打开浏览器
访问 http://localhost:3000

## 📁 项目结构

```
research-builder/
├── README.md
├── PRD.md                    # 产品需求文档
├── DESIGN.md                 # 设计规范
├── frontend/                 # Next.js 前端
│   ├── app/
│   │   ├── import/           # 研报导入
│   │   ├── analyze/          # 智能解读
│   │   ├── framework/        # 框架搭建
│   │   ├── dashboard/        # 数据看板
│   │   └── trend/            # 趋势研判
│   ├── components/
│   │   ├── Sidebar.tsx       # 左侧导航
│   │   ├── PdfViewer.tsx     # PDF 查看器
│   │   └── QAPanel.tsx       # 问答面板
│   └── lib/
│       ├── store.tsx         # 全局状态管理
│       └── db.ts             # IndexedDB 存储
├── backend/                  # FastAPI 后端
│   ├── main.py
│   ├── routers/
│   │   ├── files.py          # 文件上传 API
│   │   ├── analyze.py        # AI 分析 API
│   │   ├── data.py           # AKShare 数据 API
│   │   └── qa.py             # 问答 API
│   └── services/
│       ├── pdf_parser.py     # PDF 解析
│       ├── ai_analyzer.py    # AI 分析
│       └── akshare_client.py # AKShare 数据
└── .venv/                    # Python 虚拟环境
```

## 📝 使用流程

1. **导入研报** → 在「研报导入」页面创建文件夹，拖拽上传 PDF
2. **预览研报** → 点击文件名打开 PDF 预览，右侧显示导读分析
3. **划线提问** → 在 PDF 中选中文字，点击「提问」按钮向 AI 提问
4. **智能解读** → 切换到「智能解读」页面，选择研报进行深度分析
5. **框架搭建** → 在「框架搭建」页面选择主题，生成研究框架
6. **数据看板** → 在「数据看板」页面查看关键指标
7. **趋势研判** → 在「趋势研判」页面获取 AI 趋势判断

## ⚠️ 免责声明

本工具仅供学习和研究使用，不构成任何投资建议。投资有风险，决策需谨慎。

## 📄 License

MIT
