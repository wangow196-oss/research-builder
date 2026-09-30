"""AKShare 数据客户端"""

import akshare as ak
import pandas as pd


def get_stock_daily(code: str, period: str = "daily", days: int = 250) -> pd.DataFrame:
    """获取个股日线数据"""
    # AKShare uses code like "600519" for Shanghai, "000001" for Shenzhen
    df = ak.stock_zh_a_hist(
        symbol=code,
        period=period,
        adjust="qfq",
    )
    # Return last N days
    return df.tail(days)


def get_stock_info(code: str) -> dict:
    """获取个股基本信息"""
    try:
        df = ak.stock_individual_info_em(symbol=code)
        info = {}
        for _, row in df.iterrows():
            info[row.iloc[0]] = row.iloc[1]
        return info
    except Exception:
        return {"code": code, "error": "Unable to fetch info"}


def search_stock(keyword: str) -> list[dict]:
    """搜索标的"""
    try:
        df = ak.stock_zh_a_spot_em()
        # Search by name or code
        mask = df["名称"].str.contains(keyword, na=False) | df["代码"].str.contains(
            keyword, na=False
        )
        results = df[mask].head(10)
        return results[["代码", "名称", "最新价", "涨跌幅"]].to_dict(orient="records")
    except Exception:
        return []
