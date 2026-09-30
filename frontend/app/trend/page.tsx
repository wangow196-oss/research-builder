"use client";

import { useState } from "react";
import {
  Target,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";

export default function TrendPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    shortTerm: { trend: string; reason: string };
    midTerm: { trend: string; reason: string };
    support: string;
    resistance: string;
  } | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setResult({
        shortTerm: {
          trend: "偏多震荡",
          reason:
            "近期放量突破年线，MACD 金叉确认，短期动能偏强。但 RSI 接近 70，需警惕回调风险。",
        },
        midTerm: {
          trend: "区间整理",
          reason:
            "估值处于历史中枢附近（PE 28.5x vs 5年均值 30x），基本面稳健但缺乏催化剂，预计在 1680-1850 区间震荡。",
        },
        support: "1,680",
        resistance: "1,850",
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--gray-8)" }}
          >
            趋势研判
          </h1>
          <p
            className="text-[13px] mt-1"
            style={{ color: "var(--gray-5)" }}
          >
            AI 基于看板数据，对近期指标走向做初步判断
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium text-white transition-colors disabled:opacity-50"
          style={{ background: "var(--accent)" }}
          onMouseEnter={(e) => {
            if (!isGenerating)
              e.currentTarget.style.background = "var(--accent-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--accent)";
          }}
        >
          {isGenerating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Target size={14} />
          )}
          {isGenerating ? "研判中..." : "生成研判"}
        </button>
      </div>

      {result ? (
        <div className="space-y-4">
          {/* Short Term */}
          <div
            className="border rounded-lg p-5"
            style={{ borderColor: "var(--gray-2)", background: "white" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} style={{ color: "var(--accent)" }} />
              <h3
                className="text-[14px] font-medium"
                style={{ color: "var(--gray-7)" }}
              >
                短期趋势（1-2 周）
              </h3>
              <span
                className="text-[12px] px-2 py-0.5 rounded font-medium ml-auto"
                style={{
                  background: "rgba(220, 38, 38, 0.08)",
                  color: "var(--danger)",
                }}
              >
                {result.shortTerm.trend}
              </span>
            </div>
            <p
              className="text-[13px] leading-relaxed"
              style={{ color: "var(--gray-5)" }}
            >
              {result.shortTerm.reason}
            </p>
          </div>

          {/* Mid Term */}
          <div
            className="border rounded-lg p-5"
            style={{ borderColor: "var(--gray-2)", background: "white" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={16} style={{ color: "var(--warning)" }} />
              <h3
                className="text-[14px] font-medium"
                style={{ color: "var(--gray-7)" }}
              >
                中期趋势（1-3 月）
              </h3>
              <span
                className="text-[12px] px-2 py-0.5 rounded font-medium ml-auto"
                style={{
                  background: "rgba(217, 119, 6, 0.08)",
                  color: "var(--warning)",
                }}
              >
                {result.midTerm.trend}
              </span>
            </div>
            <p
              className="text-[13px] leading-relaxed"
              style={{ color: "var(--gray-5)" }}
            >
              {result.midTerm.reason}
            </p>
          </div>

          {/* Key Levels */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="border rounded-lg p-4"
              style={{ borderColor: "var(--gray-2)", background: "white" }}
            >
              <p
                className="text-[11px] uppercase tracking-wider mb-1"
                style={{ color: "var(--gray-4)" }}
              >
                关键支撑位
              </p>
              <p
                className="text-2xl font-semibold tabular-nums"
                style={{ color: "var(--success)" }}
              >
                {result.support}
              </p>
            </div>
            <div
              className="border rounded-lg p-4"
              style={{ borderColor: "var(--gray-2)", background: "white" }}
            >
              <p
                className="text-[11px] uppercase tracking-wider mb-1"
                style={{ color: "var(--gray-4)" }}
              >
                关键阻力位
              </p>
              <p
                className="text-2xl font-semibold tabular-nums"
                style={{ color: "var(--danger)" }}
              >
                {result.resistance}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div
            className="flex items-start gap-2 px-4 py-3 rounded-lg"
            style={{ background: "rgba(217, 119, 6, 0.06)" }}
          >
            <AlertTriangle
              size={14}
              className="mt-0.5 flex-shrink-0"
              style={{ color: "var(--warning)" }}
            />
            <p className="text-[12px] leading-relaxed" style={{ color: "var(--gray-5)" }}>
              以上内容由 AI 基于公开数据生成，仅供学习参考，不构成任何投资建议。投资有风险，决策需谨慎。
            </p>
          </div>
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
          <Target
            size={40}
            strokeWidth={1.2}
            className="mx-auto mb-4"
            style={{ color: "var(--gray-3)" }}
          />
          <p
            className="text-[14px] font-medium mb-1"
            style={{ color: "var(--gray-5)" }}
          >
            点击「生成研判」开始分析
          </p>
          <p className="text-[12px]" style={{ color: "var(--gray-4)" }}>
            AI 将基于看板数据生成趋势判断和关键价位
          </p>
        </div>
      )}
    </div>
  );
}
