"""研报问答 API — 基于 Claude 的研报内容问答"""

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class QARequest(BaseModel):
    question: str
    selected_text: str = ""
    file_name: str = ""
    history: list[dict] = []  # [{"role": "user/assistant", "content": "..."}]


class QAResponse(BaseModel):
    answer: str
    sources: list[str] = []


@router.post("/qa", response_model=QAResponse)
async def ask_question(req: QARequest):
    """基于研报内容回答问题"""
    api_key = os.environ.get("ANTHROPIC_API_KEY")

    if not api_key:
        # Mock response when no API key
        return QAResponse(
            answer=f"（当前为模拟回答，请设置 ANTHROPIC_API_KEY 环境变量以启用 AI 问答）\n\n"
                   f"您的问题：{req.question}\n\n"
                   f"{'引用内容：「' + req.selected_text + '」' if req.selected_text else ''}\n\n"
                   f"接入 Claude API 后，AI 将：\n"
                   f"1. 结合研报「{req.file_name}」的上下文进行深度解读\n"
                   f"2. 分析引用内容在研报逻辑链中的位置\n"
                   f"3. 给出结构化的回答",
            sources=["研报原文", "（接入 API 后可搜索互联网）"],
        )

    try:
        from anthropic import Anthropic

        client = Anthropic(api_key=api_key)

        system_prompt = f"""你是一个专业的投研分析师助手。用户正在阅读一篇研报「{req.file_name}」，并向你提问。

你的任务：
1. 如果用户引用了研报中的内容，先解释这段内容的含义和在研报逻辑中的位置
2. 回答用户的具体问题，结合投研专业知识
3. 如果问题涉及最新数据或事件，说明你无法搜索互联网，但可以基于已有知识分析
4. 用简洁专业的语言回答，适当使用要点列表

回答要求：
- 中文回答
- 语言简洁专业
- 保留具体数字
- 如果不确定，明确说明"""

        # Build messages
        messages = []
        for msg in req.history:
            messages.append({"role": msg["role"], "content": msg["content"]})

        user_content = ""
        if req.selected_text:
            user_content += f"我在研报中选中了这段内容：\n「{req.selected_text}」\n\n"
        user_content += f"我的问题：{req.question}"

        messages.append({"role": "user", "content": user_content})

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1500,
            system=system_prompt,
            messages=messages,
        )

        answer = message.content[0].text

        return QAResponse(
            answer=answer,
            sources=["研报原文", "Claude AI 分析"],
        )

    except Exception as e:
        raise HTTPException(500, f"AI 问答失败: {str(e)}")
