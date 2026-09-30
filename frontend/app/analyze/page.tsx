"use client";

import { useState } from "react";
import {
  Search,
  Play,
  Loader2,
  GitBranch,
  BarChart2,
  PieChart,
  Lightbulb,
} from "lucide-react";

interface AnalysisResult {
  framework: string;
  indicators: string;
  charts: string;
  thinking: string;
}

export default function AnalyzePage() {
  const [selectedFile, setSelectedFile] = useState("贵州茅台2024年报点评.pdf");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setResult({
        framework:
          "研究方法：自下而上选股 + 行业横向对比\n分析逻辑：品牌护城河 → 盈利预测 → 估值评估 → 目标价推导\n核心假设：提价能力持续、渠道库存健康、市占率稳步提升",
        indicators:
          "PE(TTM): 28.5x（历史区间 25-35x）\n营收增速: 15.2%（目标区间 10-20%）\n净利润率: 52.3%（行业领先）\nROE: 33.8%（持续高位）",
        charts:
          "K线图：近一年股价走势，标注关键支撑阻力位\n营收拆分饼图：茅台酒/系列酒/其他占比\n估值对比折线图：与五粮液、泸州老窖 PE 对比",
        thinking:
          "从品牌护城河切入，重点关注提价能力和渠道控制力。通过对比同行业估值水平，判断当前估值是否合理。结合宏观消费复苏预期，推导未来12个月目标价。",
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--gray-8)" }}
        >
          智能解读
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--gray-5)" }}>
          选择一篇研报，AI 将自动解析其研究框架、核心指标和分析思路
        </p>
      </div>

      {/* File Selector + Analyze Button */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-md border flex-1"
          style={{
            borderColor: "var(--gray-2)",
            background: "white",
          }}
        >
          <Search size={14} style={{ color: "var(--gray-4)" }} />
          <select
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="flex-1 text-[13px] bg-transparent outline-none"
            style={{ color: "var(--gray-7)" }}
          >
            <option>贵州茅台2024年报点评.pdf</option>
            <option>新能源行业深度报告.pdf</option>
            <option>宏观经济季度展望.pdf</option>
            <option>芯片产业链梳理.pdf</option>
          </select>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium text-white transition-colors disabled:opacity-50"
          style={{ background: "var(--accent)" }}
          onMouseEnter={(e) => {
            if (!isAnalyzing) e.currentTarget.style.background = "var(--accent-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--accent)";
          }}
        >
          {isAnalyzing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Play size={14} />
          )}
          {isAnalyzing ? "分析中..." : "开始解读"}
        </button>
      </div>

      {/* Results */}
      {result ? (
        <div className="grid grid-cols-2 gap-4">
          <ResultCard
            icon={<GitBranch size={18} />}
            title="研报框架"
            content={result.framework}
          />
          <ResultCard
            icon={<BarChart2 size={18} />}
            title="核心指标"
            content={result.indicators}
          />
          <ResultCard
            icon={<PieChart size={18} />}
            title="图表说明"
            content={result.charts}
          />
          <ResultCard
            icon={<Lightbulb size={18} />}
            title="分析思路"
            content={result.thinking}
          />
        </div>
      ) : (
        /* Empty State */
        <div
          className="border rounded-lg p-16 text-center"
          style={{
            borderColor: "var(--gray-2)",
            background: "var(--gray-1)",
          }}
        >
          <Search
            size={40}
            strokeWidth={1.2}
            className="mx-auto mb-4"
            style={{ color: "var(--gray-3)" }}
          />
          <p
            className="text-[14px] font-medium mb-1"
            style={{ color: "var(--gray-5)" }}
          >
            选择研报并点击「开始解读」
          </p>
          <p className="text-[12px]" style={{ color: "var(--gray-4)" }}>
            AI 将自动提取研报的研究框架、核心指标和分析思路
          </p>
        </div>
      )}
    </div>
  );
}

function ResultCard({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
}) {
  return (
    <div
      className="border rounded-lg p-4"
      style={{
        borderColor: "var(--gray-2)",
        background: "white",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div style={{ color: "var(--accent)" }}>{icon}</div>
        <h3
          className="text-[13px] font-medium"
          style={{ color: "var(--gray-7)" }}
        >
          {title}
        </h3>
      </div>
      <p
        className="text-[12px] leading-relaxed whitespace-pre-line"
        style={{ color: "var(--gray-5)" }}
      >
        {content}
      </p>
    </div>
  );
}
