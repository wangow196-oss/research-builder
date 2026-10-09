"""研报智析 Backend — FastAPI Server"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import FRONTEND_URL
from database import init_db
from routers import files, analyze, data, qa

# 初始化数据库
init_db()

app = FastAPI(
    title="研报智析 API",
    description="投研新人的智能研报学习工具后端",
    version="0.2.0",
)

# CORS — 支持 Vercel 和本地开发
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(files.router, prefix="/api", tags=["files"])
app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(data.router, prefix="/api", tags=["data"])
app.include_router(qa.router, prefix="/api", tags=["qa"])


@app.get("/")
def root():
    return {"message": "研报智析 API", "version": "0.2.0"}


@app.get("/api/health")
def health():
    return {"status": "ok"}