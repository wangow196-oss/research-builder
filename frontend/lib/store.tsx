"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { saveFileBlob, deleteFileBlob, getFileBlob } from "./db";
import { api } from "./api";

export interface FileItem {
  id: string;
  name: string;
  size: string;
  date: string;
  publishDate?: string; // 研报发布日期（从PDF第一页提取）
  hasBlob?: boolean; // whether a PDF blob is stored in IndexedDB
  backendFileId?: string; // 后端文件 ID（上传后获得）
}

export interface FolderItem {
  id: string;
  name: string;
  icon: string;
  files: FileItem[];
  expanded: boolean;
}

interface StoreContextType {
  folders: FolderItem[];
  activeFolder: string;
  setActiveFolder: (id: string) => void;
  addFolder: (name: string, icon?: string) => void;
  deleteFolder: (id: string) => void;
  addFilesToFolder: (folderId: string, files: { name: string; size: number; blob?: Blob }[]) => Promise<void>;
  deleteFile: (folderId: string, fileId: string) => void;
  renameFile: (folderId: string, fileId: string, newName: string) => void;
  moveFile: (fromFolderId: string, toFolderId: string, fileId: string) => void;
  reorderFiles: (folderId: string, fromIndex: number, toIndex: number) => void;
  getFileById: (fileId: string) => { file: FileItem; folder: FolderItem } | null;
  getAllFiles: () => { file: FileItem; folderName: string; folderId: string }[];
}

const STORAGE_KEY = "reportmind-folders";

const defaultFolders: FolderItem[] = [
  {
    id: "gold",
    name: "黄金研究",
    icon: "🥇",
    expanded: true,
    files: [
      { id: "g1", name: "东海证券_拆解黄金定价逻辑与美元美债体系.pdf", size: "5.1 MB", date: "2026-09-10", publishDate: "2026-09-10", hasBlob: true },
      { id: "g2", name: "东北证券_黄金历史的回响——复盘70年代黄金大牛市.pdf", size: "2.4 MB", date: "2026-09-10", publishDate: "2026-09-10", hasBlob: true },
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

// Load from localStorage
function loadFolders(): FolderItem[] {
  if (typeof window === "undefined") return defaultFolders;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return defaultFolders;
}

// Save to localStorage
function saveFolders(folders: FolderItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  } catch {}
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<FolderItem[]>(defaultFolders);
  const [activeFolder, setActiveFolder] = useState("gold");
  const [initialized, setInitialized] = useState(false);

  // Load from localStorage on mount + fetch demo PDFs
  useEffect(() => {
    const loaded = loadFolders();
    setFolders(loaded);
    setInitialized(true);

    // Fetch demo PDFs into IndexedDB if not already stored
    const demoFiles = [
      { id: "g1", url: "/demo-pdfs/东海证券_拆解黄金定价逻辑.pdf" },
      { id: "g2", url: "/demo-pdfs/东北证券_黄金历史的回响.pdf" },
    ];
    demoFiles.forEach(async ({ id, url }) => {
      try {
        const existing = await getFileBlob(id);
        if (!existing) {
          const res = await fetch(url);
          if (res.ok) {
            const blob = await res.blob();
            await saveFileBlob(id, blob);
          }
        }
      } catch {}
    });
  }, []);

  // Save to localStorage whenever folders change
  useEffect(() => {
    if (initialized) {
      saveFolders(folders);
    }
  }, [folders, initialized]);

  const addFolder = useCallback((name: string, icon = "📁") => {
    const id = `folder-${Date.now()}`;
    setFolders((prev) => [...prev, { id, name, icon, files: [], expanded: true }]);
    setActiveFolder(id);
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const addFilesToFolder = useCallback(async (folderId: string, newFiles: { name: string; size: number; blob?: Blob }[]) => {
    const items: FileItem[] = [];
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const fileId = `file-${Date.now()}-${i}`;

      // Save blob to IndexedDB if provided
      if (file.blob) {
        await saveFileBlob(fileId, file.blob);
      }

      // Try to upload to backend and get publish date + backend file ID
      let publishDate: string | undefined;
      let backendFileId: string | undefined;
      if (file.blob) {
        try {
          const formData = new FormData();
          formData.append("file", file.blob, file.name);
          const res = await fetch("api("/api")/upload", {
            method: "POST",
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            publishDate = data.publish_date || undefined;
            backendFileId = data.id || undefined;
          }
        } catch {
          // Backend not available, skip
        }
      }

      items.push({
        id: fileId,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        date: new Date().toISOString().split("T")[0],
        publishDate: publishDate,
        hasBlob: !!file.blob,
        backendFileId: backendFileId,
      });
    }
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, files: [...f.files, ...items] } : f))
    );
  }, []);

  const deleteFile = useCallback((folderId: string, fileId: string) => {
    // Delete blob from IndexedDB
    deleteFileBlob(fileId).catch(() => {});
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, files: f.files.filter((file) => file.id !== fileId) } : f))
    );
  }, []);

  const renameFile = useCallback((folderId: string, fileId: string, newName: string) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? { ...f, files: f.files.map((file) => (file.id === fileId ? { ...file, name: newName } : file)) }
          : f
      )
    );
  }, []);

  const moveFile = useCallback((fromFolderId: string, toFolderId: string, fileId: string) => {
    setFolders((prev) => {
      let movedFile: FileItem | null = null;
      const updated = prev.map((f) => {
        if (f.id === fromFolderId) {
          movedFile = f.files.find((file) => file.id === fileId) || null;
          return { ...f, files: f.files.filter((file) => file.id !== fileId) };
        }
        return f;
      });
      if (!movedFile) return prev;
      return updated.map((f) => (f.id === toFolderId ? { ...f, files: [...f.files, movedFile!] } : f));
    });
  }, []);

  const reorderFiles = useCallback((folderId: string, fromIndex: number, toIndex: number) => {
    setFolders((prev) =>
      prev.map((f) => {
        if (f.id !== folderId) return f;
        const files = [...f.files];
        const [moved] = files.splice(fromIndex, 1);
        files.splice(toIndex, 0, moved);
        return { ...f, files };
      })
    );
  }, []);

  const getFileById = useCallback(
    (fileId: string) => {
      for (const folder of folders) {
        const file = folder.files.find((f) => f.id === fileId);
        if (file) return { file, folder };
      }
      return null;
    },
    [folders]
  );

  const getAllFiles = useCallback(() => {
    const result: { file: FileItem; folderName: string; folderId: string }[] = [];
    for (const folder of folders) {
      for (const file of folder.files) {
        result.push({ file, folderName: folder.name, folderId: folder.id });
      }
    }
    return result;
  }, [folders]);

  return (
    <StoreContext.Provider
      value={{
        folders,
        activeFolder,
        setActiveFolder,
        addFolder,
        deleteFolder,
        addFilesToFolder,
        deleteFile,
        renameFile,
        moveFile,
        reorderFiles,
        getFileById,
        getAllFiles,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
