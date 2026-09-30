"""AI 分析服务 — 调用 Claude API"""

import os
from anthropic import Anthropic
from pydantic import BaseModel


class AnalysisResult(BaseModel):
    framework: str
    indicators: str
    charts: str
    thinking: str


SYSTEM_PROMPT = """你是一个专业的投研分析师助手。你的任务是分析券商研报，提取关键信息。

请从研报中提取以下四个维度的信息，每个维度用简洁的要点形式输出：

1. **研报框架**：研究方法论、分析逻辑链、核心假设
2. **核心指标**：关注了哪些关键指标、当前值、历史区间
3. **图表说明**：使用了什么图表类型、数据来源、关键趋势
4. **分析思路**：从什么角度切入、推理逻辑、结论依据

要求：
- 每个维度 3-5 个要点
- 语言简洁专业
- 保留具体数字和区间
- 如果研报中没有明确提到某个维度，说明"研报未涉及"
"""


async def analyze_report(content: str) -> AnalysisResult:
    """调用 Claude API 分析研报内容"""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        # Return mock data if no API key
        return AnalysisResult(
            framework="（需配置 ANTHROPIC_API_KEY）\n研究方法：自下而上选股\n分析逻辑：盈利预测 → 估值 → 目标价",
            indicators="（需配置 ANTHROPIC_API_KEY）\nPE(TTM): 28.5x\n营收增速: 15.2%",
            charts="（需配置 ANTHROPIC_API_KEY）\nK线图、营收拆分饼图、估值对比折线图",
            thinking="（需配置 ANTHROPIC_API_KEY）\n从品牌护城河切入，关注提价能力",
        )

    client = Anthropic(api_key=api_key)

    # Truncate content if too long
    max_chars = 50000
    if len(content) > max_chars:
        content = content[:max_chars] + "\n\n[...内容已截断...]"

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"请分析以下研报内容：\n\n{content}",
            }
        ],
    )

    response_text = message.content[0].text

    # Parse response into four sections
    sections = {"framework": "", "indicators": "", "charts": "", "thinking": ""}
    current_section = None

    for line in response_text.split("\n"):
        line_lower = line.lower()
        if "框架" in line or "framework" in line_lower:
            current_section = "framework"
            continue
        elif "指标" in line or "indicator" in line_lower:
            current_section = "indicators"
            continue
        elif "图表" in line or "chart" in line_lower:
            current_section = "charts"
            continue
        elif "思路" in line or "分析" in line and "thinking" not in sections:
            current_section = "thinking"
            continue

        if current_section and line.strip():
            sections[current_section] += line.strip() + "\n"

    # Fallback: if parsing failed, put everything in framework
    if not any(sections.values()):
        sections["framework"] = response_text

    return AnalysisResult(**sections)
