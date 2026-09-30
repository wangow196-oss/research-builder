"use client";

import { Search, Settings } from "lucide-react";

export function TopBar() {
  return (
    <header
      className="h-14 min-h-[56px] flex items-center justify-between px-6 border-b"
      style={{
        background: "white",
        borderColor: "var(--gray-2)",
      }}
    >
      {/* Search */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border w-full"
          style={{
            borderColor: "var(--gray-2)",
            background: "var(--gray-0)",
          }}
        >
          <Search size={14} style={{ color: "var(--gray-4)" }} />
          <span className="text-[13px]" style={{ color: "var(--gray-4)" }}>
            搜索研报或指标...
          </span>
          <kbd
            className="ml-auto text-[11px] px-1.5 py-0.5 rounded border"
            style={{
              borderColor: "var(--gray-2)",
              color: "var(--gray-4)",
              background: "var(--gray-1)",
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-md transition-colors"
          style={{ color: "var(--gray-5)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--gray-1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <Settings size={16} strokeWidth={1.8} />
        </button>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium text-white"
          style={{ background: "var(--accent)" }}
        >
          Mi
        </div>
      </div>
    </header>
  );
}
