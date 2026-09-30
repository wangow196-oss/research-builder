"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { getFileBlob } from "@/lib/db";

// We'll load react-pdf dynamically on the client
let DocumentComp: any = null;
let PageComp: any = null;

interface PdfViewerProps {
  fileId: string;
  fileName: string;
}

export function PdfViewer({ fileId, fileName }: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pdfjsLib, setPdfjsLib] = useState<any>(null);

  // Load pdfjs and components on client side
  useEffect(() => {
    Promise.all([
      import("react-pdf/dist/Page/AnnotationLayer.css"),
      import("react-pdf/dist/Page/TextLayer.css"),
      import("react-pdf"),
    ]).then(([, , mod]) => {
      DocumentComp = mod.Document;
      PageComp = mod.Page;
      const pdfjs = mod.pdfjs;
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      setPdfjsLib(pdfjs);
    });
  }, []);

  useEffect(() => {
    let url: string | null = null;
    setLoading(true);
    setError(false);

    getFileBlob(fileId)
      .then((blob) => {
        if (blob) {
          url = URL.createObjectURL(blob);
          setPdfUrl(url);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [fileId]);

  const onDocumentLoadSuccess = ({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setPageNumber(1);
  };

  if (loading || !pdfjsLib) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: "var(--gray-4)" }}>
        <Loader2 size={24} className="animate-spin mr-2" />
        <span className="text-[13px]">加载 PDF 中...</span>
      </div>
    );
  }

  if (error || !pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: "var(--gray-4)" }}>
        <span className="text-[13px]">无法加载 PDF 文件</span>
        <span className="text-[11px]">请确认文件已通过拖拽上传（而非仅添加占位）</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "var(--gray-2)", background: "var(--gray-1)" }}>
        <div className="flex items-center gap-2">
          <button onClick={() => setPageNumber(Math.max(1, pageNumber - 1))} disabled={pageNumber <= 1} className="p-1 rounded disabled:opacity-30" style={{ color: "var(--gray-6)" }}>
            <ChevronLeft size={16} />
          </button>
          <span className="text-[12px] tabular-nums" style={{ color: "var(--gray-6)" }}>
            {pageNumber} / {numPages}
          </span>
          <button onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))} disabled={pageNumber >= numPages} className="p-1 rounded disabled:opacity-30" style={{ color: "var(--gray-6)" }}>
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setScale(Math.max(0.5, scale - 0.1))} className="p-1 rounded" style={{ color: "var(--gray-6)" }}>
            <ZoomOut size={14} />
          </button>
          <span className="text-[11px] tabular-nums" style={{ color: "var(--gray-4)" }}>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(Math.min(2, scale + 0.1))} className="p-1 rounded" style={{ color: "var(--gray-6)" }}>
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      {/* PDF Pages */}
      <div className="flex-1 overflow-auto p-4 flex justify-center" style={{ background: "var(--gray-2)" }}>
        {DocumentComp && PageComp && (
          <DocumentComp file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadError={() => setError(true)} loading={<span className="text-[12px]" style={{ color: "var(--gray-4)" }}>加载中...</span>}>
            <PageComp pageNumber={pageNumber} scale={scale} className="shadow-lg" />
          </DocumentComp>
        )}
      </div>
    </div>
  );
}
