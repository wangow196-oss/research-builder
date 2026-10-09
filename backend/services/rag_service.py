"""RAG 服务 — ChromaDB 向量存储 + 检索"""

import os
import chromadb
from config import CHROMA_DIR

# Singleton client
_client = None


def get_client() -> chromadb.ClientAPI:
    """获取 ChromaDB 持久化客户端"""
    global _client
    if _client is None:
        os.makedirs(CHROMA_DIR, exist_ok=True)
        _client = chromadb.PersistentClient(path=CHROMA_DIR)
    return _client


def get_report_collection() -> chromadb.Collection:
    """获取或创建研报分块集合"""
    client = get_client()
    return client.get_or_create_collection(
        name="report_chunks",
        metadata={"hnsw:space": "cosine"},
    )


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> list[str]:
    """将文本按段落边界分块，支持重叠。

    Args:
        text: 要分块的文本
        chunk_size: 每块目标大小（字符）
        overlap: 块间重叠大小
    """
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        if len(current_chunk) + len(para) > chunk_size and current_chunk:
            chunks.append(current_chunk.strip())
            # 保留上一块末尾作为重叠
            current_chunk = current_chunk[-overlap:] + "\n\n" + para
        else:
            current_chunk += "\n\n" + para if current_chunk else para

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    # 处理超长段落
    final_chunks = []
    for chunk in chunks:
        if len(chunk) > chunk_size * 1.5:
            for i in range(0, len(chunk), chunk_size - overlap):
                final_chunks.append(chunk[i : i + chunk_size])
        else:
            final_chunks.append(chunk)

    return final_chunks


def _chunk_id(file_id: str, index: int) -> str:
    """生成确定性 chunk ID"""
    return f"{file_id}::{index}"


def store_report_chunks(
    file_id: str, markdown: str, metadata: dict | None = None
) -> int:
    """将研报内容分块存入 ChromaDB。

    Args:
        file_id: 文件 ID
        markdown: 解析后的 Markdown 文本
        metadata: 额外元数据（如 file_name）

    Returns:
        存入的 chunk 数量
    """
    collection = get_report_collection()

    # 删除该文件已有的 chunks（幂等重建）
    existing = collection.get(where={"file_id": file_id})
    if existing["ids"]:
        collection.delete(ids=existing["ids"])

    chunks = chunk_text(markdown)
    if not chunks:
        return 0

    ids = [_chunk_id(file_id, i) for i in range(len(chunks))]
    metadatas = []
    for i, chunk in enumerate(chunks):
        meta = {"file_id": file_id, "chunk_index": i}
        if metadata:
            meta.update(metadata)
        metadatas.append(meta)

    collection.add(
        ids=ids,
        documents=chunks,
        metadatas=metadatas,
    )

    return len(chunks)


def search_similar_chunks(
    query: str,
    file_id: str | None = None,
    n_results: int = 5,
) -> list[dict]:
    """语义搜索研报片段。

    Args:
        query: 查询文本
        file_id: 限定搜索某篇研报（None 则跨所有研报）
        n_results: 返回结果数

    Returns:
        list of {text, file_id, chunk_index, distance}
    """
    collection = get_report_collection()

    where_filter = {"file_id": file_id} if file_id else None

    try:
        results = collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where_filter,
            include=["documents", "metadatas", "distances"],
        )
    except Exception:
        return []

    chunks = []
    if results["documents"] and results["documents"][0]:
        for i, doc in enumerate(results["documents"][0]):
            chunks.append(
                {
                    "text": doc,
                    "file_id": results["metadatas"][0][i].get("file_id", ""),
                    "chunk_index": results["metadatas"][0][i].get("chunk_index", 0),
                    "distance": results["distances"][0][i],
                }
            )

    return chunks


def get_report_stats(file_id: str) -> dict:
    """获取某篇研报的索引统计"""
    collection = get_report_collection()
    try:
        existing = collection.get(where={"file_id": file_id})
        return {
            "file_id": file_id,
            "chunk_count": len(existing["ids"]),
            "indexed": len(existing["ids"]) > 0,
        }
    except Exception:
        return {"file_id": file_id, "chunk_count": 0, "indexed": False}


def delete_report_chunks(file_id: str) -> None:
    """删除某篇研报的所有 chunks"""
    collection = get_report_collection()
    try:
        existing = collection.get(where={"file_id": file_id})
        if existing["ids"]:
            collection.delete(ids=existing["ids"])
    except Exception:
        pass