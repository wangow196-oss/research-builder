"""PDF 解析服务 — 使用 Marker (CPU fast mode) + pdfplumber"""

import re
from datetime import datetime


# Lazy-loaded Marker converter (singleton)
_converter = None


def _get_converter():
    """Lazy-load Marker converter (CPU mode, no OCR).

    使用 disable_ocr 模式：纯 CPU 运行，不需要 llama.cpp/VLM。
    适合数字 PDF（券商研报通常是数字文档）。
    """
    global _converter
    if _converter is None:
        from marker.converters.pdf import PdfConverter
        from marker.models import create_model_dict
        from marker.config.parser import ConfigParser

        config = {
            "output_format": "markdown",
            "disable_image_extraction": True,
            "disable_ocr": True,  # 纯 CPU，不需要 llama.cpp
        }
        config_parser = ConfigParser(config)
        _converter = PdfConverter(
            config=config_parser.generate_config_dict(),
            artifact_dict=create_model_dict(),
            processor_list=config_parser.get_processors(),
            renderer=config_parser.get_renderer(),
        )
    return _converter


def parse_pdf_structured(file_path: str) -> dict:
    """用 Marker 解析 PDF，返回结构化内容。

    Returns:
        dict with keys: markdown, page_count
    """
    from marker.output import text_from_rendered

    converter = _get_converter()
    rendered = converter(file_path)
    text, _, _ = text_from_rendered(rendered)

    # Extract page count from metadata
    page_count = 0
    if hasattr(rendered, "metadata") and rendered.metadata:
        page_count = getattr(rendered.metadata, "page_count", 0) or 0

    # 如果提取的文本太少，可能是扫描件
    # 注意：disable_ocr 模式下无法处理纯扫描件，需要安装 llama.cpp 才能启用 OCR
    if len(text.strip()) < 100:
        pass  # 当前为纯文本层提取，扫描件需要 OCR 支持

    return {
        "markdown": text,
        "page_count": page_count,
    }


def parse_pdf(file_path: str) -> str:
    """解析 PDF 为 Markdown 文本（兼容旧接口）。

    优先使用 Marker，失败时 fallback 到 MarkItDown。
    """
    try:
        result = parse_pdf_structured(file_path)
        return result["markdown"]
    except Exception:
        # Fallback to MarkItDown
        from markitdown import MarkItDown

        md = MarkItDown()
        result = md.convert(file_path)
        return result.text_content


def extract_publish_date(file_path: str) -> str | None:
    """从 PDF 第一页提取研报发布日期"""
    import pdfplumber

    try:
        with pdfplumber.open(file_path) as pdf:
            if not pdf.pages:
                return None
            # Read first 2 pages for date
            text = ""
            for page in pdf.pages[:2]:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

            if not text:
                return None

            # Common date patterns in Chinese research reports
            patterns = [
                # 2026年9月10日
                r"(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日",
                # 2026-09-10 or 2026/09/10
                r"(\d{4})[-/](\d{1,2})[-/](\d{1,2})",
                # 2026.09.10
                r"(\d{4})\.(\d{1,2})\.(\d{1,2})",
            ]

            for pattern in patterns:
                match = re.search(pattern, text)
                if match:
                    year, month, day = match.group(1), match.group(2), match.group(3)
                    # Validate date
                    try:
                        dt = datetime(int(year), int(month), int(day))
                        # Only return dates between 2000-2030
                        if 2000 <= dt.year <= 2030:
                            return dt.strftime("%Y-%m-%d")
                    except ValueError:
                        continue

            return None
    except Exception:
        return None