"use client";

import {
  Puzzle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const dimensions = [
  { name: "品牌力", desc: "提价能力、市占率、品牌溢价", weight: "30%" },
  { name: "渠道力", desc: "经销商数量、库存水平、渠道效率", weight: "25%" },
  { name: "产品力", desc: "SKU 结构、新品节奏、产品矩阵", weight: "20%" },
  { name: "估值水平", desc: "PE/PB/DCF 估值、历史分位数", weight: "25%" },
];

const actions = [
  { text: "查看茅台最新季度营收数据", type: "next" as const },
  { text: "关注经销商库存周转天数变化", type: "watch" as const },
  { text: "对比五粮液、泸州老窖估值水平", type: "compare" as const },
];

export default function FrameworkPage() {
  return (
    <div className="max-w-4xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--gray-8)" }}
        >
          框架搭建
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--gray-5)" }}>
          基于研报解读结果，自动生成可复用的行业研究框架
        </p>
      </div>

      {/* Framework Title */}
      <div
        className="flex items-center gap-3 mb-6 px-4 py-3 rounded-lg border"
        style={{
          borderColor: "var(--accent-10)",
          background: "var(--accent-5)",
        }}
      >
        <Puzzle size={18} style={{ color: "var(--accent)" }} />
        <span
          className="text-[14px] font-medium"
          style={{ color: "var(--gray-8)" }}
        >
          研究框架：白酒行业
        </span>
        <span
          className="text-[11px] px-2 py-0.5 rounded ml-auto"
          style={{
            background: "var(--accent)",
            color: "white",
          }}
        >
          基于 3 篇研报生成
        </span>
      </div>

      {/* Research Dimensions */}
      <div className="mb-6">
        <h2
          className="text-[13px] font-medium mb-3"
          style={{ color: "var(--gray-6)" }}
        >
          研究维度
        </h2>
        <div className="space-y-2">
          {dimensions.map((dim, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 rounded-lg border"
              style={{
                borderColor: "var(--gray-2)",
                background: "white",
              }}
            >
              <span
                className="w-6 h-6 rounded flex items-center justify-center text-[11px] font-semibold"
                style={{
                  background: "var(--accent-10)",
                  color: "var(--accent)",
                }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <span
                  className="text-[13px] font-medium"
                  style={{ color: "var(--gray-7)" }}
                >
                  {dim.name}
                </span>
                <span
                  className="text-[12px] ml-2"
                  style={{ color: "var(--gray-4)" }}
                >
                  {dim.desc}
                </span>
              </div>
              <span
                className="text-[12px] tabular-nums font-medium"
                style={{ color: "var(--accent)" }}
              >
                权重 {dim.weight}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Suggestions */}
      <div>
        <h2
          className="text-[13px] font-medium mb-3"
          style={{ color: "var(--gray-6)" }}
        >
          执行建议
        </h2>
        <div className="space-y-2">
          {actions.map((action, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border"
              style={{
                borderColor: "var(--gray-2)",
                background: "white",
              }}
            >
              {action.type === "next" ? (
                <ArrowRight size={14} style={{ color: "var(--accent)" }} />
              ) : action.type === "watch" ? (
                <AlertCircle size={14} style={{ color: "var(--warning)" }} />
              ) : (
                <CheckCircle2 size={14} style={{ color: "var(--success)" }} />
              )}
              <span
                className="text-[13px]"
                style={{ color: "var(--gray-7)" }}
              >
                {action.text}
              </span>
              <span
                className="text-[11px] px-2 py-0.5 rounded ml-auto"
                style={{
                  background:
                    action.type === "next"
                      ? "var(--accent-10)"
                      : action.type === "watch"
                      ? "rgba(217, 119, 6, 0.08)"
                      : "rgba(22, 163, 74, 0.08)",
                  color:
                    action.type === "next"
                      ? "var(--accent)"
                      : action.type === "watch"
                      ? "var(--warning)"
                      : "var(--success)",
                }}
              >
                {action.type === "next"
                  ? "下一步"
                  : action.type === "watch"
                  ? "关注"
                  : "对比"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
