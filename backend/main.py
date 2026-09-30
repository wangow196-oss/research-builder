"""研报智析 Backend — FastAPI Server"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import files, analyze, data

app = FastAPI(
    title="研报智析 API",
    description="投研新人的智能研报学习工具后端",
    version="0.1.0",
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(files.router, prefix="/api", tags=["files"])
app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(data.router, prefix="/api", tags=["data"])


@app.get("/")
def root():
    return {"message": "研报智析 API", "version": "0.1.0"}


@app.get("/api/health")
def health():
    return {"status": "ok"}
