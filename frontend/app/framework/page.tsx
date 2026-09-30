"use client";

import { useState } from "react";
import {
  Puzzle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  FolderOpen,
  Loader2,
} from "lucide-react";

const folderOptions = [
  { id: "gold", name: "黄金研究", icon: "🥇", count: 2 },
  { id: "baijiu", name: "白酒行业", icon: "🍷", count: 2 },
  { id: "cpo", name: "CPO 光模块", icon: "💡", count: 1 },
];

const frameworkData: Record<string, { dimensions: { name: string; desc: string; weight: string }[]; actions: { text: string; type: "next" | "watch" | "compare" }[] }> = {
  gold: {
    dimensions: [
      { name: "美元指数", desc: "DXY 走势、美联储政策预期", weight: "30%" },
      { name: "实际利率", desc: "10Y TIPS 收益率、通胀预期", weight: "25%" },
      { name: "避险需求", desc: "地缘政治风险、VIX 指数", weight: "20%" },
      { name: "央行购金", desc: "全球央行储备变化、ETF 持仓", weight: "25%" },
    ],
    actions: [
      { text: "查看 COMEX 黄金最新价格和持仓数据", type: "next" },
      { text: "关注美联储议息会议纪要", type: "watch" },
      { text: "对比白银、铂金等贵金属走势", type: "compare" },
    ],
  },
  baijiu: {
    dimensions: [
      { name: "品牌力", desc: "提价能力、市占率、品牌溢价", weight: "30%" },
      { name: "渠道力", desc: "经销商数量、库存水平、渠道效率", weight: "25%" },
      { name: "产品力", desc: "SKU 结构、新品节奏、产品矩阵", weight: "20%" },
      { name: "估值水平", desc: "PE/PB/DCF 估值、历史分位数", weight: "25%" },
    ],
    actions: [
      { text: "查看茅台最新季度营收数据", type: "next" },
      { text: "关注经销商库存周转天数变化", type: "watch" },
      { text: "对比五粮液、泸州老窖估值水平", type: "compare" },
    ],
  },
  cpo: {
    dimensions: [
      { name: "技术路径", desc: "CPO vs 传统光模块、技术成熟度", weight: "30%" },
      { name: "产业链", desc: "上游芯片、中游封装、下游应用", weight: "25%" },
      { name: "需求端", desc: "AI 算力需求、数据中心建设", weight: "25%" },
      { name: "竞争格局", desc: "市场份额、国产替代进度", weight: "20%" },
    ],
    actions: [
      { text: "查看中际旭创、新易盛最新财报", type: "next" },
      { text: "关注 800G/1.6T 光模块出货量", type: "watch" },
      { text: "对比海外 Coherent、II-VI 等厂商", type: "compare" },
    ],
  },
};

export default function FrameworkPage() {
  const [selectedFolder, setSelectedFolder] = useState("gold");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(true);

  const currentFolder = folderOptions.find((f) => f.id === selectedFolder);
  const currentFramework = frameworkData[selectedFolder];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setShowResult(true);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--gray-8)" }}>
          框架搭建
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--gray-5)" }}>
          选择一个研究主题，AI 将基于该主题下的研报生成可复用的研究框架
        </p>
      </div>

      {/* Folder Selector + Generate Button */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md border flex-1" style={{ borderColor: "var(--gray-2)", background: "white" }}>
          <FolderOpen size={14} style={{ color: "var(--gray-4)" }} />
          <select
            value={selectedFolder}
            onChange={(e) => {
              setSelectedFolder(e.target.value);
              setShowResult(false);
            }}
            className="flex-1 text-[13px] bg-transparent outline-none"
            style={{ color: "var(--gray-7)" }}
          >
            {folderOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.icon} {f.name}（{f.count} 篇研报）
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium text-white transition-colors disabled:opacity-50"
          style={{ background: "var(--accent)" }}
          onMouseEnter={(e) => {
            if (!isGenerating) e.currentTarget.style.background = "var(--accent-hover)";
          }}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
        >
          {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Puzzle size={14} />}
          {isGenerating ? "生成中..." : "生成框架"}
        </button>
      </div>

      {showResult && currentFramework ? (
        <div className="space-y-6">
          {/* Framework Title */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border" style={{ borderColor: "var(--accent-10)", background: "var(--accent-5)" }}>
            <span className="text-[20px]">{currentFolder?.icon}</span>
            <span className="text-[14px] font-medium" style={{ color: "var(--gray-8)" }}>
              研究框架：{currentFolder?.name}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded ml-auto" style={{ background: "var(--accent)", color: "white" }}>
              基于 {currentFolder?.count} 篇研报生成
            </span>
          </div>

          {/* Research Dimensions */}
          <div>
            <h2 className="text-[13px] font-medium mb-3" style={{ color: "var(--gray-6)" }}>
              研究维度
            </h2>
            <div className="space-y-2">
              {currentFramework.dimensions.map((dim, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-lg border" style={{ borderColor: "var(--gray-2)", background: "white" }}>
                  <span className="w-6 h-6 rounded flex items-center justify-center text-[11px] font-semibold" style={{ background: "var(--accent-10)", color: "var(--accent)" }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium" style={{ color: "var(--gray-7)" }}>
                      {dim.name}
                    </span>
                    <span className="text-[12px] ml-2" style={{ color: "var(--gray-4)" }}>
                      {dim.desc}
                    </span>
                  </div>
                  <span className="text-[12px] tabular-nums font-medium" style={{ color: "var(--accent)" }}>
                    权重 {dim.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Suggestions */}
          <div>
            <h2 className="text-[13px] font-medium mb-3" style={{ color: "var(--gray-6)" }}>
              执行建议
            </h2>
            <div className="space-y-2">
              {currentFramework.actions.map((action, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg border" style={{ borderColor: "var(--gray-2)", background: "white" }}>
                  {action.type === "next" ? (
                    <ArrowRight size={14} style={{ color: "var(--accent)" }} />
                  ) : action.type === "watch" ? (
                    <AlertCircle size={14} style={{ color: "var(--warning)" }} />
                  ) : (
                    <CheckCircle2 size={14} style={{ color: "var(--success)" }} />
                  )}
                  <span className="text-[13px]" style={{ color: "var(--gray-7)" }}>
                    {action.text}
                  </span>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded ml-auto"
                    style={{
                      background: action.type === "next" ? "var(--accent-10)" : action.type === "watch" ? "rgba(217,119,6,0.08)" : "rgba(22,163,74,0.08)",
                      color: action.type === "next" ? "var(--accent)" : action.type === "watch" ? "var(--warning)" : "var(--success)",
                    }}
                  >
                    {action.type === "next" ? "下一步" : action.type === "watch" ? "关注" : "对比"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="border rounded-lg p-16 text-center" style={{ borderColor: "var(--gray-2)", background: "var(--gray-1)" }}>
          <Puzzle size={40} strokeWidth={1.2} className="mx-auto mb-4" style={{ color: "var(--gray-3)" }} />
          <p className="text-[14px] font-medium mb-1" style={{ color: "var(--gray-5)" }}>
            选择研究主题并点击「生成框架」
          </p>
          <p className="text-[12px]" style={{ color: "var(--gray-4)" }}>
            AI 将基于该主题下的所有研报，生成可复用的研究框架和执行建议
          </p>
        </div>
      )}
    </div>
  );
}