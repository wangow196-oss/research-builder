"""文件管理 API — 上传、列表、删除（SQLite 持久化）"""

import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from config import UPLOAD_DIR
from database import (
    db_insert_file, db_get_file, db_list_files, db_delete_file,
    db_list_folders, db_create_folder, db_delete_folder, db_add_file_to_folder,
)

router = APIRouter()


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

    # 尝试提取发布日期
    publish_date = None
    if file.filename.lower().endswith(".pdf"):
        try:
            from services.pdf_parser import extract_publish_date
            publish_date = extract_publish_date(save_path)
        except Exception:
            pass

    # 保存到数据库
    db_insert_file(file_id, file.filename, len(content), save_path, publish_date)

    return {
        "id": file_id,
        "name": file.filename,
        "size": len(content),
        "path": save_path,
        "publish_date": publish_date,
    }


@router.get("/files")
def list_files():
    """列出所有已上传文件"""
    files = db_list_files()
    return {"files": files}


@router.get("/files/{file_id}")
def get_file(file_id: str):
    """获取单个文件信息"""
    file_info = db_get_file(file_id)
    if not file_info:
        raise HTTPException(404, "File not found")
    return file_info


@router.delete("/files/{file_id}")
def delete_file(file_id: str):
    """删除文件"""
    file_info = db_get_file(file_id)
    if not file_info:
        raise HTTPException(404, "File not found")

    # 删除磁盘文件
    if file_info.get("path") and os.path.exists(file_info["path"]):
        os.remove(file_info["path"])

    # 清理 RAG 索引
    try:
        from services.rag_service import delete_report_chunks
        delete_report_chunks(file_id)
    except Exception:
        pass

    # 删除数据库记录
    db_delete_file(file_id)
    return {"message": "Deleted", "id": file_id}


# ==================== 文件夹 API ====================


@router.get("/folders")
def list_folders():
    """列出所有文件夹及其文件"""
    folders = db_list_folders()
    result = []
    for folder in folders:
        files = db_list_files(folder["id"])
        result.append({**folder, "files": files})
    return {"folders": result}


@router.post("/folders")
def create_folder(name: str, icon: str = "📁"):
    """创建文件夹"""
    folder_id = f"folder-{uuid.uuid4().hex[:8]}"
    db_create_folder(folder_id, name, icon)
    return {"id": folder_id, "name": name, "icon": icon}


@router.delete("/folders/{folder_id}")
def delete_folder(folder_id: str):
    """删除文件夹"""
    db_delete_folder(folder_id)
    return {"message": "Deleted", "id": folder_id}


@router.post("/folders/{folder_id}/files/{file_id}")
def add_file_to_folder(folder_id: str, file_id: str):
    """将文件添加到文件夹"""
    db_add_file_to_folder(folder_id, file_id)
    return {"message": "Added"}