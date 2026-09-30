"use client";

import { useState, useCallback } from "react";
import {
  FolderOpen,
  FileText,
  Upload,
  Trash2,
  FolderPlus,
} from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  size: string;
  date: string;
  folder: string;
}

const mockFiles: FileItem[] = [
  { id: "1", name: "贵州茅台2024年报点评.pdf", size: "2.3 MB", date: "2024-03-15", folder: "未分类" },
  { id: "2", name: "新能源行业深度报告.pdf", size: "5.1 MB", date: "2024-03-14", folder: "未分类" },
  { id: "3", name: "宏观经济季度展望.pdf", size: "1.8 MB", date: "2024-03-13", folder: "未分类" },
  { id: "4", name: "芯片产业链梳理.pdf", size: "3.6 MB", date: "2024-03-12", folder: "半导体" },
];

export default function ImportPage() {
  const [files] = useState<FileItem[]>(mockFiles);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // TODO: handle file upload
  }, []);

  return (
    <div className="max-w-4xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--gray-8)" }}
        >
          研报导入
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--gray-5)" }}>
          拖拽或选择本地研报文件，支持 PDF、Word、图片格式
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className="border-2 border-dashed rounded-lg p-10 text-center mb-6 transition-colors cursor-pointer"
        style={{
          borderColor: isDragging ? "var(--accent)" : "var(--gray-2)",
          background: isDragging ? "var(--accent-5)" : "var(--gray-1)",
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg"
          className="hidden"
        />
        <Upload
          size={32}
          strokeWidth={1.5}
          className="mx-auto mb-3"
          style={{ color: isDragging ? "var(--accent)" : "var(--gray-4)" }}
        />
        <p
          className="text-[14px] font-medium mb-1"
          style={{ color: isDragging ? "var(--accent)" : "var(--gray-6)" }}
        >
          {isDragging ? "松开即可上传" : "拖拽研报文件到这里"}
        </p>
        <p className="text-[12px]" style={{ color: "var(--gray-4)" }}>
          或点击选择文件 · 支持 PDF、Word、图片
        </p>
      </div>

      {/* Folder Actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FolderOpen size={16} style={{ color: "var(--gray-5)" }} />
          <span
            className="text-[13px] font-medium"
            style={{ color: "var(--gray-7)" }}
          >
            我的研报库
          </span>
          <span
            className="text-[11px] px-1.5 py-0.5 rounded"
            style={{
              background: "var(--gray-2)",
              color: "var(--gray-5)",
            }}
          >
            {files.length}
          </span>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] border transition-colors"
          style={{
            borderColor: "var(--gray-2)",
            color: "var(--gray-6)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--gray-2)";
            e.currentTarget.style.color = "var(--gray-6)";
          }}
        >
          <FolderPlus size={14} />
          新建文件夹
        </button>
      </div>

      {/* File List */}
      <div
        className="border rounded-lg overflow-hidden"
        style={{ borderColor: "var(--gray-2)" }}
      >
        {/* Table Header */}
        <div
          className="grid grid-cols-[1fr_80px_100px_60px] gap-4 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider border-b"
          style={{
            background: "var(--gray-1)",
            borderColor: "var(--gray-2)",
            color: "var(--gray-4)",
          }}
        >
          <span>文件名</span>
          <span>大小</span>
          <span>上传时间</span>
          <span></span>
        </div>

        {/* File Rows */}
        {files.map((file) => (
          <div
            key={file.id}
            className="grid grid-cols-[1fr_80px_100px_60px] gap-4 px-4 py-3 items-center border-b transition-colors cursor-pointer"
            style={{ borderColor: "var(--gray-2)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--gray-1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText size={16} style={{ color: "var(--accent)" }} />
              <span
                className="text-[13px] truncate"
                style={{ color: "var(--gray-7)" }}
              >
                {file.name}
              </span>
            </div>
            <span
              className="text-[12px] tabular-nums"
              style={{ color: "var(--gray-4)" }}
            >
              {file.size}
            </span>
            <span
              className="text-[12px]"
              style={{ color: "var(--gray-4)" }}
            >
              {file.date}
            </span>
            <button
              className="p-1.5 rounded transition-colors"
              style={{ color: "var(--gray-4)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--danger)";
                e.currentTarget.style.background = "rgba(220, 38, 38, 0.08)";
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
  );
}
