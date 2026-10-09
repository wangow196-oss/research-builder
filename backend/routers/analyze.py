"""AI 分析 API — Marker 解析 + AI 8模块分析（SQLite 缓存）"""

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.pdf_parser import parse_pdf_structured, parse_pdf
from services.ai_analyzer import analyze_report, AnalysisResult
from database import db_get_file, db_get_analysis, db_save_analysis, db_get_parse, db_save_parse

router = APIRouter()


class ParseResponse(BaseModel):
    file_id: str
    markdown_length: int
    page_count: int
    preview: str
    fallback: bool = False


@router.post("/parse/{file_id}", response_model=ParseResponse)
async def parse_file(file_id: str):
    """用 Marker 解析 PDF，自动建立 RAG 索引"""
    # 检查解析缓存
    cached_md = db_get_parse(file_id)
    if cached_md:
        return ParseResponse(
            file_id=file_id,
            markdown_length=len(cached_md),
            page_count=0,
            preview=cached_md[:500],
        )

    file_info = db_get_file(file_id)
    if not file_info:
        raise HTTPException(404, "File not found")

    if not os.path.exists(file_info["path"]):
        raise HTTPException(404, "File not found on disk")

    try:
        result = parse_pdf_structured(file_info["path"])
        markdown = result["markdown"]
        page_count = result["page_count"]

        # 保存到 SQLite
        db_save_parse(file_id, markdown)

        # 建立 RAG 索引
        try:
            from services.rag_service import store_report_chunks
            store_report_chunks(file_id, markdown, metadata={"file_name": file_info["name"]})
        except Exception:
            pass

        return ParseResponse(
            file_id=file_id,
            markdown_length=len(markdown),
            page_count=page_count,
            preview=markdown[:500],
        )
    except Exception:
        # Fallback 到 MarkItDown
        try:
            markdown = parse_pdf(file_info["path"])
            db_save_parse(file_id, markdown)

            try:
                from services.rag_service import store_report_chunks
                store_report_chunks(file_id, markdown, metadata={"file_name": file_info["name"]})
            except Exception:
                pass

            return ParseResponse(
                file_id=file_id,
                markdown_length=len(markdown),
                page_count=0,
                preview=markdown[:500],
                fallback=True,
            )
        except Exception as e:
            raise HTTPException(500, f"Parse failed: {str(e)}")


@router.post("/analyze/{file_id}", response_model=AnalysisResult)
async def analyze_file(file_id: str):
    """AI 深度分析研报，返回 8 模块结构化结果"""
    # 检查分析缓存
    cached = db_get_analysis(file_id)
    if cached:
        return AnalysisResult(**cached)

    file_info = db_get_file(file_id)
    if not file_info:
        raise HTTPException(404, "File not found")

    # 获取解析内容（从缓存或重新解析）
    markdown = db_get_parse(file_id)
    if not markdown:
        if not os.path.exists(file_info["path"]):
            raise HTTPException(404, "File not found on disk")
        try:
            result = parse_pdf_structured(file_info["path"])
            markdown = result["markdown"]
            db_save_parse(file_id, markdown)

            try:
                from services.rag_service import store_report_chunks
                store_report_chunks(file_id, markdown, metadata={"file_name": file_info["name"]})
            except Exception:
                pass
        except Exception:
            try:
                markdown = parse_pdf(file_info["path"])
                db_save_parse(file_id, markdown)
            except Exception as e:
                raise HTTPException(500, f"Parse failed: {str(e)}")

    try:
        publish_date = file_info.get("publish_date")
        result = await analyze_report(markdown, publish_date)
        # 缓存到 SQLite
        db_save_analysis(file_id, result.model_dump())
        return result
    except Exception as e:
        raise HTTPException(500, f"Analysis failed: {str(e)}")