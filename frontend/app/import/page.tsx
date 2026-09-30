"use client";

import { useState, useCallback, useRef } from "react";
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
} from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  size: string;
  date: string;
}

interface FolderItem {
  id: string;
  name: string;
  icon: string;
  files: FileItem[];
  expanded: boolean;
}

const defaultFolders: FolderItem[] = [
  {
    id: "gold",
    name: "黄金研究",
    icon: "🥇",
    expanded: true,
    files: [
      { id: "g1", name: "黄金定价框架梳理_东海证券.pdf", size: "2.3 MB", date: "2024-03-15" },
      { id: "g2", name: "美联储降息对黄金影响.pdf", size: "1.8 MB", date: "2024-03-14" },
    ],
  },
  {
    id: "baijiu",
    name: "白酒行业",
    icon: "🍷",
    expanded: false,
    files: [
      { id: "b1", name: "贵州茅台2024年报点评.pdf", size: "2.3 MB", date: "2024-03-15" },
      { id: "b2", name: "五粮液深度报告.pdf", size: "3.1 MB", date: "2024-03-12" },
    ],
  },
  {
    id: "cpo",
    name: "CPO 光模块",
    icon: "💡",
    expanded: false,
    files: [
      { id: "c1", name: "CPO技术路径与产业链.pdf", size: "4.5 MB", date: "2024-03-13" },
    ],
  },
];

