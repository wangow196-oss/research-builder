"use client";

import { useState } from "react";
import {
  Search,
  Play,
  Loader2,
  FileText,
  ChevronDown,
  BookOpen,
  BarChart2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Layers,
} from "lucide-react";

interface ReportAnalysis {
  // 基本信息
  title: string;
  institution: string;
  author: string;
  date: string;
  rating: string;
  // 摘要
  summary: string;
  // 核心观点
  coreViews: string[];
  // 研究框架
  framework: {
    method: string;
    logic: string;
    assumptions: string[];
  };
  // 核心指标
  indicators: {
    name: string;
    value: string;
    range: string;
    trend: "up" | "down" | "neutral";
  }[];
  // 图表分析
  charts: {
    type: string;
    description: string;
  }[];
  // 风险提示
  risks: string[];
  // 投资建议
  recommendation: string;
}

const mockAnalysis: ReportAnalysis = {
  title: "黄金定价框架梳理",
  institution: "东海证券",
  author: "张三",
  date: "2024-03-15",
  rating: "买入",
  summary:
    "本报告系统梳理了黄金的定价框架，从美元指数、实际利率、避险需求、央行购金四个维度分析黄金价格走势。报告认为当前黄金处于长期牛市中，短期回调即是买入机会。",
  coreViews: [
    "美元指数走弱是金价上涨的核心驱动力",
    "实际利率下行支撑黄金估值提升",
    "全球央行持续增持黄金储备，需求端形成支撑",
    "地缘政治风险溢价长期存在",
  ],
  framework: {
    method: "多因子定价模型 + 历史回归分析",
    logic: "美元指数 ↓ → 黄金价格 ↑；实际利率 ↓ → 黄金估值 ↑",
    assumptions: [
      "美联储降息周期延续",
      "全球去美元化趋势不可逆",
      "地缘政治风险维持高位",
    ],
  },
  indicators: [
    { name: "COMEX 黄金", value: "2,180 美元/盎司", range: "1,900-2,500", trend: "up" },
    { name: "美元指数 DXY", value: "103.5", range: "100-108", trend: "down" },
    { name: "10Y TIPS 收益率", value: "1.85%", range: "1.5%-2.2%", trend: "down" },
    { name: "全球央行购金量", value: "1,037 吨/年", range: "800-1,200", trend: "up" },
    { name: "SPDR 黄金持仓", value: "830 吨", range: "750-900", trend: "neutral" },
  ],
  charts: [
    { type: "折线图", description: "COMEX 黄金价格 vs 美元指数（近 10 年负相关关系）" },
    { type: "散点图", description: "实际利率 vs 黄金价格回归分析（R²=0.85）" },
    { type: "柱状图", description: "全球央行年度购金量（2018-2024）" },
    { type: "面积图", description: "SPDR 黄金 ETF 持仓量变化趋势" },
  ],
  risks: [
    "美联储加息超预期，实际利率快速上行",
    "美元指数大幅走强压制金价",
    "全球经济快速复苏导致风险偏好回升",
    "数字货币替代效应增强",
  ],
  recommendation:
    "看好黄金中长期走势，建议逢低配置。短期关注 2,150 美元支撑位，目标价 2,500 美元/盎司。",
};

