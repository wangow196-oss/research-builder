"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Globe, FileText, X, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

interface QAPanelProps {
  selectedText: string;
  fileName: string;
  onClose: () => void;
}

export function QAPanel({ selectedText, fileName, onClose }: QAPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-ask when selectedText changes
  useEffect(() => {
    if (selectedText && messages.length === 0) {
      handleAsk(`请解释以下研报内容的含义：\n\n「${selectedText}」`);
    }
  }, [selectedText]);

  const handleAsk = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (replace with real API call later)
    setTimeout(() => {
      const responses: Record<string, { content: string; sources: string[] }> = {
        default: {
          content: `基于研报「${fileName}」的内容分析：\n\n${selectedText ? `您引用的段落涉及以下要点：\n• 这是研报中的关键论述\n• 与整体研究框架密切相关\n• 建议结合上下文理解\n\n` : ""}这是一个模拟回答。接入 Claude API 后，AI 将：\n1. 结合研报上下文进行深度解读\n2. 搜索互联网获取最新数据佐证\n3. 给出结构化的分析结论`,
          sources: ["研报原文", "模拟数据源"],
        },
      };

      const response = responses.default;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.content,
          sources: response.sources,
        },
      ]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(input);
  };

  return (
    <div className="flex flex-col h-full bg-white" style={{ borderLeft: "1px solid var(--gray-2)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: "var(--gray-2)" }}>
        <div className="flex items-center gap-2">
          <Sparkles size={14} style={{ color: "var(--accent)" }} />
          <span className="text-[13px] font-medium" style={{ color: "var(--gray-8)" }}>研报问答</span>
        </div>
        <button onClick={onClose} className="p-1 rounded" style={{ color: "var(--gray-4)" }}>
          <X size={16} />
        </button>
      </div>

      {/* Selected text quote */}
      {selectedText && (
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--gray-2)", background: "var(--accent-5)" }}>
          <div className="flex items-start gap-2">
            <FileText size={12} className="mt-0.5 flex-shrink-0" style={{ color: "var(--accent)" }} />
            <div>
              <p className="text-[11px] mb-1" style={{ color: "var(--accent)" }}>引用内容</p>
              <p className="text-[12px] leading-relaxed line-clamp-3" style={{ color: "var(--gray-6)" }}>
                「{selectedText.length > 120 ? selectedText.slice(0, 120) + "..." : selectedText}」
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <Sparkles size={32} strokeWidth={1} style={{ color: "var(--gray-3)" }} />
            <p className="text-[13px]" style={{ color: "var(--gray-4)" }}>在 PDF 中选中文本即可提问</p>
            <p className="text-[11px]" style={{ color: "var(--gray-3)" }}>AI 将结合研报内容和互联网数据回答</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[90%] rounded-lg px-3 py-2.5"
              style={{
                background: msg.role === "user" ? "var(--accent)" : "var(--gray-1)",
                color: msg.role === "user" ? "white" : "var(--gray-7)",
              }}
            >
              <p className="text-[12px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 pt-2" style={{ borderTop: "1px solid var(--gray-2)" }}>
                  <Globe size={10} style={{ color: "var(--gray-4)" }} />
                  <span className="text-[10px]" style={{ color: "var(--gray-4)" }}>来源：{msg.sources.join("、")}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg px-3 py-2.5" style={{ background: "var(--gray-1)" }}>
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" style={{ color: "var(--accent)" }} />
                <span className="text-[12px]" style={{ color: "var(--gray-5)" }}>正在分析...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t flex-shrink-0" style={{ borderColor: "var(--gray-2)" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入问题..."
          className="flex-1 px-3 py-2 text-[12px] border rounded-lg outline-none"
          style={{ borderColor: "var(--gray-2)" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--gray-2)")}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 rounded-lg text-white disabled:opacity-40"
          style={{ background: "var(--accent)" }}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
