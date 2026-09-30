"use client";

import { useState } from "react";
import {
  Search,
  Play,
  Loader2,
  FileText,
  BookOpen,
  BarChart2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Layers,
  Table,
  CheckCircle2,
  XCircle,
  Eye,
  Copy,
} from "lucide-react";

interface ReportAnalysis {
  // 基本信息
  title: string;
  institution: string;
  author: string;
  date: string;
  rating: string;
  // 一、一句话逻辑
  oneLiner: string;
  // 二、研究思路
  researchApproach: {
    layers: { level: string; question: string; method: string; chapter: string }[];
    highlights: string[];
  };
  // 三、章节逻辑框架
  chapterTree: string;
  // 四、技术模块
  techModules: { name: string; description: string; keyData: string }[];
  // 五、指标总表
  indicators: {
    category: string;
    items: { name: string; value: string; range: string; direction: string }[];
  }[];
  // 六、图表清单
  charts: { name: string; question: string; keyInfo: string }[];
  // 七、判定规则
  judgment: {
    confirmSignal: string;
    falsification: string;
    trackingPoints: string[];
  };
  // 八、可复用点与局限
  reusable: string[];
  limitations: string[];
}

const mockAnalysis: ReportAnalysis = {
  title: "大周期系列黄金定价研究（一）：拆解黄金定价逻辑与美元美债体系",
  institution: "东海证券",
  author: "张季恺、谢建斌",
  date: "2026-09-10",
  rating: "标配（有色金属）",
  oneLiner:
    '"短期看利率、中期看央行"的换挡期已经到来——短期定价锚（10年期TIPS实际利率）仍在2.39%~2.45%高位构成压制，但拐点信号正在积累；中期定价锚（全球央行购金）在2026Q2以288.9吨创同期纪录回归；长期"美元—美债体系"因高赤字—高利息—高发债循环而脆弱性上升。2026年上半年约30%的下跌被定性为"长期牛市中的结构性回调"，结论是逢低分批买入。',
  researchApproach: {
    layers: [
      { level: "第①层：周期与统计", question: "这轮跌是不是牛市终结？", method: "1971年以来牛熊周期统计 + 牛市内部回撤分布统计", chapter: "第1章" },
      { level: "第②层：基本面七因子", question: "基本面变了吗？变在哪？", method: "逐因子定性+定量复盘 → 13因子加权表", chapter: "第2章" },
      { level: "第③层：货币体系与实证", question: "支撑金价的对手方出了什么问题？", method: "三张资产负债表 + 2SLS/Johansen协整VECM实证", chapter: "第3~6章" },
    ],
    highlights: [
      "用统计分布而不是用观点判断"底"：把本轮回撤放进1971年以来的回撤分布里看分位数",
      "区分"短期锚"和"中期锚"，并对权重排序：实际利率与央行购金同为最高权重",
      "对"常识性定价假设"做实证攻击：用一整章检验"海外买美债压低收益率"是否还成立",
    ],
  },
  chapterTree: `第1章 此轮金价调整基本到位 → 周期定位
  ├─ 回撤阈值统计（表1）+ 牛熊统计（表2）
  └─ 长期收益率分位（图2）
第2章 黄金基本面的变与不变 → 七因子体检
  ├─ 2.1 实际利率与机会成本
  ├─ 2.2 美元与流动性
  ├─ 2.3 央行购金与去美元化（核心）
  ├─ 2.4 投机交易因素
  ├─ 2.5 实物供需
  ├─ 2.6 地缘与中国因素
  └─ 2.7 → 汇总为【表4 13因子+方向+权重】
第3章 美元—美债体系拆解
  ├─ 3.1 四层美元层级（表5）
  ├─ 3.2 三张资产负债表（表6）
  └─ 3.3 定量传导链（表7）
第4章 海外需求对美债收益率影响的失效（实证核心）
  ├─ 2SLS + 日本外汇干预作工具变量
  ├─ Johansen协整 + VECM
  └─ 结论：旧弹性不可外推
第5章 美元—美债体系的脆弱点与滑坡
  ├─ 高赤字—高利息—高发债循环
  ├─ 基差交易杠杆风险（8,300亿美元）
  └─ 离岸美元负债（14.7万亿）放大冲击
第6章 黄金价值锚定属性强化
  ├─ 财政利息敏感性
  ├─ 黄金储备份额分解
  └─ 少量储备再配置弹性测算
第7章 投资建议：逢低分批买入
第8章 风险提示：5条`,
  techModules: [
    {
      name: "模块A｜周期定位",
      description: "回撤阈值 + 牛熊统计 + 牛市内部回调分布",
      keyData: "回撤阈值表：5%级29次/均值16%；10%级11次/均值30%；20%级8次/均值36%。本轮日度最大回撤−29.6%≈历史中位数29%。",
    },
    {
      name: "模块B｜基本面七因子框架",
      description: "七个维度逐项体检 → 汇总为13因子加权表",
      keyData: "13因子表：实际利率(反向+++)、央行购金(正向+++)、政策利率(反向++)、通胀(正向++)、美元(反向++)、流动性(正向++)、财政信用(正向++)、ETF(正向++)、地缘(正向++)、期货(正向+)、供需(中性+)、制造业(反向+)、中美利差(正向+)。",
    },
    {
      name: "模块C｜美元—美债体系",
      description: "三张资产负债表 + 一条传导链 + 一组实证证伪",
      keyData: "核心结论：2007年1,000亿美元占市场3.43%→短期压低46bp；2026年仅占0.49%→压低不足7bp。海外需求压舱石效力被稀释殆尽。",
    },
  ],
  indicators: [
    {
      category: "价格与周期类（判断牛市是否终结）",
      items: [
        { name: "伦敦金现", value: "盘中低至3,942美元/盎司", range: "峰值回撤约30%", direction: "调整基本到位" },
        { name: "回撤阈值分布", value: "5%级29次/10%级11次/20%级8次", range: "中位数29%", direction: "≈历史中位数" },
        { name: "年化收益率", value: "近20年+10.3%/近10年+12.5%", range: "各时间维度", direction: "趋势向上" },
      ],
    },
    {
      category: "利率与通胀类（短期定价锚）",
      items: [
        { name: "10Y TIPS实际收益率", value: "2.39%~2.45%", range: "2023年以来高位", direction: "反向+++" },
        { name: "美国CPI同比", value: "7月3.30%", range: "5月见顶4.17%后连续回落", direction: "正向++" },
        { name: "联邦基金有效利率", value: "3.63%", range: "目标区间3.50%~3.75%", direction: "未加息" },
      ],
    },
    {
      category: "央行与资金流类（中期定价锚）",
      items: [
        { name: "全球央行净购金", value: "2026Q2 288.9吨", range: "同比+62.4%、环比+411.1%", direction: "正向+++" },
        { name: "中国官方黄金储备", value: "7月末7,608万盎司", range: "上半年累计+129万盎司", direction: "正向" },
        { name: "SPDR黄金ETF持仓", value: "9月初回流1,050吨", range: "7月末1,007吨→回流", direction: "正向++" },
      ],
    },
    {
      category: "美元、流动性与财政类",
      items: [
        { name: "美元指数", value: "9月8日98.87", range: "重回100下方", direction: "反向++" },
        { name: "联邦债务/GDP", value: "122.6%（2026Q1）", range: "CBO预计2036年升至120%", direction: "正向++" },
        { name: "净利息支出", value: "占GDP 3.3%→4.6%", range: "相当于联邦财政收入约18%", direction: "正向" },
      ],
    },
    {
      category: "美债体系与替代性类（长期定价锚）",
      items: [
        { name: "非美联储持有中长期美债", value: "20.48万亿美元", range: "2007年2.92万亿→膨胀7倍", direction: "供给主导" },
        { name: "官方黄金储备份额", value: "24.71%（2025）", range: "2000年11.35%→+13.36pct", direction: "价值锚强化" },
        { name: "境外官方黄金vs美债", value: "3.528 vs 3.489万亿美元", range: "2025年接近交叉", direction: "边际替代已发生" },
      ],
    },
  ],
  charts: [
    { name: "图1 伦敦金现走势", question: "1971年以来牛熊在哪？", keyInfo: "标蓝牛市、标灰熊市" },
    { name: "图3 实际利率与金价", question: "实际利率还是不是第一定价变量？", keyInfo: "5Y/10Y/30Y TIPS vs 金价" },
    { name: "图9 中国央行储备", question: "中国央行买不买？", keyInfo: "官方储备资产黄金 + 金价" },
    { name: "图10 全球央行购金", question: "战略买家是否还在？", keyInfo: "全球央行净购入量 + 金价" },
    { name: "图12 黄金ETF持仓", question: "交易型资金退潮了吗？", keyInfo: "SPDR持仓、COMEX管理基金多头" },
    { name: "图22 份额变化分解", question: "份额上升靠数量还是靠价格？", keyInfo: "−9.55 / +0.22 / +22.69" },
    { name: "表4 13因子判断表", question: "谁多谁空、谁权重高？", keyInfo: "全文框架的仪表盘" },
    { name: "表9 市场规模敏感性", question: "结论对口径敏感吗？", keyInfo: "4种口径下的占比与bp换算" },
  ],
  judgment: {
    confirmSignal: "实际利率趋势性回落 + 金价收复前高",
    falsification: "通胀反复触发加息落地、央行购金再度放缓、或ETF回流中断",
    trackingPoints: [
      "8月及三季度美国CPI与9月FOMC路径",
      "2026Q3全球央行购金节奏",
      "ETF与期货多头回流的持续性",
      "美国财政供给与长债回购的实际效果",
    ],
  },
  reusable: [
    "回撤阈值分布表——把"跌了多少"转成"处于历史第几档分位"",
    "13因子方向×权重表——一个可每周更新的"黄金仪表盘"",
    "金价归一化制图法（2005年基期百分比化）——解决同图可比问题",
    ""供给规模膨胀→单位需求影响力衰减"的换算方法——可跨年比较的口径",
  ],
  limitations: [
    "实证结论是"无法识别"而非"证伪存在负向关系"——旧弹性不可外推≠海外需求不再影响",
    "份额分解与再配置弹性是静态测算——不考虑大额订单对市场价格的影响",
    "表4内部存在两处读数口径不一致——建议以正文2.1/2.6节口径为准",
    "因子打分采用定性权重——没有给出权重系数与价格中枢的映射公式",
  ],
};

