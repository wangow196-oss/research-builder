export function StatusBar() {
  return (
    <footer
      className="h-7 min-h-[28px] flex items-center justify-between px-6 border-t text-[11px]"
      style={{
        borderColor: "var(--gray-2)",
        color: "var(--gray-4)",
        background: "var(--gray-1)",
      }}
    >
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--success)" }}
          />
          API 已连接
        </span>
        <span>AKShare 数据源就绪</span>
      </div>
      <span>数据更新时间：--</span>
    </footer>
  );
}
