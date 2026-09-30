"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const metrics = [
  { label: "PE (TTM)", value: "28.5", change: "+2.1", up: true, unit: "x" },
  { label: "营收增速", value: "15.2", change: "-1.3", up: false, unit: "%" },
  { label: "净利润", value: "860", change: "+8.5", up: true, unit: "亿" },
  { label: "ROE", value: "33.8", change: "+0.6", up: true, unit: "%" },
];

const tableData = [
  { quarter: "2024Q4", revenue: "450亿", profit: "230亿", margin: "51.1%" },
  { quarter: "2024Q3", revenue: "420亿", profit: "215亿", margin: "51.2%" },
  { quarter: "2024Q2", revenue: "380亿", profit: "195亿", margin: "51.3%" },
  { quarter: "2024Q1", revenue: "410亿", profit: "220亿", margin: "53.7%" },
];

export default function DashboardPage() {
  return (
    <div className="max-w-5xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--gray-8)" }}
          >
            数据看板
          </h1>
          <p
            className="text-[13px] mt-1"
            style={{ color: "var(--gray-5)" }}
          >
            接入 AKShare 数据，实时查看研报中的关键指标
          </p>
        </div>
        <select
          className="px-3 py-1.5 rounded-md border text-[12px]"
          style={{
            borderColor: "var(--gray-2)",
            color: "var(--gray-6)",
            background: "white",
          }}
        >
          <option>近 1 年</option>
          <option>近 6 个月</option>
          <option>近 3 个月</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="border rounded-lg p-4"
            style={{
              borderColor: "var(--gray-2)",
              background: i === 0 ? "var(--accent-5)" : "white",
            }}
          >
            <p
              className="text-[11px] uppercase tracking-wider mb-1"
              style={{ color: "var(--gray-4)" }}
            >
              {m.label}
            </p>
            <p
              className="text-2xl font-semibold tabular-nums"
              style={{
                color: i === 0 ? "var(--accent)" : "var(--gray-8)",
              }}
            >
              {m.value}
              <span className="text-[13px] font-normal ml-0.5">{m.unit}</span>
            </p>
            <div className="flex items-center gap-1 mt-1">
              {m.up ? (
                <TrendingUp size={12} style={{ color: "var(--danger)" }} />
              ) : (
                <TrendingDown size={12} style={{ color: "var(--success)" }} />
              )}
              <span
                className="text-[12px] tabular-nums"
                style={{ color: m.up ? "var(--danger)" : "var(--success)" }}
              >
                {m.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div
        className="border rounded-lg p-8 mb-6 text-center"
        style={{
          borderColor: "var(--gray-2)",
          background: "white",
          minHeight: "280px",
        }}
      >
        <Minus
          size={48}
          strokeWidth={0.5}
          className="mx-auto mb-3"
          style={{ color: "var(--gray-3)" }}
        />
        <p className="text-[13px]" style={{ color: "var(--gray-4)" }}>
          图表区域 — 将接入 ECharts K 线图 / 估值趋势折线图
        </p>
        <p className="text-[11px] mt-1" style={{ color: "var(--gray-3)" }}>
          需要后端 API 支持
        </p>
      </div>

      {/* Data Table */}
      <div>
        <h2
          className="text-[13px] font-medium mb-3"
          style={{ color: "var(--gray-6)" }}
        >
          季度财务数据
        </h2>
        <div
          className="border rounded-lg overflow-hidden"
          style={{ borderColor: "var(--gray-2)" }}
        >
          <div
            className="grid grid-cols-4 gap-4 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider border-b"
            style={{
              background: "var(--gray-1)",
              borderColor: "var(--gray-2)",
              color: "var(--gray-4)",
            }}
          >
            <span>季度</span>
            <span>营收</span>
            <span>净利润</span>
            <span>净利率</span>
          </div>
          {tableData.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-4 gap-4 px-4 py-3 border-b transition-colors"
              style={{ borderColor: "var(--gray-2)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--gray-1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span
                className="text-[13px] font-medium"
                style={{ color: "var(--gray-7)" }}
              >
                {row.quarter}
              </span>
              <span
                className="text-[13px] tabular-nums"
                style={{ color: "var(--gray-6)" }}
              >
                {row.revenue}
              </span>
              <span
                className="text-[13px] tabular-nums"
                style={{ color: "var(--gray-6)" }}
              >
                {row.profit}
              </span>
              <span
                className="text-[13px] tabular-nums"
                style={{ color: "var(--gray-6)" }}
              >
                {row.margin}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
