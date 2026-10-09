"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Globe, FileText, X, Sparkles, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

interface QAPanelProps {
  selectedText: string;
  fileName: string;
  fileId?: string;
  onClose: () => void;
}

export function QAPanel({ selectedText, fileName, fileId, onClose }: QAPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set initial input based on selected text
  useEffect(() => {
    if (selectedText) {
      setInput(`请解释「${selectedText.slice(0, 50)}${selectedText.length > 50 ? "..." : ""}」`);
    }
  }, [selectedText]);

  const handleAsk = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(api("/api/qa"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          selected_text: selectedText,
          file_name: fileName,
          file_id: fileId || "",
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("请求失败");

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "请求失败，请确认后端服务已启动",
          sources: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(input);
  };

  const quickQuestions = selectedText
    ? [
        `什么是${selectedText.slice(0, 15)}？`,
        `这对投资有什么影响？`,
        `最新的数据是什么？`,
        `和${selectedText.slice(0, 10)}相关的概念有哪些？`,
      ]
    : [];

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
              <p className="text-[11px] mb-1" style={{ color: "var(--accent)" }}>选中内容</p>
              <p className="text-[12px] leading-relaxed" style={{ color: "var(--gray-6)" }}>
                「{selectedText.length > 200 ? selectedText.slice(0, 200) + "..." : selectedText}」
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <MessageSquare size={32} strokeWidth={1} style={{ color: "var(--gray-3)" }} />
            <div>
              <p className="text-[13px] mb-1" style={{ color: "var(--gray-5)" }}>
                {selectedText ? "基于选中内容提问" : "在 PDF 中选中文本即可提问"}
              </p>
              <p className="text-[11px]" style={{ color: "var(--gray-4)" }}>
                AI 将结合研报内容为你解答
              </p>
            </div>
            {/* Quick questions */}
            {quickQuestions.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleAsk(q)}
                    className="px-3 py-1.5 rounded-full text-[11px] border transition-colors"
                    style={{ borderColor: "var(--gray-2)", color: "var(--gray-6)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--gray-2)"; e.currentTarget.style.color = "var(--gray-6)"; }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
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
                <div className="flex items-center gap-1.5 mt-2 pt-2" style={{ borderTop: msg.role === "user" ? "1px solid rgba(255,255,255,0.2)" : "1px solid var(--gray-2)" }}>
                  <Globe size={10} style={{ color: msg.role === "user" ? "rgba(255,255,255,0.6)" : "var(--gray-4)" }} />
                  <span className="text-[10px]" style={{ color: msg.role === "user" ? "rgba(255,255,255,0.6)" : "var(--gray-4)" }}>来源：{msg.sources.join("、")}</span>
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
          placeholder="输入你的问题..."
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
