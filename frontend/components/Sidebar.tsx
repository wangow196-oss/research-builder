"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FolderOpen,
  Search,
  Puzzle,
  BarChart3,
  Target,
  Menu,
  X,
} from "lucide-react";

const steps = [
  { href: "/import", label: "研报导入", icon: FolderOpen, step: 1 },
  { href: "/analyze", label: "智能解读", icon: Search, step: 2 },
  { href: "/framework", label: "框架搭建", icon: Puzzle, step: 3 },
  { href: "/dashboard", label: "数据看板", icon: BarChart3, step: 4 },
  { href: "/trend", label: "趋势研判", icon: Target, step: 5 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed top-3 left-3 z-50 p-2 rounded-md lg:hidden"
        style={{ background: "var(--gray-1)", color: "var(--gray-6)" }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-[240px] min-w-[240px] flex flex-col border-r
          fixed lg:relative inset-y-0 left-0 z-50
          transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          background: "var(--gray-1)",
          borderColor: "var(--gray-2)",
        }}
      >
        {/* Logo */}
        <div
          className="h-14 flex items-center px-5 border-b"
          style={{ borderColor: "var(--gray-2)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-semibold"
              style={{ background: "var(--accent)" }}
            >
              研
            </div>
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--gray-8)" }}
            >
              研报智析
            </span>
          </div>
        </div>

        {/* Navigation Steps */}
        <nav className="flex-1 py-3 px-3">
          <div
            className="text-[11px] font-medium uppercase tracking-wider px-3 py-2"
            style={{ color: "var(--gray-4)" }}
          >
            工作流程
          </div>
          <ul className="space-y-0.5">
            {steps.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-colors"
                    style={{
                      background: isActive ? "var(--accent-10)" : "transparent",
                      color: isActive ? "var(--accent)" : "var(--gray-5)",
                      fontWeight: isActive ? 500 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "var(--accent-5)";
                        e.currentTarget.style.color = "var(--gray-7)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--gray-5)";
                      }
                    }}
                  >
                    <span
                      className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-semibold"
                      style={{
                        background: isActive ? "var(--accent)" : "var(--gray-2)",
                        color: isActive ? "white" : "var(--gray-5)",
                      }}
                    >
                      {item.step}
                    </span>
                    <Icon size={16} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div
          className="px-5 py-3 border-t text-[11px]"
          style={{ borderColor: "var(--gray-2)", color: "var(--gray-4)" }}
        >
          v0.1.0
        </div>
      </aside>
    </>
  );
}
