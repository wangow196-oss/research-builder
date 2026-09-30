"""数据 API — AKShare 数据接口"""

from fastapi import APIRouter, HTTPException
from services.akshare_client import (
    get_stock_daily,
    get_stock_info,
    search_stock,
)

router = APIRouter()


@router.get("/stock/{code}")
def stock_data(code: str, period: str = "daily", days: int = 250):
    """获取个股行情数据"""
    try:
        df = get_stock_daily(code, period, days)
        return {
            "code": code,
            "period": period,
            "data": df.to_dict(orient="records"),
        }
    except Exception as e:
        raise HTTPException(500, f"Failed to fetch stock data: {str(e)}")


@router.get("/stock/{code}/info")
def stock_info(code: str):
    """获取个股基本信息"""
    try:
        info = get_stock_info(code)
        return info
    except Exception as e:
        raise HTTPException(500, f"Failed to fetch stock info: {str(e)}")


@router.get("/search")
def search(q: str):
    """搜索标的"""
    try:
        results = search_stock(q)
        return {"results": results}
    except Exception as e:
        raise HTTPException(500, f"Search failed: {str(e)}")
