"use client";

import { useState, useCallback, useRef } from "react";
import { useStore, FileItem } from "@/lib/store";
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
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFolder = folders.find((f) => f.id === activeFolder);

  // Drag & drop upload
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = Array.from(e.dataTransfer.files).map((f) => ({ name: f.name, size: f.size }));
      addFilesToFolder(activeFolder, dropped);
    },
    [activeFolder, addFilesToFolder]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []).map((f) => ({ name: f.name, size: f.size }));
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
              <span></span><span>文件名</span><span>大小</span><span>上传时间</span><span className="text-right">操作</span>
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
                      <span className="text-[13px] truncate" style={{ color: "var(--gray-7)" }}>{file.name}</span>
                    )}
                  </div>

                  <span className="text-[12px] tabular-nums" style={{ color: "var(--gray-4)" }}>{file.size}</span>
                  <span className="text-[12px]" style={{ color: "var(--gray-4)" }}>{file.date}</span>

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

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setPreviewFile(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--gray-2)" }}>
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={16} style={{ color: "var(--accent)" }} />
                <span className="text-[14px] font-medium truncate" style={{ color: "var(--gray-8)" }}>{previewFile.name}</span>
              </div>
              <button onClick={() => setPreviewFile(null)} style={{ color: "var(--gray-4)" }}><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <div className="space-y-3 text-[13px]" style={{ color: "var(--gray-6)" }}>
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="font-medium" style={{ color: "var(--gray-7)" }}>文件名：</span>{previewFile.name}</div>
                  <div><span className="font-medium" style={{ color: "var(--gray-7)" }}>大小：</span>{previewFile.size}</div>
                  <div><span className="font-medium" style={{ color: "var(--gray-7)" }}>上传时间：</span>{previewFile.date}</div>
                  <div><span className="font-medium" style={{ color: "var(--gray-7)" }}>所属文件夹：</span>{currentFolder?.name}</div>
                </div>
                <div className="mt-4 p-4 rounded-lg" style={{ background: "var(--gray-1)" }}>
                  <p className="text-[12px]" style={{ color: "var(--gray-4)" }}>
                    PDF 预览功能需要后端支持。当前显示文件基本信息。
                  </p>
                  <p className="text-[12px] mt-2" style={{ color: "var(--gray-4)" }}>
                    接入后端后，此处将显示 PDF 的前几页预览和解析后的文本内容。
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--gray-2)" }}>
              <button onClick={() => setPreviewFile(null)} className="px-4 py-2 rounded-md text-[13px] border" style={{ borderColor: "var(--gray-2)", color: "var(--gray-6)" }}>关闭</button>
              <button className="px-4 py-2 rounded-md text-[13px] text-white" style={{ background: "var(--accent)" }}>前往解读 →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}