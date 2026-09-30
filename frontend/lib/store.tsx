"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface FileItem {
  id: string;
  name: string;
  size: string;
  date: string;
  content?: string; // parsed markdown content
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
  addFilesToFolder: (folderId: string, files: { name: string; size: number }[]) => void;
  deleteFile: (folderId: string, fileId: string) => void;
  renameFile: (folderId: string, fileId: string, newName: string) => void;
  moveFile: (fromFolderId: string, toFolderId: string, fileId: string) => void;
  reorderFiles: (folderId: string, fromIndex: number, toIndex: number) => void;
  getFileById: (fileId: string) => { file: FileItem; folder: FolderItem } | null;
  getAllFiles: () => { file: FileItem; folderName: string; folderId: string }[];
}

const defaultFolders: FolderItem[] = [
  {
    id: "gold",
    name: "黄金研究",
    icon: "🥇",
    expanded: true,
    files: [
      { id: "g1", name: "东海证券_拆解黄金定价逻辑与美元美债体系.pdf", size: "4.2 MB", date: "2024-03-15" },
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

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<FolderItem[]>(defaultFolders);
  const [activeFolder, setActiveFolder] = useState("gold");

  const addFolder = useCallback((name: string, icon = "📁") => {
    const id = `folder-${Date.now()}`;
    setFolders((prev) => [...prev, { id, name, icon, files: [], expanded: true }]);
    setActiveFolder(id);
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const addFilesToFolder = useCallback((folderId: string, newFiles: { name: string; size: number }[]) => {
    setFolders((prev) =>
      prev.map((f) => {
        if (f.id !== folderId) return f;
        const items: FileItem[] = newFiles.map((file, i) => ({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          date: new Date().toISOString().split("T")[0],
        }));
        return { ...f, files: [...f.files, ...items] };
      })
    );
  }, []);

  const deleteFile = useCallback((folderId: string, fileId: string) => {
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
