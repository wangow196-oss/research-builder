"""AI 分析 API — PDF 解析 + Claude 分析"""

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.pdf_parser import parse_pdf
from services.ai_analyzer import analyze_report

router = APIRouter()


class AnalysisResult(BaseModel):
    framework: str
    indicators: str
    charts: str
    thinking: str


# Cache for parsed content
parse_cache: dict[str, str] = {}


@router.post("/parse/{file_id}")
def parse_file(file_id: str):
    """解析 PDF 文件为 Markdown"""
    from routers.files import file_registry

    if file_id not in file_registry:
        raise HTTPException(404, "File not found")

    file_info = file_registry[file_id]
    if not os.path.exists(file_info["path"]):
        raise HTTPException(404, "File not found on disk")

    try:
        markdown = parse_pdf(file_info["path"])
        parse_cache[file_id] = markdown
        file_info["parsed"] = True
        return {
            "file_id": file_id,
            "markdown_length": len(markdown),
            "preview": markdown[:500],
        }
    except Exception as e:
        raise HTTPException(500, f"Parse failed: {str(e)}")


@router.post("/analyze/{file_id}", response_model=AnalysisResult)
async def analyze_file(file_id: str):
    """AI 分析研报内容"""
    from routers.files import file_registry

    if file_id not in file_registry:
        raise HTTPException(404, "File not found")

    # Parse if not already parsed
    if file_id not in parse_cache:
        file_info = file_registry[file_id]
        if not os.path.exists(file_info["path"]):
            raise HTTPException(404, "File not found on disk")
        try:
            markdown = parse_pdf(file_info["path"])
            parse_cache[file_id] = markdown
        except Exception as e:
            raise HTTPException(500, f"Parse failed: {str(e)}")

    markdown = parse_cache[file_id]

    try:
        result = await analyze_report(markdown)
        return result
    except Exception as e:
        raise HTTPException(500, f"Analysis failed: {str(e)}")
