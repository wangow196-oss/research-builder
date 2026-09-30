"""PDF 解析服务 — 使用 pdfplumber + MarkItDown"""

import re
from datetime import datetime


def parse_pdf(file_path: str) -> str:
    """将 PDF 文件解析为 Markdown 文本"""
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
                        # Only return dates between 2000-2030 (reasonable for research reports)
                        if 2000 <= dt.year <= 2030:
                            return dt.strftime("%Y-%m-%d")
                    except ValueError:
                        continue

            return None
    except Exception:
        return None
