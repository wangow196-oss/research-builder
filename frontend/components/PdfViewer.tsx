"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, MessageSquare } from "lucide-react";
import { getFileBlob } from "@/lib/db";

let DocumentComp: any = null;
let PageComp: any = null;

interface PdfViewerProps {
  fileId: string;
  fileName: string;
  onTextSelect?: (text: string) => void;
}

export function PdfViewer({ fileId, fileName, onTextSelect }: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pdfjsLib, setPdfjsLib] = useState<any>(null);
  const [scrollMode, setScrollMode] = useState(true);
  const [selectedText, setSelectedText] = useState("");
  const [showAskButton, setShowAskButton] = useState(false);
  const [askButtonPos, setAskButtonPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

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
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [fileId]);

  const onDocumentLoadSuccess = ({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setPageNumber(1);
  };

  // Handle text selection for Q&A
  const handleMouseUp = useCallback(() => {
    setTimeout(() => {
      const sel = window.getSelection();
      const text = sel?.toString().trim();
      if (text && text.length > 2) {
        const range = sel?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        if (rect) {
          setSelectedText(text);
          setAskButtonPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
          setShowAskButton(true);
        }
      } else {
        setShowAskButton(false);
      }
    }, 10);
  }, []);

  const handleAskClick = () => {
    setShowAskButton(false);
    if (onTextSelect && selectedText) {
      onTextSelect(selectedText);
    }
  };

  // Trackpad pinch-to-zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setScale((prev) => Math.max(0.5, Math.min(2, prev + delta)));
    }
  }, []);

  // Track current page in scroll mode
  const handleScroll = useCallback(() => {
    if (!scrollMode || !containerRef.current) return;
    const pages = containerRef.current.querySelectorAll("[data-page-number]");
    const containerRect = containerRef.current.getBoundingClientRect();
    let currentPage = 1;
    pages.forEach((page) => {
      const rect = page.getBoundingClientRect();
      if (rect.top < containerRect.top + containerRect.height / 2) {
        currentPage = parseInt(page.getAttribute("data-page-number") || "1");
      }
    });
    setPageNumber(currentPage);
  }, [scrollMode]);

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
        <span className="text-[11px]">请确认文件已通过拖拽上传</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative" onMouseUp={handleMouseUp}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0" style={{ borderColor: "var(--gray-2)", background: "var(--gray-1)" }}>
        <div className="flex items-center gap-2">
          {!scrollMode && (
            <>
              <button onClick={() => setPageNumber(Math.max(1, pageNumber - 1))} disabled={pageNumber <= 1} className="p-1 rounded disabled:opacity-30" style={{ color: "var(--gray-6)" }}>
                <ChevronLeft size={16} />
              </button>
              <span className="text-[12px] tabular-nums" style={{ color: "var(--gray-6)" }}>{pageNumber} / {numPages}</span>
              <button onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))} disabled={pageNumber >= numPages} className="p-1 rounded disabled:opacity-30" style={{ color: "var(--gray-6)" }}>
                <ChevronRight size={16} />
              </button>
            </>
          )}
          {scrollMode && (
            <span className="text-[12px] tabular-nums" style={{ color: "var(--gray-6)" }}>
              第 {pageNumber} / {numPages} 页 · 滚动阅读
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setScrollMode(!scrollMode)} className="px-2 py-1 rounded text-[11px] border" style={{ borderColor: scrollMode ? "var(--accent)" : "var(--gray-2)", color: scrollMode ? "var(--accent)" : "var(--gray-5)", background: scrollMode ? "var(--accent-5)" : "transparent" }}>
            {scrollMode ? "连续滚动" : "翻页模式"}
          </button>
          <button onClick={() => setScale(Math.max(0.5, scale - 0.1))} className="p-1 rounded" style={{ color: "var(--gray-6)" }}><ZoomOut size={14} /></button>
          <span className="text-[11px] tabular-nums" style={{ color: "var(--gray-4)" }}>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(Math.min(2, scale + 0.1))} className="p-1 rounded" style={{ color: "var(--gray-6)" }}><ZoomIn size={14} /></button>
        </div>
      </div>

      {/* PDF Content */}
      <div ref={containerRef} className="flex-1 overflow-auto p-4" style={{ background: "var(--gray-2)" }} onScroll={handleScroll} onWheel={handleWheel}>
        {DocumentComp && PageComp && (
          <DocumentComp file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadError={() => setError(true)} loading={<span className="text-[12px]" style={{ color: "var(--gray-4)" }}>加载中...</span>}>
            {scrollMode ? (
              // Continuous scroll mode — render all pages
              <div className="flex flex-col items-center gap-4">
                {Array.from({ length: numPages }, (_, i) => (
                  <div key={i + 1} data-page-number={i + 1}>
                    <PageComp pageNumber={i + 1} scale={scale} className="shadow-lg" />
                  </div>
                ))}
              </div>
            ) : (
              // Single page mode
              <div className="flex justify-center">
                <PageComp pageNumber={pageNumber} scale={scale} className="shadow-lg" />
              </div>
            )}
          </DocumentComp>
        )}
      </div>

      {/* Floating Ask Button — appears on text selection */}
      {showAskButton && (
        <button
          onClick={handleAskClick}
          className="fixed z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-lg text-[12px] font-medium text-white"
          style={{ left: `${askButtonPos.x}px`, top: `${askButtonPos.y}px`, transform: "translate(-50%, -100%)", background: "var(--accent)" }}
        >
          <MessageSquare size={12} />
          提问
        </button>
      )}
    </div>
  );
}
