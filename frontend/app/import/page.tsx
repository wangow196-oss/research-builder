"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useStore, FileItem } from "@/lib/store";
import { PdfViewer } from "@/components/PdfViewer";
import { QAPanel } from "@/components/QAPanel";
import {
  FolderOpen,
  FileText,
  Upload,
  Trash2,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  X,
  Edit3,
  Check,
  GripVertical,
  Eye,
  BookOpen,
} from "lucide-react";

export default function ImportPage() {
  const {
    folders,
    activeFolder,
    setActiveFolder,
    addFolder,
    deleteFolder,
    addFilesToFolder,
    deleteFile,
    renameFile,
    reorderFiles,
  } = useStore();

  const [isDragging, setIsDragging] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [qaText, setQaText] = useState("");
  const [showQA, setShowQA] = useState(false);
  const [splitRatio, setSplitRatio] = useState(0.62); // left panel ratio
  const isDraggingRef = useRef(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFolder = folders.find((f) => f.id === activeFolder);

  // Splitter drag handlers
  const handleSplitterMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    const handleMouseMove = (me: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const ratio = me.clientX / window.innerWidth;
      setSplitRatio(Math.max(0.3, Math.min(0.8, ratio)));
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  // Drag & drop upload — save actual file blobs
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = Array.from(e.dataTransfer.files).map((f) => ({ name: f.name, size: f.size, blob: f }));
      addFilesToFolder(activeFolder, dropped);
    },
    [activeFolder, addFilesToFolder]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []).map((f) => ({ name: f.name, size: f.size, blob: f }));
      addFilesToFolder(activeFolder, selected);
    },
    [activeFolder, addFilesToFolder]
  );

  // File rename
  const startRename = (file: FileItem) => {
    setEditingFileId(file.id);
    setEditingName(file.name);
  };

  const confirmRename = () => {
    if (editingFileId && editingName.trim()) {
      renameFile(activeFolder, editingFileId, editingName.trim());
    }
    setEditingFileId(null);
  };

  // File drag reorder
  const handleFileDragStart = (index: number) => setDraggingIndex(index);

  const handleFileDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleFileDrop = (toIndex: number) => {
    if (draggingIndex !== null && draggingIndex !== toIndex) {
      reorderFiles(activeFolder, draggingIndex, toIndex);
    }
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)]">
      {/* Left: Folder Tree */}
      <div className="w-[260px] min-w-[260px] border rounded-lg overflow-hidden flex flex-col" style={{ borderColor: "var(--gray-2)", background: "white" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--gray-2)" }}>
          <span className="text-[13px] font-medium" style={{ color: "var(--gray-7)" }}>研报文件夹</span>
          <button onClick={() => setShowNewFolder(true)} className="p-1 rounded transition-colors" style={{ color: "var(--gray-4)" }} onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "var(--gray-4)"; }}>
            <FolderPlus size={16} />
          </button>
        </div>

        {showNewFolder && (
          <div className="px-3 py-2 border-b" style={{ borderColor: "var(--gray-2)" }}>
            <div className="flex items-center gap-2">
              <input autoFocus value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newFolderName.trim()) { addFolder(newFolderName.trim()); setNewFolderName(""); setShowNewFolder(false); } }} placeholder="文件夹名称" className="flex-1 px-2 py-1 text-[12px] border rounded" style={{ borderColor: "var(--gray-2)" }} />
              <button onClick={() => { if (newFolderName.trim()) { addFolder(newFolderName.trim()); setNewFolderName(""); setShowNewFolder(false); } }} className="text-[11px] px-2 py-1 rounded text-white" style={{ background: "var(--accent)" }}>创建</button>
              <button onClick={() => setShowNewFolder(false)} style={{ color: "var(--gray-4)" }}><X size={14} /></button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto py-1">
          {folders.map((folder) => (
            <div key={folder.id}>
              <div className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors" style={{ background: activeFolder === folder.id ? "var(--accent-10)" : "transparent" }} onClick={() => setActiveFolder(folder.id)} onMouseEnter={(e) => { if (activeFolder !== folder.id) e.currentTarget.style.background = "var(--gray-1)"; }} onMouseLeave={(e) => { if (activeFolder !== folder.id) e.currentTarget.style.background = "transparent"; }}>
                <button onClick={(e) => { e.stopPropagation(); }} style={{ color: "var(--gray-4)" }}>
                  {folder.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <span className="text-[14px]">{folder.icon}</span>
                <span className="text-[13px] flex-1" style={{ color: activeFolder === folder.id ? "var(--accent)" : "var(--gray-7)", fontWeight: activeFolder === folder.id ? 500 : 400 }}>{folder.name}</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: "var(--gray-2)", color: "var(--gray-5)" }}>{folder.files.length}</span>
              </div>
              {folder.expanded && (
                <div className="ml-7">
                  {folder.files.map((file) => (
                    <div key={file.id} className="flex items-center gap-2 px-3 py-1.5 text-[12px] cursor-pointer transition-colors rounded" style={{ color: "var(--gray-5)" }} onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gray-1)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                      <FileText size={12} style={{ color: "var(--accent)", flexShrink: 0 }} />
                      <span className="truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right: File List + Drop Zone */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">{currentFolder?.icon}</span>
            <h1 className="text-xl font-semibold" style={{ color: "var(--gray-8)" }}>{currentFolder?.name || "选择文件夹"}</h1>
            <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: "var(--gray-2)", color: "var(--gray-5)" }}>{currentFolder?.files.length || 0} 篇研报</span>
          </div>
          {currentFolder && (
            <button onClick={() => { if (confirm(`确定删除文件夹「${currentFolder.name}」？`)) deleteFolder(currentFolder.id); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] border transition-colors" style={{ borderColor: "var(--gray-2)", color: "var(--gray-5)" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--danger)"; e.currentTarget.style.color = "var(--danger)"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--gray-2)"; e.currentTarget.style.color = "var(--gray-5)"; }}>
              <Trash2 size={12} /> 删除文件夹
            </button>
          )}
        </div>

        {/* Drop Zone */}
        <div className="border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors cursor-pointer" style={{ borderColor: isDragging ? "var(--accent)" : "var(--gray-2)", background: isDragging ? "var(--accent-5)" : "var(--gray-1)" }} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
          <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg" className="hidden" onChange={handleFileSelect} />
          <Upload size={28} strokeWidth={1.5} className="mx-auto mb-2" style={{ color: isDragging ? "var(--accent)" : "var(--gray-4)" }} />
          <p className="text-[13px] font-medium mb-1" style={{ color: isDragging ? "var(--accent)" : "var(--gray-6)" }}>{isDragging ? "松开即可上传" : "拖拽研报文件到这里"}</p>
          <p className="text-[11px]" style={{ color: "var(--gray-4)" }}>或点击选择文件 · 上传到「{currentFolder?.name}」</p>
        </div>

        {/* File Table */}
        {currentFolder && currentFolder.files.length > 0 && (
          <div className="border rounded-lg overflow-hidden flex-1" style={{ borderColor: "var(--gray-2)" }}>
            <div className="grid grid-cols-[24px_1fr_80px_100px_80px] gap-2 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider border-b" style={{ background: "var(--gray-1)", borderColor: "var(--gray-2)", color: "var(--gray-4)" }}>
              <span></span><span>文件名</span><span>大小</span><span>研报日期</span><span className="text-right">操作</span>
            </div>
            <div className="overflow-auto">
              {currentFolder.files.map((file, index) => (
                <div
                  key={file.id}
                  draggable
                  onDragStart={() => handleFileDragStart(index)}
                  onDragOver={(e) => handleFileDragOver(e, index)}
                  onDrop={() => handleFileDrop(index)}
                  onDragEnd={() => { setDraggingIndex(null); setDragOverIndex(null); }}
                  className="grid grid-cols-[24px_1fr_80px_100px_80px] gap-2 px-4 py-3 items-center border-b transition-colors"
                  style={{
                    borderColor: "var(--gray-2)",
                    background: dragOverIndex === index ? "var(--accent-5)" : draggingIndex === index ? "var(--gray-1)" : "transparent",
                    opacity: draggingIndex === index ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => { if (dragOverIndex === null) e.currentTarget.style.background = "var(--gray-1)"; }}
                  onMouseLeave={(e) => { if (dragOverIndex === null) e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Drag handle */}
                  <div className="cursor-grab active:cursor-grabbing" style={{ color: "var(--gray-3)" }}>
                    <GripVertical size={14} />
                  </div>

                  {/* File name (editable) */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText size={16} style={{ color: "var(--accent)", flexShrink: 0 }} />
                    {editingFileId === file.id ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input autoFocus value={editingName} onChange={(e) => setEditingName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") confirmRename(); if (e.key === "Escape") setEditingFileId(null); }} className="flex-1 px-1 py-0.5 text-[13px] border rounded" style={{ borderColor: "var(--accent)" }} />
                        <button onClick={confirmRename} style={{ color: "var(--accent)" }}><Check size={14} /></button>
                      </div>
                    ) : (
                      <span className="text-[13px] truncate cursor-pointer hover:underline" style={{ color: "var(--gray-7)" }} onClick={() => setPreviewFile(file)}>{file.name}</span>
                    )}
                  </div>

                  <span className="text-[12px] tabular-nums" style={{ color: "var(--gray-4)" }}>{file.size}</span>
                  <span className="text-[12px]" style={{ color: "var(--gray-4)" }}>{file.publishDate || file.date}</span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => setPreviewFile(file)} className="p-1.5 rounded transition-colors" style={{ color: "var(--gray-4)" }} onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--accent-5)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "var(--gray-4)"; e.currentTarget.style.background = "transparent"; }}>
                      <Eye size={14} />
                    </button>
                    <button onClick={() => startRename(file)} className="p-1.5 rounded transition-colors" style={{ color: "var(--gray-4)" }} onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--accent-5)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "var(--gray-4)"; e.currentTarget.style.background = "transparent"; }}>
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => deleteFile(currentFolder.id, file.id)} className="p-1.5 rounded transition-colors" style={{ color: "var(--gray-4)" }} onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "rgba(220,38,38,0.08)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "var(--gray-4)"; e.currentTarget.style.background = "transparent"; }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal — 左侧 PDF，右侧导读/问答 */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => { setPreviewFile(null); setShowQA(false); setQaText(""); }}>
          <div className="flex w-full h-full" onClick={(e) => e.stopPropagation()}>
            {/* Left: PDF Viewer */}
            <div className="flex flex-col" style={{ width: `${splitRatio * 100}%`, background: "var(--gray-7)" }}>
              <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "var(--gray-8)" }}>
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={14} style={{ color: "var(--gray-4)" }} />
                  <span className="text-[13px] truncate" style={{ color: "var(--gray-3)" }}>{previewFile.name}</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.1)", color: "var(--gray-4)" }}>{previewFile.size}</span>
                </div>
                <button onClick={() => { setPreviewFile(null); setShowQA(false); setQaText(""); }} className="p-1 rounded" style={{ color: "var(--gray-4)" }} onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "var(--gray-4)"; }}>
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {previewFile.hasBlob ? (
                  <PdfViewer
                    fileId={previewFile.id}
                    fileName={previewFile.name}
                    onTextSelect={(text) => { setQaText(text); setShowQA(true); }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: "var(--gray-4)" }}>
                    <FileText size={40} strokeWidth={1} />
                    <span className="text-[13px]">此文件为占位示例，未上传真实 PDF</span>
                    <span className="text-[11px]">请通过拖拽或点击上传真实 PDF 文件后即可预览</span>
                  </div>
                )}
              </div>
            </div>

            {/* Splitter */}
            <div
              className="w-1 cursor-col-resize flex-shrink-0 transition-colors hover:bg-blue-400 active:bg-blue-500"
              style={{ background: "var(--gray-3)" }}
              onMouseDown={handleSplitterMouseDown}
            />

            {/* Right: 导读分析 or QA Panel */}
            <div className="flex flex-col" style={{ width: `${(1 - splitRatio) * 100}%`, minWidth: "320px" }}>
              {showQA ? (
                <QAPanel
                  selectedText={qaText}
                  fileName={previewFile.name}
                  onClose={() => { setShowQA(false); setQaText(""); }}
                />
              ) : (
            <div className="w-full h-full flex flex-col bg-white border-l" style={{ borderColor: "var(--gray-2)" }}>
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--gray-2)" }}>
                <div className="flex items-center gap-2">
                  <BookOpen size={14} style={{ color: "var(--accent)" }} />
                  <span className="text-[13px] font-medium" style={{ color: "var(--gray-8)" }}>研报导读</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setPreviewFile(null); setShowQA(false); }} className="px-3 py-1.5 rounded-md text-[12px] border" style={{ borderColor: "var(--gray-2)", color: "var(--gray-6)" }}>关闭</button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-5 space-y-4">
                {/* 一句话逻辑 */}
                <div className="p-3 rounded-lg" style={{ background: "var(--accent-5)", border: "1px solid var(--accent-10)" }}>
                  <p className="text-[11px] font-medium mb-1" style={{ color: "var(--accent)" }}>一句话逻辑</p>
                  <p className="text-[12px] leading-relaxed" style={{ color: "var(--gray-7)" }}>
                    「短期看利率、中期看央行」的换挡期已经到来。短期定价锚仍在高位压制，但拐点信号积累；中期定价锚以288.9吨创纪录回归。结论：逢低分批买入。
                  </p>
                </div>

                {/* 核心指标 */}
                <div>
                  <p className="text-[11px] font-medium mb-2" style={{ color: "var(--gray-5)" }}>核心指标</p>
                  <div className="space-y-1.5">
                    {[
                      { name: "10Y TIPS实际收益率", value: "2.39%~2.45%", dir: "反向+++" },
                      { name: "全球央行净购金", value: "2026Q2 288.9吨", dir: "正向+++" },
                      { name: "美元指数", value: "98.87", dir: "反向++" },
                      { name: "SPDR黄金ETF", value: "1,050吨", dir: "正向++" },
                      { name: "联邦债务/GDP", value: "122.6%", dir: "正向++" },
                    ].map((ind, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 rounded" style={{ background: "var(--gray-1)" }}>
                        <span className="text-[12px]" style={{ color: "var(--gray-7)" }}>{ind.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] tabular-nums font-medium" style={{ color: "var(--gray-8)" }}>{ind.value}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: ind.dir.includes("正向") ? "rgba(220,38,38,0.08)" : "rgba(22,163,74,0.08)", color: ind.dir.includes("正向") ? "var(--danger)" : "var(--success)" }}>{ind.dir}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 研究框架 */}
                <div>
                  <p className="text-[11px] font-medium mb-2" style={{ color: "var(--gray-5)" }}>研究框架（三层递进）</p>
                  <div className="space-y-1.5">
                    {[
                      { layer: "① 周期与统计", q: "这轮跌是不是牛市终结？", method: "牛熊周期统计+回撤分布" },
                      { layer: "② 基本面七因子", q: "基本面变了吗？", method: "逐因子复盘→13因子加权表" },
                      { layer: "③ 货币体系实证", q: "对手方出了什么问题？", method: "三张资产负债表+2SLS/VECM" },
                    ].map((l, i) => (
                      <div key={i} className="p-2.5 rounded" style={{ background: "var(--gray-1)" }}>
                        <p className="text-[12px] font-medium" style={{ color: "var(--accent)" }}>{l.layer}</p>
                        <p className="text-[11px]" style={{ color: "var(--gray-6)" }}>问题：{l.q}</p>
                        <p className="text-[11px]" style={{ color: "var(--gray-4)" }}>方法：{l.method}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 判定规则 */}
                <div>
                  <p className="text-[11px] font-medium mb-2" style={{ color: "var(--gray-5)" }}>判定规则</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded" style={{ background: "rgba(22,163,74,0.06)" }}>
                      <p className="text-[11px] font-medium" style={{ color: "var(--success)" }}>确认信号</p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--gray-6)" }}>实际利率趋势性回落 + 金价收复前高</p>
                    </div>
                    <div className="p-2.5 rounded" style={{ background: "rgba(220,38,38,0.06)" }}>
                      <p className="text-[11px] font-medium" style={{ color: "var(--danger)" }}>证伪条件</p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--gray-6)" }}>通胀触发加息、央行购金放缓、ETF回流中断</p>
                    </div>
                  </div>
                </div>

                {/* 跟踪要点 */}
                <div>
                  <p className="text-[11px] font-medium mb-2" style={{ color: "var(--gray-5)" }}>后续跟踪要点</p>
                  <ul className="space-y-1">
                    {["8月及三季度美国CPI与9月FOMC路径", "2026Q3全球央行购金节奏", "ETF与期货多头回流的持续性", "美国财政供给与长债回购实际效果"].map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px]" style={{ color: "var(--gray-6)" }}>
                        <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--accent)" }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 风险提示 */}
                <div className="p-3 rounded-lg" style={{ background: "rgba(217,119,6,0.06)" }}>
                  <p className="text-[11px] font-medium mb-1" style={{ color: "var(--warning)" }}>风险提示</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--gray-5)" }}>
                    美国通胀再次上行；实际利率持续走高；美元超预期升值；央行购金不及预期；地缘政治风险缓和。
                  </p>
                </div>
              </div>
            </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}