export default function AnalyzePage() {
  const [selectedFile, setSelectedFile] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ReportAnalysis | null>(null);

  const files = [
    { folder: "黄金研究", name: "黄金定价框架梳理_东海证券.pdf" },
    { folder: "黄金研究", name: "美联储降息对黄金影响.pdf" },
    { folder: "白酒行业", name: "贵州茅台2024年报点评.pdf" },
    { folder: "白酒行业", name: "五粮液深度报告.pdf" },
    { folder: "CPO 光模块", name: "CPO技术路径与产业链.pdf" },
  ];

  const handleAnalyze = () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setResult(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="max-w-5xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--gray-8)" }}>
          智能解读
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--gray-5)" }}>
          选择一篇研报，AI 将自动解析其研究框架、核心指标和分析思路
        </p>
      </div>

      {/* File Selector + Analyze Button */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md border flex-1" style={{ borderColor: "var(--gray-2)", background: "white" }}>
          <Search size={14} style={{ color: "var(--gray-4)" }} />
          <select
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="flex-1 text-[13px] bg-transparent outline-none"
            style={{ color: selectedFile ? "var(--gray-7)" : "var(--gray-4)" }}
          >
            <option value="">选择一篇研报...</option>
            {files.map((f, i) => (
              <option key={i} value={f.name}>
                [{f.folder}] {f.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={!selectedFile || isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium text-white transition-colors disabled:opacity-40"
          style={{ background: "var(--accent)" }}
          onMouseEnter={(e) => {
            if (selectedFile && !isAnalyzing) e.currentTarget.style.background = "var(--accent-hover)";
          }}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
        >
          {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          {isAnalyzing ? "分析中..." : "开始解读"}
        </button>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* 1. 报告基本信息 */}
          <div className="border rounded-lg p-5" style={{ borderColor: "var(--gray-2)", background: "white" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen size={16} style={{ color: "var(--accent)" }} />
                  <span className="text-[11px] px-2 py-0.5 rounded font-medium" style={{ background: "var(--accent-10)", color: "var(--accent)" }}>
                    {result.institution}
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--gray-4)" }}>
                    {result.author} · {result.date}
                  </span>
                </div>
                <h2 className="text-lg font-semibold" style={{ color: "var(--gray-8)" }}>
                  {result.title}
                </h2>
              </div>
              <span className="text-[12px] px-3 py-1 rounded-full font-medium" style={{ background: "rgba(22,163,74,0.08)", color: "var(--success)" }}>
                {result.rating}
              </span>
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--gray-6)" }}>
              {result.summary}
            </p>
          </div>

          {/* 2. 核心观点 */}
          <div className="border rounded-lg p-5" style={{ borderColor: "var(--gray-2)", background: "white" }}>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={16} style={{ color: "var(--accent)" }} />
              <h3 className="text-[14px] font-medium" style={{ color: "var(--gray-7)" }}>核心观点</h3>
            </div>
            <ul className="space-y-2">
              {result.coreViews.map((view, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px]" style={{ color: "var(--gray-6)" }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5" style={{ background: "var(--accent-10)", color: "var(--accent)" }}>
                    {i + 1}
                  </span>
                  {view}
                </li>
              ))}
            </ul>
          </div>

          {/* 3. 研究框架 */}
          <div className="border rounded-lg p-5" style={{ borderColor: "var(--gray-2)", background: "white" }}>
            <div className="flex items-center gap-2 mb-3">
              <Layers size={16} style={{ color: "var(--accent)" }} />
              <h3 className="text-[14px] font-medium" style={{ color: "var(--gray-7)" }}>研究框架</h3>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--gray-4)" }}>研究方法</span>
                <p className="text-[13px] mt-0.5" style={{ color: "var(--gray-6)" }}>{result.framework.method}</p>
              </div>
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--gray-4)" }}>分析逻辑</span>
                <p className="text-[13px] mt-0.5 font-mono" style={{ color: "var(--gray-6)" }}>{result.framework.logic}</p>
              </div>
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--gray-4)" }}>核心假设</span>
                <ul className="mt-1 space-y-1">
                  {result.framework.assumptions.map((a, i) => (
                    <li key={i} className="text-[13px] flex items-center gap-2" style={{ color: "var(--gray-6)" }}>
                      <span className="w-1 h-1 rounded-full" style={{ background: "var(--accent)" }} />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 4. 核心指标 */}
          <div className="border rounded-lg p-5" style={{ borderColor: "var(--gray-2)", background: "white" }}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 size={16} style={{ color: "var(--accent)" }} />
              <h3 className="text-[14px] font-medium" style={{ color: "var(--gray-7)" }}>核心指标</h3>
            </div>
            <div className="overflow-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--gray-2)" }}>
                    <th className="text-left py-2 font-medium" style={{ color: "var(--gray-4)" }}>指标</th>
                    <th className="text-right py-2 font-medium" style={{ color: "var(--gray-4)" }}>当前值</th>
                    <th className="text-right py-2 font-medium" style={{ color: "var(--gray-4)" }}>参考区间</th>
                    <th className="text-right py-2 font-medium" style={{ color: "var(--gray-4)" }}>趋势</th>
                  </tr>
                </thead>
                <tbody>
                  {result.indicators.map((ind, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--gray-2)" }}>
                      <td className="py-2.5 font-medium" style={{ color: "var(--gray-7)" }}>{ind.name}</td>
                      <td className="py-2.5 text-right tabular-nums font-medium" style={{ color: "var(--gray-8)" }}>{ind.value}</td>
                      <td className="py-2.5 text-right tabular-nums" style={{ color: "var(--gray-4)" }}>{ind.range}</td>
                      <td className="py-2.5 text-right">
                        <TrendingUp
                          size={14}
                          style={{
                            color: ind.trend === "up" ? "var(--danger)" : ind.trend === "down" ? "var(--success)" : "var(--gray-4)",
                            display: "inline",
                            transform: ind.trend === "down" ? "scaleY(-1)" : "none",
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. 图表分析 */}
          <div className="border rounded-lg p-5" style={{ borderColor: "var(--gray-2)", background: "white" }}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 size={16} style={{ color: "var(--accent)" }} />
              <h3 className="text-[14px] font-medium" style={{ color: "var(--gray-7)" }}>图表分析</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {result.charts.map((chart, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-md" style={{ background: "var(--gray-1)" }}>
                  <span className="text-[11px] px-1.5 py-0.5 rounded font-medium flex-shrink-0" style={{ background: "var(--accent-10)", color: "var(--accent)" }}>
                    {chart.type}
                  </span>
                  <span className="text-[12px]" style={{ color: "var(--gray-5)" }}>{chart.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 6. 风险提示 */}
          <div className="border rounded-lg p-5" style={{ borderColor: "var(--gray-2)", background: "white" }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} style={{ color: "var(--warning)" }} />
              <h3 className="text-[14px] font-medium" style={{ color: "var(--gray-7)" }}>风险提示</h3>
            </div>
            <ul className="space-y-1.5">
              {result.risks.map((risk, i) => (
                <li key={i} className="text-[13px] flex items-start gap-2" style={{ color: "var(--gray-5)" }}>
                  <span className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ background: "var(--warning)" }} />
                  {risk}
                </li>
              ))}
            </ul>
          </div>

          {/* 7. 投资建议 */}
          <div className="border rounded-lg p-5" style={{ borderColor: "var(--accent-10)", background: "var(--accent-5)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} style={{ color: "var(--accent)" }} />
              <h3 className="text-[14px] font-medium" style={{ color: "var(--accent)" }}>投资建议</h3>
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--gray-7)" }}>
              {result.recommendation}
            </p>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="border rounded-lg p-16 text-center" style={{ borderColor: "var(--gray-2)", background: "var(--gray-1)" }}>
          <FileText size={40} strokeWidth={1.2} className="mx-auto mb-4" style={{ color: "var(--gray-3)" }} />
          <p className="text-[14px] font-medium mb-1" style={{ color: "var(--gray-5)" }}>
            选择研报并点击「开始解读」
          </p>
          <p className="text-[12px]" style={{ color: "var(--gray-4)" }}>
            AI 将自动提取研报的研究框架、核心指标、图表分析和投资建议
          </p>
        </div>
      )}
    </div>
  );
}