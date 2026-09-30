"""研报问答 API — 基于 Mimo（小米）的研报内容问答"""

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# Mimo API config
MIMO_API_BASE = "https://api.xiaomi.com/v1"
MIMO_MODEL = "mimo-v2.5-pro"


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
    """基于研报内容回答问题（使用 Mimo 模型）"""
    api_key = os.environ.get("MIMO_API_KEY") or os.environ.get("ANTHROPIC_API_KEY")

    if not api_key:
        return QAResponse(
            answer=f"（当前为模拟回答，请设置 MIMO_API_KEY 环境变量以启用 AI 问答）\n\n"
                   f"您的问题：{req.question}\n\n"
                   f"{'引用内容：「' + req.selected_text + '」' if req.selected_text else ''}\n\n"
                   f"接入 Mimo API 后，AI 将：\n"
                   f"1. 结合研报「{req.file_name}」的上下文进行深度解读\n"
                   f"2. 分析引用内容在研报逻辑链中的位置\n"
                   f"3. 给出结构化的回答",
            sources=["研报原文"],
        )

    try:
        from openai import OpenAI

        client = OpenAI(
            api_key=api_key,
            base_url=MIMO_API_BASE,
        )

        system_prompt = f"""你是一个专业的投研分析师助手。用户正在阅读一篇研报「{req.file_name}」，并向你提问。

你的任务：
1. 如果用户引用了研报中的内容，先解释这段内容的含义和在研报逻辑中的位置
2. 回答用户的具体问题，结合投研专业知识
3. 如果问题涉及最新数据或事件，基于你的知识进行分析
4. 用简洁专业的语言回答，适当使用要点列表

回答要求：
- 中文回答
- 语言简洁专业
- 保留具体数字
- 如果不确定，明确说明"""

        # Build messages
        messages = [{"role": "system", "content": system_prompt}]
        for msg in req.history:
            messages.append({"role": msg["role"], "content": msg["content"]})

        user_content = ""
        if req.selected_text:
            user_content += f"我在研报中选中了这段内容：\n「{req.selected_text}」\n\n"
        user_content += f"我的问题：{req.question}"
        messages.append({"role": "user", "content": user_content})

        response = client.chat.completions.create(
            model=MIMO_MODEL,
            messages=messages,
            max_tokens=1500,
            temperature=0.7,
        )

        answer = response.choices[0].message.content

        return QAResponse(
            answer=answer,
            sources=["研报原文", "Mimo AI 分析"],
        )

    except Exception as e:
        raise HTTPException(500, f"AI 问答失败: {str(e)}")
