"""文件管理 API — 上传、列表、删除"""

import os
import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# In-memory file registry (replace with SQLite later)
file_registry: dict[str, dict] = {}


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """上传 PDF 文件"""
    if not file.filename:
        raise HTTPException(400, "No file provided")

    file_id = str(uuid.uuid4())[:8]
    ext = os.path.splitext(file.filename)[1]
    saved_name = f"{file_id}{ext}"
    save_path = os.path.join(UPLOAD_DIR, saved_name)

    content = await file.read()
    with open(save_path, "wb") as f:
        f.write(content)

    # Try to extract publish date from PDF
    publish_date = None
    if file.filename.lower().endswith(".pdf"):
        try:
            from services.pdf_parser import extract_publish_date
            publish_date = extract_publish_date(save_path)
        except Exception:
            pass

    file_registry[file_id] = {
        "id": file_id,
        "name": file.filename,
        "size": len(content),
        "path": save_path,
        "uploaded_at": datetime.now().isoformat(),
        "publish_date": publish_date,
        "parsed": False,
    }

    return file_registry[file_id]


@router.get("/files")
def list_files():
    """列出所有已上传文件"""
    return {"files": list(file_registry.values())}


@router.delete("/files/{file_id}")
def delete_file(file_id: str):
    """删除文件"""
    if file_id not in file_registry:
        raise HTTPException(404, "File not found")

    file_info = file_registry[file_id]
    if os.path.exists(file_info["path"]):
        os.remove(file_info["path"])

    del file_registry[file_id]
    return {"message": "Deleted", "id": file_id}
