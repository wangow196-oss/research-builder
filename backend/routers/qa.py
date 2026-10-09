"""研报问答 API — RAG 检索 + AI 生成"""

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config import API_BASE_URL, API_KEY, API_MODEL

router = APIRouter()


class QARequest(BaseModel):
    question: str
    selected_text: str = ""
    file_name: str = ""
    file_id: str = ""
    history: list[dict] = []


class QAResponse(BaseModel):
    answer: str
    sources: list[str] = []
    chunks_used: int = 0


@router.post("/qa", response_model=QAResponse)
async def ask_question(req: QARequest):
    """基于研报内容 + RAG 检索回答问题"""
    api_key = API_KEY

    # Step 1: RAG 检索相关片段
    relevant_chunks = []
    try:
        from services.rag_service import search_similar_chunks

        if req.file_id:
            relevant_chunks = search_similar_chunks(
                query=req.question, file_id=req.file_id, n_results=5
            )
        else:
            relevant_chunks = search_similar_chunks(
                query=req.question, n_results=5
            )
    except Exception:
        pass  # RAG 失败不影响问答

    # 构建上下文
    context_parts = []
    for chunk in relevant_chunks:
        context_parts.append(chunk["text"])
    context = "\n\n---\n\n".join(context_parts) if context_parts else ""

    if not api_key:
        return QAResponse(
            answer=(
                f"（当前为模拟回答，请设置 MIMO_API_KEY 环境变量以启用 AI 问答）\n\n"
                f"您的问题：{req.question}\n\n"
                f"{'引用内容：「' + req.selected_text + '」' if req.selected_text else ''}\n\n"
                f"RAG 检索到 {len(relevant_chunks)} 个相关片段\n\n"
                f"接入 Mimo API 后，AI 将结合研报上下文进行深度解读"
            ),
            sources=["研报原文"],
            chunks_used=len(relevant_chunks),
        )

    try:
        import anthropic

        client = anthropic.Anthropic(
            api_key=api_key,
            base_url=API_BASE_URL,
        )

        system_prompt = f"""你是一个专业的投研分析师助手。用户正在阅读研报「{req.file_name}」并向你提问。

以下是通过语义检索找到的研报相关片段：
{context if context else "（未找到相关片段，请基于你的知识回答）"}

你的任务：
1. 基于检索到的研报片段回答问题，引用具体数据和原文
2. 如果片段中没有直接答案，结合投研专业知识进行分析
3. 如果用户引用了研报内容，先解释其含义和在逻辑链中的位置
4. 用简洁专业的语言回答

回答要求：
- 中文回答
- 保留具体数字
- 不确定时明确说明
- 标注信息来源（研报片段 or 专业判断）"""

        # 构建消息列表（Anthropic API 不支持 system role in messages）
        messages = []
        for msg in req.history[-6:]:
            if msg["role"] in ("user", "assistant"):
                messages.append({"role": msg["role"], "content": msg["content"]})

        user_content = ""
        if req.selected_text:
            user_content += f"我在研报中选中了：\n「{req.selected_text}」\n\n"
        user_content += f"问题：{req.question}"
        messages.append({"role": "user", "content": user_content})

        response = client.messages.create(
            model=API_MODEL,
            system=system_prompt,
            messages=messages,
            max_tokens=8000,
            temperature=0.5,
        )

        # 提取文本内容（跳过 thinking 块）
        answer = ""
        for block in response.content:
            if hasattr(block, "text"):
                answer = block.text
                break
        if not answer:
            answer = response.content[0].text if response.content else ""

        sources = ["研报原文（RAG 检索）"]
        if relevant_chunks:
            sources = [f"研报片段 ({len(relevant_chunks)}条)", "Mimo AI 分析"]

        return QAResponse(
            answer=answer,
            sources=sources,
            chunks_used=len(relevant_chunks),
        )

    except Exception as e:
        raise HTTPException(500, f"AI 问答失败: {str(e)}")