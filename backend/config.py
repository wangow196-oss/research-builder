"""环境变量配置"""

import os

# 加载 .env.local（本地开发用）
_env_local = os.path.join(os.path.dirname(__file__), ".env.local")
if os.path.exists(_env_local):
    with open(_env_local, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip())

# API 配置
API_BASE_URL = os.environ.get("API_BASE_URL", "http://model.mify.ai.srv/anthropic")
API_KEY = os.environ.get("API_KEY", os.environ.get("MIMO_API_KEY", os.environ.get("ANTHROPIC_API_KEY", "")))
API_MODEL = os.environ.get("API_MODEL", os.environ.get("MIMO_MODEL", "xiaomi/mimo-v2.5-pro"))

# 服务配置
UPLOAD_DIR = os.environ.get("UPLOAD_DIR", os.path.join(os.path.dirname(__file__), "data", "uploads"))
CHROMA_DIR = os.environ.get("CHROMA_DIR", os.path.join(os.path.dirname(__file__), "data", "chroma"))
DB_PATH = os.environ.get("DB_PATH", os.path.join(os.path.dirname(__file__), "data", "reportmind.db"))

# CORS
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# 确保数据目录存在
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)