export default function AnalyzePage() {
  const [selectedFile, setSelectedFile] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ReportAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState("oneliner");

  const files = [
    { folder: "黄金研究", name: "东海证券_拆解黄金定价逻辑与美元美债体系.pdf" },
    { folder: "黄金研究", name: "美联储降息对黄金影响.pdf" },
    { folder: "白酒行业", name: "贵州茅台2024年报点评.pdf" },
    { folder: "白酒行业", name: "五粮液深度报告.pdf" },
    { folder: "CPO 光模块", name: "CPO技术路径与产业链.pdf" },
  ];

  const tabs = [
    { id: "oneliner", label: "一句话逻辑" },
    { id: "approach", label: "研究思路" },
    { id: "chapters", label: "章节框架" },
    { id: "tech", label: "技术模块" },
    { id: "indicators", label: "指标总表" },
    { id: "charts", label: "图表清单" },
    { id: "judgment", label: "判定规则" },
    { id: "reusable", label: "可复用与局限" },
  ];

  const handleAnalyze = () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setActiveTab("oneliner");
    setTimeout(() => {
      setResult(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="max-w-5xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--gray-8)" }}>智能解读</h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--gray-5)" }}>
          选择一篇研报，AI 将拆解其研究框架、核心指标、图表分析和判定规则
        </p>
      </div>

      {/* File Selector + Analyze Button */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md border flex-1" style={{ borderColor: "var(--gray-2)", background: "white" }}>
          <Search size={14} style={{ color: "var(--gray-4)" }} />
          <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)} className="flex-1 text-[13px] bg-transparent outline-none" style={{ color: selectedFile ? "var(--gray-7)" : "var(--gray-4)" }}>
            <option value="">选择一篇研报...</option>
            {files.map((f, i) => (
              <option key={i} value={f.name}>[{f.folder}] {f.name}</option>
            ))}
          </select>
        </div>
        <button onClick={handleAnalyze} disabled={!selectedFile || isAnalyzing} className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium text-white transition-colors disabled:opacity-40" style={{ background: "var(--accent)" }} onMouseEnter={(e) => { if (selectedFile && !isAnalyzing) e.currentTarget.style.background = "var(--accent-hover)"; }} onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}>
          {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          {isAnalyzing ? "分析中..." : "开始解读"}
        </button>
      </div>

      {result ? (
        <div>
          {/* Report Header */}
          <div className="border rounded-lg p-5 mb-4" style={{ borderColor: "var(--gray-2)", background: "white" }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen size={16} style={{ color: "var(--accent)" }} />
                  <span className="text-[11px] px-2 py-0.5 rounded font-medium" style={{ background: "var(--accent-10)", color: "var(--accent)" }}>{result.institution}</span>
                  <span className="text-[11px]" style={{ color: "var(--gray-4)" }}>{result.author} · {result.date}</span>
                </div>
                <h2 className="text-[15px] font-semibold" style={{ color: "var(--gray-8)" }}>{result.title}</h2>
              </div>
              <span className="text-[12px] px-3 py-1 rounded-full font-medium" style={{ background: "rgba(22,163,74,0.08)", color: "var(--success)" }}>{result.rating}</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-0 mb-4 overflow-x-auto border-b" style={{ borderColor: "var(--gray-2)" }}>
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="px-3 py-2 text-[12px] whitespace-nowrap transition-colors border-b-2" style={{ color: activeTab === tab.id ? "var(--accent)" : "var(--gray-4)", borderColor: activeTab === tab.id ? "var(--accent)" : "transparent", fontWeight: activeTab === tab.id ? 500 : 400 }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === "oneliner" && (
              <div className="border rounded-lg p-5" style={{ borderColor: "var(--accent-10)", background: "var(--accent-5)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={16} style={{ color: "var(--accent)" }} />
                  <h3 className="text-[14px] font-medium" style={{ color: "var(--gray-7)" }}>一句话逻辑</h3>
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--gray-7)" }}>{result.oneLiner}</p>
              </div>
            )}

            {activeTab === "approach" && (
              <>
                <div className="border rounded-lg p-5" style={{ borderColor: "var(--gray-2)", background: "white" }}>
                  <h3 className="text-[14px] font-medium mb-3" style={{ color: "var(--gray-7)" }}>三层递进的"证伪式"框架</h3>
                  <div className="overflow-auto">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--gray-2)" }}>
                          <th className="text-left py-2 font-medium" style={{ color: "var(--gray-4)" }}>层次</th>
                          <th className="text-left py-2 font-medium" style={{ color: "var(--gray-4)" }}>要回答的问题</th>
                          <th className="text-left py-2 font-medium" style={{ color: "var(--gray-4)" }}>用的方法</th>
                          <th className="text-left py-2 font-medium" style={{ color: "var(--gray-4)" }}>对应章节</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.researchApproach.layers.map((l, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid var(--gray-2)" }}>
                            <td className="py-2.5 font-medium" style={{ color: "var(--gray-7)" }}>{l.level}</td>
                            <td className="py-2.5" style={{ color: "var(--gray-6)" }}>{l.question}</td>
                            <td className="py-2.5" style={{ color: "var(--gray-5)" }}>{l.method}</td>
                            <td className="py-2.5" style={{ color: "var(--gray-4)" }}>{l.chapter}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="border rounded-lg p-5" style={{ borderColor: "var(--gray-2)", background: "white" }}>
                  <h3 className="text-[14px] font-medium mb-3" style={{ color: "var(--gray-7)" }}>思路精髓</h3>
                  <ul className="space-y-2">
                    {result.researchApproach.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px]" style={{ color: "var(--gray-6)" }}>
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5" style={{ background: "var(--accent-10)", color: "var(--accent)" }}>{i + 1}</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {activeTab === "chapters" && (
              <div className="border rounded-lg p-5" style={{ borderColor: "var(--gray-2)", background: "white" }}>
                <h3 className="text-[14px] font-medium mb-3" style={{ color: "var(--gray-7)" }}>章节逻辑框架</h3>
                <pre className="text-[12px] leading-relaxed whitespace-pre-wrap font-mono" style={{ color: "var(--gray-6)" }}>{result.chapterTree}</pre>
              </div>
            )}

            {activeTab === "tech" && (
              <div className="space-y-3">
                {result.techModules.map((mod, i) => (
                  <div key={i} className="border rounded-lg p-5" style={{ borderColor: "var(--gray-2)", background: "white" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Layers size={16} style={{ color: "var(--accent)" }} />
                      <h3 className="text-[14px] font-medium" style={{ color: "var(--gray-7)" }}>{mod.name}</h3>
                    </div>
                    <p className="text-[13px] mb-2" style={{ color: "var(--gray-5)" }}>{mod.description}</p>
                    <div className="p-3 rounded-md text-[12px]" style={{ background: "var(--gray-1)", color: "var(--gray-6)" }}>
                      <span className="font-medium" style={{ color: "var(--gray-7)" }}>关键数据：</span>{mod.keyData}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "indicators" && (
              <div className="space-y-4">
                {result.indicators.map((cat, ci) => (
                  <div key={ci} className="border rounded-lg overflow-hidden" style={{ borderColor: "var(--gray-2)" }}>
                    <div className="px-4 py-2.5 text-[12px] font-medium" style={{ background: "var(--gray-1)", color: "var(--gray-6)" }}>{cat.category}</div>
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--gray-2)" }}>
                          <th className="text-left px-4 py-2 font-medium" style={{ color: "var(--gray-4)" }}>指标</th>
                          <th className="text-left px-4 py-2 font-medium" style={{ color: "var(--gray-4)" }}>报告读数</th>
                          <th className="text-left px-4 py-2 font-medium" style={{ color: "var(--gray-4)" }}>区间/阈值</th>
                          <th className="text-left px-4 py-2 font-medium" style={{ color: "var(--gray-4)" }}>方向</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cat.items.map((item, ii) => (
                          <tr key={ii} style={{ borderBottom: "1px solid var(--gray-2)" }}>
                            <td className="px-4 py-2.5 font-medium" style={{ color: "var(--gray-7)" }}>{item.name}</td>
                            <td className="px-4 py-2.5 tabular-nums" style={{ color: "var(--gray-8)" }}>{item.value}</td>
                            <td className="px-4 py-2.5" style={{ color: "var(--gray-5)" }}>{item.range}</td>
                            <td className="px-4 py-2.5">
                              <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: item.direction.includes("正向") ? "rgba(220,38,38,0.08)" : item.direction.includes("反向") ? "rgba(22,163,74,0.08)" : "var(--gray-1)", color: item.direction.includes("正向") ? "var(--danger)" : item.direction.includes("反向") ? "var(--success)" : "var(--gray-5)" }}>{item.direction}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "charts" && (
              <div className="border rounded-lg overflow-hidden" style={{ borderColor: "var(--gray-2)" }}>
                <table className="w-full text-[12px]">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--gray-2)" }}>
                      <th className="text-left px-4 py-2.5 font-medium" style={{ background: "var(--gray-1)", color: "var(--gray-4)" }}>图表</th>
                      <th className="text-left px-4 py-2.5 font-medium" style={{ background: "var(--gray-1)", color: "var(--gray-4)" }}>回答什么问题</th>
                      <th className="text-left px-4 py-2.5 font-medium" style={{ background: "var(--gray-1)", color: "var(--gray-4)" }}>关键信息</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.charts.map((c, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--gray-2)" }}>
                        <td className="px-4 py-2.5 font-medium" style={{ color: "var(--gray-7)" }}>{c.name}</td>
                        <td className="px-4 py-2.5" style={{ color: "var(--gray-6)" }}>{c.question}</td>
                        <td className="px-4 py-2.5" style={{ color: "var(--gray-5)" }}>{c.keyInfo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "judgment" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-5" style={{ borderColor: "var(--gray-2)", background: "white" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={16} style={{ color: "var(--success)" }} />
                      <h3 className="text-[13px] font-medium" style={{ color: "var(--gray-7)" }}>确认信号</h3>
                    </div>
                    <p className="text-[13px]" style={{ color: "var(--gray-6)" }}>{result.judgment.confirmSignal}</p>
                  </div>
                  <div className="border rounded-lg p-5" style={{ borderColor: "var(--gray-2)", background: "white" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle size={16} style={{ color: "var(--danger)" }} />
                      <h3 className="text-[13px] font-medium" style={{ color: "var(--gray-7)" }}>证伪条件</h3>
                    </div>
                    <p className="text-[13px]" style={{ color: "var(--gray-6)" }}>{result.judgment.falsification}</p>
                  </div>
                </div>
                <div className="border rounded-lg p-5" style={{ borderColor: "var(--gray-2)", background: "white" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Eye size={16} style={{ color: "var(--accent)" }} />
                    <h3 className="text-[13px] font-medium" style={{ color: "var(--gray-7)" }}>后续跟踪要点</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {result.judgment.trackingPoints.map((p, i) => (
                      <li key={i} className="text-[13px] flex items-start gap-2" style={{ color: "var(--gray-6)" }}>
                        <span className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ background: "var(--accent)" }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {activeTab === "reusable" && (
              <>
                <div className="border rounded-lg p-5" style={{ borderColor: "var(--gray-2)", background: "white" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Copy size={16} style={{ color: "var(--success)" }} />
                    <h3 className="text-[14px] font-medium" style={{ color: "var(--gray-7)" }}>可复用点</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.reusable.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px]" style={{ color: "var(--gray-6)" }}>
                        <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border rounded-lg p-5" style={{ borderColor: "var(--gray-2)", background: "white" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} style={{ color: "var(--warning)" }} />
                    <h3 className="text-[14px] font-medium" style={{ color: "var(--gray-7)" }}>局限与注意事项</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.limitations.map((l, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px]" style={{ color: "var(--gray-6)" }}>
                        <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "var(--warning)" }} />
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-16 text-center" style={{ borderColor: "var(--gray-2)", background: "var(--gray-1)" }}>
          <FileText size={40} strokeWidth={1.2} className="mx-auto mb-4" style={{ color: "var(--gray-3)" }} />
          <p className="text-[14px] font-medium mb-1" style={{ color: "var(--gray-5)" }}>选择研报并点击「开始解读」</p>
          <p className="text-[12px]" style={{ color: "var(--gray-4)" }}>AI 将拆解研究框架、核心指标、图表分析和判定规则</p>
        </div>
      )}
    </div>
  );
}