export default function ImportPage() {
  const [folders, setFolders] = useState<FolderItem[]>(defaultFolders);
  const [activeFolder, setActiveFolder] = useState<string>("gold");
  const [isDragging, setIsDragging] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFilesToFolder(activeFolder, droppedFiles);
    },
    [activeFolder]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      addFilesToFolder(activeFolder, selectedFiles);
    },
    [activeFolder]
  );

  const addFilesToFolder = (folderId: string, newFiles: File[]) => {
    setFolders((prev) =>
      prev.map((f) => {
        if (f.id !== folderId) return f;
        const newItems: FileItem[] = newFiles.map((file, i) => ({
          id: `new-${Date.now()}-${i}`,
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          date: new Date().toISOString().split("T")[0],
        }));
        return { ...f, files: [...f.files, ...newItems] };
      })
    );
  };

  const toggleFolder = (folderId: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, expanded: !f.expanded } : f))
    );
  };

  const deleteFile = (folderId: string, fileId: string) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId ? { ...f, files: f.files.filter((file) => file.id !== fileId) } : f
      )
    );
  };

  const deleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    if (activeFolder === folderId) {
      setActiveFolder(folders.find((f) => f.id !== folderId)?.id || "");
    }
  };

  const addFolder = () => {
    if (!newFolderName.trim()) return;
    const id = `folder-${Date.now()}`;
    setFolders((prev) => [
      ...prev,
      { id, name: newFolderName.trim(), icon: "📁", files: [], expanded: true },
    ]);
    setActiveFolder(id);
    setNewFolderName("");
    setShowNewFolder(false);
  };

  const currentFolder = folders.find((f) => f.id === activeFolder);

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)]">
      {/* Left: Folder Tree */}
      <div
        className="w-[260px] min-w-[260px] border rounded-lg overflow-hidden flex flex-col"
        style={{ borderColor: "var(--gray-2)", background: "white" }}
      >
        {/* Folder Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--gray-2)" }}
        >
          <span className="text-[13px] font-medium" style={{ color: "var(--gray-7)" }}>
            研报文件夹
          </span>
          <button
            onClick={() => setShowNewFolder(true)}
            className="p-1 rounded transition-colors"
            style={{ color: "var(--gray-4)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--accent)";
              e.currentTarget.style.background = "var(--accent-5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--gray-4)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <FolderPlus size={16} />
          </button>
        </div>

        {/* New Folder Input */}
        {showNewFolder && (
          <div className="px-3 py-2 border-b" style={{ borderColor: "var(--gray-2)" }}>
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addFolder()}
                placeholder="文件夹名称"
                className="flex-1 px-2 py-1 text-[12px] border rounded"
                style={{ borderColor: "var(--gray-2)" }}
              />
              <button onClick={addFolder} className="text-[11px] px-2 py-1 rounded text-white" style={{ background: "var(--accent)" }}>
                创建
              </button>
              <button onClick={() => setShowNewFolder(false)} style={{ color: "var(--gray-4)" }}>
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Folder List */}
        <div className="flex-1 overflow-auto py-1">
          {folders.map((folder) => (
            <div key={folder.id}>
              {/* Folder Header */}
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors"
                style={{
                  background: activeFolder === folder.id ? "var(--accent-10)" : "transparent",
                }}
                onClick={() => setActiveFolder(folder.id)}
                onMouseEnter={(e) => {
                  if (activeFolder !== folder.id) e.currentTarget.style.background = "var(--gray-1)";
                }}
                onMouseLeave={(e) => {
                  if (activeFolder !== folder.id) e.currentTarget.style.background = "transparent";
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(folder.id);
                  }}
                  style={{ color: "var(--gray-4)" }}
                >
                  {folder.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <span className="text-[14px]">{folder.icon}</span>
                <span
                  className="text-[13px] flex-1"
                  style={{
                    color: activeFolder === folder.id ? "var(--accent)" : "var(--gray-7)",
                    fontWeight: activeFolder === folder.id ? 500 : 400,
                  }}
                >
                  {folder.name}
                </span>
                <span
                  className="text-[11px] px-1.5 py-0.5 rounded"
                  style={{ background: "var(--gray-2)", color: "var(--gray-5)" }}
                >
                  {folder.files.length}
                </span>
              </div>

              {/* Files in Folder */}
              {folder.expanded && (
                <div className="ml-7">
                  {folder.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 px-3 py-1.5 text-[12px] cursor-pointer transition-colors rounded"
                      style={{ color: "var(--gray-5)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--gray-1)";
                        e.currentTarget.style.color = "var(--gray-7)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--gray-5)";
                      }}
                    >
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
        {/* Current Folder Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">{currentFolder?.icon}</span>
            <h1 className="text-xl font-semibold" style={{ color: "var(--gray-8)" }}>
              {currentFolder?.name || "选择文件夹"}
            </h1>
            <span
              className="text-[11px] px-2 py-0.5 rounded"
              style={{ background: "var(--gray-2)", color: "var(--gray-5)" }}
            >
              {currentFolder?.files.length || 0} 篇研报
            </span>
          </div>
          {currentFolder && (
            <button
              onClick={() => deleteFolder(currentFolder.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] border transition-colors"
              style={{ borderColor: "var(--gray-2)", color: "var(--gray-5)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--danger)";
                e.currentTarget.style.color = "var(--danger)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--gray-2)";
                e.currentTarget.style.color = "var(--gray-5)";
              }}
            >
              <Trash2 size={12} />
              删除文件夹
            </button>
          )}
        </div>

        {/* Drop Zone */}
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors cursor-pointer"
          style={{
            borderColor: isDragging ? "var(--accent)" : "var(--gray-2)",
            background: isDragging ? "var(--accent-5)" : "var(--gray-1)",
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Upload
            size={28}
            strokeWidth={1.5}
            className="mx-auto mb-2"
            style={{ color: isDragging ? "var(--accent)" : "var(--gray-4)" }}
          />
          <p className="text-[13px] font-medium mb-1" style={{ color: isDragging ? "var(--accent)" : "var(--gray-6)" }}>
            {isDragging ? "松开即可上传" : "拖拽研报文件到这里"}
          </p>
          <p className="text-[11px]" style={{ color: "var(--gray-4)" }}>
            或点击选择文件 · 支持 PDF、Word、图片 · 上传到「{currentFolder?.name}」
          </p>
        </div>

        {/* File Table */}
        {currentFolder && currentFolder.files.length > 0 && (
          <div className="border rounded-lg overflow-hidden flex-1" style={{ borderColor: "var(--gray-2)" }}>
            <div
              className="grid grid-cols-[1fr_80px_100px_50px] gap-4 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider border-b"
              style={{ background: "var(--gray-1)", borderColor: "var(--gray-2)", color: "var(--gray-4)" }}
            >
              <span>文件名</span>
              <span>大小</span>
              <span>上传时间</span>
              <span></span>
            </div>
            <div className="overflow-auto">
              {currentFolder.files.map((file) => (
                <div
                  key={file.id}
                  className="grid grid-cols-[1fr_80px_100px_50px] gap-4 px-4 py-3 items-center border-b transition-colors"
                  style={{ borderColor: "var(--gray-2)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText size={16} style={{ color: "var(--accent)" }} />
                    <span className="text-[13px] truncate" style={{ color: "var(--gray-7)" }}>
                      {file.name}
                    </span>
                  </div>
                  <span className="text-[12px] tabular-nums" style={{ color: "var(--gray-4)" }}>
                    {file.size}
                  </span>
                  <span className="text-[12px]" style={{ color: "var(--gray-4)" }}>
                    {file.date}
                  </span>
                  <button
                    onClick={() => deleteFile(currentFolder.id, file.id)}
                    className="p-1.5 rounded transition-colors"
                    style={{ color: "var(--gray-4)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--danger)";
                      e.currentTarget.style.background = "rgba(220,38,38,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--gray-4)";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}