"""PDF 解析服务 — 使用 MarkItDown"""

from markitdown import MarkItDown


def parse_pdf(file_path: str) -> str:
    """将 PDF 文件解析为 Markdown 文本"""
    md = MarkItDown()
    result = md.convert(file_path)
    return result.text_content
