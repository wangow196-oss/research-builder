"""AI 分析服务 — 8 模块结构化分析"""

import os
import json
from pydantic import BaseModel
from config import API_BASE_URL, API_KEY, API_MODEL


# ==================== 数据模型 ====================


class ResearchLayer(BaseModel):
    level: str = ""
    question: str = ""
    method: str = ""
    chapter: str = ""


class ResearchApproach(BaseModel):
    layers: list[ResearchLayer] = []
    highlights: list[str] = []


class TechModule(BaseModel):
    name: str = ""
    description: str = ""
    keyData: str = ""


class IndicatorItem(BaseModel):
    name: str = ""
    value: str = ""
    range: str = ""
    direction: str = ""


class IndicatorCategory(BaseModel):
    category: str = ""
    items: list[IndicatorItem] = []


class ChartInfo(BaseModel):
    name: str = ""
    question: str = ""
    keyInfo: str = ""


class Judgment(BaseModel):
    confirmSignal: str = ""
    falsification: str = ""
    trackingPoints: list[str] = []


class AnalysisResult(BaseModel):
    # 基本信息
    title: str = "未知"
    institution: str = ""
    author: str = ""
    date: str = ""
    rating: str = ""
    # 8 大模块（全部可选，模型可能不返回所有字段）
    oneLiner: str = ""
    researchApproach: ResearchApproach = ResearchApproach(layers=[], highlights=[])
    chapterTree: str = ""
    techModules: list[TechModule] = []
    indicators: list[IndicatorCategory] = []
    charts: list[ChartInfo] = []
    judgment: Judgment = Judgment(confirmSignal="", falsification="", trackingPoints=[])
    reusable: list[str] = []
    limitations: list[str] = []


# ==================== 系统提示词 ====================

ANALYSIS_PROMPT = """你是一位资深投研分析师，擅长拆解券商研报的研究方法论。

你的任务是深度解析研报内容，输出严格的 JSON 格式分析结果。你需要从研报中提炼出8个维度的信息。

## 输出格式（严格 JSON）

{
  "title": "研报标题",
  "institution": "券商名称",
  "author": "作者姓名（多人用顿号分隔）",
  "date": "发布日期 YYYY-MM-DD",
  "rating": "评级（如：买入/增持/标配/无）",

  "oneLiner": "一句话总结研报核心逻辑，30-80字，要有判断、有数据、有结论",

  "researchApproach": {
    "layers": [
      {
        "level": "第①层：XXX",
        "question": "这一层要回答什么问题",
        "method": "用了什么方法/数据/模型",
        "chapter": "对应章节"
      }
    ],
    "highlights": [
      "思路精髓1：具体说明",
      "思路精髓2：具体说明"
    ]
  },

  "chapterTree": "用树形文本格式展示章节结构，每行一个节点，用缩进和 ├─ └─ 表示层级",

  "techModules": [
    {
      "name": "模块A｜名称",
      "description": "模块做什么",
      "keyData": "关键数据和结论"
    }
  ],

  "indicators": [
    {
      "category": "分类名称（如：价格类、利率类）",
      "items": [
        {
          "name": "指标名称",
          "value": "报告中的具体读数",
          "range": "区间/阈值/历史位置",
          "direction": "正向++/反向++/中性+"
        }
      ]
    }
  ],

  "charts": [
    {
      "name": "图表编号和标题",
      "question": "这张图回答什么问题",
      "keyInfo": "图表中的关键信息/趋势/异常值"
    }
  ],

  "judgment": {
    "confirmSignal": "确认研报判断正确的信号是什么",
    "falsification": "什么条件下研报判断会被证伪",
    "trackingPoints": ["后续需跟踪的数据点1", "后续需跟踪的数据点2"]
  },

  "reusable": [
    "可复用的分析方法/框架/工具1",
    "可复用的分析方法/框架/工具2"
  ],

  "limitations": [
    "研报的局限性/假设风险1",
    "研报的局限性/假设风险2"
  ]
}

## 分析要求

1. **oneLiner**：必须包含时间维度判断、核心矛盾、和具体结论，不能是泛泛的总结
2. **researchApproach.layers**：识别研报的递进逻辑，通常是 2-4 层，每层回答一个递进问题
3. **chapterTree**：用严格的树形文本格式，展示章节间的逻辑关系
4. **techModules**：提取研报中的核心分析模块（如：周期定位、因子框架、实证检验等）
5. **indicators**：提取所有量化指标，按类别分组，标注方向和权重
6. **charts**：识别研报中的图表，说明每张图的分析目的
7. **judgment**：提炼研报的可证伪条件和跟踪要点
8. **reusable**：提取可跨报告复用的分析方法论
9. **limitations**：指出研报的方法论局限、数据局限、逻辑漏洞

## 方向标注规则
- 正向+++: 强烈利多
- 正向++: 中度利多
- 正向+: 轻度利多
- 反向+++: 强烈利空
- 反向++: 中度利空
- 反向+: 轻度利空
- 中性+: 影响不大

如果研报中没有明确提到某个维度，用合理的推断填充，但标注"（推断）"。

只输出 JSON，不要输出其他内容。"""


# ==================== 分析函数 ====================


async def analyze_report(
    content: str, publish_date: str | None = None
) -> AnalysisResult:
    """调用 Mimo API 做 8 模块结构化分析。

    Args:
        content: 研报 Markdown 内容
        publish_date: 研报发布日期（可选，用于补全）

    Returns:
        AnalysisResult 包含 8 大模块的结构化分析结果
    """
    api_key = API_KEY

    if not api_key:
        return _get_mock_result(publish_date)

    try:
        import anthropic

        client = anthropic.Anthropic(
            api_key=api_key,
            base_url=API_BASE_URL,
        )

        # 截断到 60000 字符
        max_chars = 60000
        if len(content) > max_chars:
            content = content[:max_chars] + "\n\n[...内容已截断，以上为研报前部分内容...]"

        user_message = f"请深度分析以下研报内容，输出严格的 JSON 格式：\n\n{content}"
        if publish_date:
            user_message += f"\n\n研报发布日期：{publish_date}"

        response = client.messages.create(
            model=API_MODEL,
            system=ANALYSIS_PROMPT,
            messages=[
                {"role": "user", "content": user_message},
            ],
            max_tokens=16000,
            temperature=0.3,
        )

        # 提取文本内容（跳过 thinking 块）
        response_text = ""
        for block in response.content:
            block_type = getattr(block, "type", "")
            if block_type == "text" and hasattr(block, "text"):
                response_text = block.text
                break

        if not response_text:
            for block in response.content:
                if hasattr(block, "text"):
                    response_text = block.text
                    break

        # 解析 JSON 响应
        data = None

        # 方法1: 直接解析
        try:
            data = json.loads(response_text)
        except (json.JSONDecodeError, ValueError):
            pass

        # 方法2: 从 code fence 中提取
        if not data:
            data = _extract_json_from_text(response_text)

        # 方法3: 找第一个 { 和最后一个 }
        if not data:
            first = response_text.find("{")
            last = response_text.rfind("}")
            if first != -1 and last > first:
                try:
                    data = json.loads(response_text[first : last + 1])
                except (json.JSONDecodeError, ValueError):
                    pass

        # 如果所有方法都失败，返回原始文本
        if not data:
            return _parse_unstructured_response(response_text, publish_date)

        # 补全日期
        if publish_date and not data.get("date"):
            data["date"] = publish_date

        return AnalysisResult(**data)

    except (json.JSONDecodeError, TypeError):
        # Fallback: 尝试从文本中提取 JSON
        return _parse_unstructured_response(response_text, publish_date)
    except Exception as e:
        return AnalysisResult(
            title=f"分析失败：{str(e)}",
            institution="",
            author="",
            date=publish_date or "",
            rating="",
            oneLiner="分析过程中出现错误，请检查 MIMO_API_KEY 是否正确设置，然后重试。",
            researchApproach=ResearchApproach(layers=[], highlights=[]),
            chapterTree="",
            techModules=[],
            indicators=[],
            charts=[],
            judgment=Judgment(
                confirmSignal="", falsification="", trackingPoints=[]
            ),
            reusable=[],
            limitations=[],
        )


def _extract_json_from_text(text: str) -> dict | None:
    """从文本中提取 JSON 对象，支持 code fence 和嵌套结构。"""
    import re

    # 策略1: 从 markdown code fence 中提取（支持嵌套 JSON）
    fence_match = re.search(r"```(?:json)?\s*\n?(.*?)\n?\s*```", text, re.DOTALL)
    if fence_match:
        try:
            return json.loads(fence_match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # 策略2: 找到第一个 { 和最后一个 }，提取完整 JSON
    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace != -1 and last_brace > first_brace:
        candidate = text[first_brace : last_brace + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

    # 策略3: 用 brace counting 找到第一个完整 JSON 对象
    if first_brace != -1:
        depth = 0
        for i in range(first_brace, len(text)):
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
                if depth == 0:
                    candidate = text[first_brace : i + 1]
                    try:
                        return json.loads(candidate)
                    except json.JSONDecodeError:
                        break

    return None


def _parse_unstructured_response(
    text: str, publish_date: str | None
) -> AnalysisResult:
    """Fallback: 当模型返回非标准 JSON 时的解析策略。"""

    data = _extract_json_from_text(text)
    if data:
        if publish_date and not data.get("date"):
            data["date"] = publish_date
        try:
            return AnalysisResult(**data)
        except Exception:
            pass

    # 最后手段: 返回原始文本
    return AnalysisResult(
        title="解析失败 — 原始回复",
        institution="",
        author="",
        date=publish_date or "",
        rating="",
        oneLiner=text[:200] + "..." if len(text) > 200 else text,
        researchApproach=ResearchApproach(layers=[], highlights=[]),
        chapterTree="",
        techModules=[],
        indicators=[],
        charts=[],
        judgment=Judgment(confirmSignal="", falsification="", trackingPoints=[]),
        reusable=[],
        limitations=[],
    )


def _get_mock_result(publish_date: str | None = None) -> AnalysisResult:
    """当没有 API Key 时返回 Mock 数据。"""
    return AnalysisResult(
        title="大周期系列黄金定价研究（一）：拆解黄金定价逻辑与美元美债体系",
        institution="东海证券",
        author="张季恺、谢建斌",
        date=publish_date or "2026-09-10",
        rating="标配（有色金属）",
        oneLiner="「短期看利率、中期看央行」的换挡期已经到来——短期定价锚（10年期TIPS实际利率）仍在2.39%~2.45%高位构成压制，但拐点信号正在积累；中期定价锚（全球央行购金）在2026Q2以288.9吨创同期纪录回归。结论：逢低分批买入。",
        researchApproach=ResearchApproach(
            layers=[
                ResearchLayer(
                    level="第①层：周期与统计",
                    question="这轮跌是不是牛市终结？",
                    method="1971年以来牛熊周期统计 + 牛市内部回撤分布统计",
                    chapter="第1章",
                ),
                ResearchLayer(
                    level="第②层：基本面七因子",
                    question="基本面变了吗？变在哪？",
                    method="逐因子定性+定量复盘 → 13因子加权表",
                    chapter="第2章",
                ),
                ResearchLayer(
                    level="第③层：货币体系与实证",
                    question="支撑金价的对手方出了什么问题？",
                    method="三张资产负债表 + 2SLS/Johansen协整VECM实证",
                    chapter="第3~6章",
                ),
            ],
            highlights=[
                "用统计分布而不是用观点判断「底」：把本轮回撤放进1971年以来的回撤分布里看分位数",
                "区分「短期锚」和「中期锚」，并对权重排序：实际利率与央行购金同为最高权重",
                "对「常识性定价假设」做实证攻击：用一整章检验「海外买美债压低收益率」是否还成立",
            ],
        ),
        chapterTree="第1章 此轮金价调整基本到位 → 周期定位\n  ├─ 回撤阈值统计（表1）+ 牛熊统计（表2）\n  └─ 长期收益率分位（图2）\n第2章 黄金基本面的变与不变 → 七因子体检\n  ├─ 2.1 实际利率与机会成本\n  ├─ 2.2 美元与流动性\n  ├─ 2.3 央行购金与去美元化（核心）\n  ├─ 2.4 投机交易因素\n  ├─ 2.5 实物供需\n  ├─ 2.6 地缘与中国因素\n  └─ 2.7 → 汇总为【表4 13因子+方向+权重】\n第3章 美元—美债体系拆解\n第4章 海外需求对美债收益率影响的失效（实证核心）\n第5章 美元—美债体系的脆弱点与滑坡\n第6章 黄金价值锚定属性强化\n第7章 投资建议：逢低分批买入\n第8章 风险提示",
        techModules=[
            TechModule(
                name="模块A｜周期定位",
                description="回撤阈值 + 牛熊统计 + 牛市内部回调分布",
                keyData="回撤阈值表：5%级29次/均值16%；10%级11次/均值30%；20%级8次/均值36%。本轮日度最大回撤−29.6%≈历史中位数29%。",
            ),
            TechModule(
                name="模块B｜基本面七因子框架",
                description="七个维度逐项体检 → 汇总为13因子加权表",
                keyData="13因子表：实际利率(反向+++)、央行购金(正向+++)、政策利率(反向++)、通胀(正向++)、美元(反向++)、流动性(正向++)、财政信用(正向++)、ETF(正向++)、地缘(正向++)、期货(正向+)、供需(中性+)、制造业(反向+)、中美利差(正向+)。",
            ),
        ],
        indicators=[
            IndicatorCategory(
                category="价格与周期类（判断牛市是否终结）",
                items=[
                    IndicatorItem(
                        name="伦敦金现",
                        value="盘中低至3,942美元/盎司",
                        range="峰值回撤约30%",
                        direction="调整基本到位",
                    ),
                ],
            ),
            IndicatorCategory(
                category="利率与通胀类（短期定价锚）",
                items=[
                    IndicatorItem(
                        name="10Y TIPS实际收益率",
                        value="2.39%~2.45%",
                        range="2023年以来高位",
                        direction="反向+++",
                    ),
                ],
            ),
        ],
        charts=[
            ChartInfo(
                name="图1 伦敦金现走势",
                question="1971年以来牛熊在哪？",
                keyInfo="标蓝牛市、标灰熊市",
            ),
            ChartInfo(
                name="表4 13因子判断表",
                question="谁多谁空、谁权重高？",
                keyInfo="全文框架的仪表盘",
            ),
        ],
        judgment=Judgment(
            confirmSignal="实际利率趋势性回落 + 金价收复前高",
            falsification="通胀反复触发加息落地、央行购金再度放缓、或ETF回流中断",
            trackingPoints=[
                "8月及三季度美国CPI与9月FOMC路径",
                "2026Q3全球央行购金节奏",
                "ETF与期货多头回流的持续性",
                "美国财政供给与长债回购的实际效果",
            ],
        ),
        reusable=[
            "回撤阈值分布表——把「跌了多少」转成「处于历史第几档分位」",
            "13因子方向×权重表——一个可每周更新的「黄金仪表盘」",
        ],
        limitations=[
            "实证结论是「无法识别」而非「证伪存在负向关系」——旧弹性不可外推",
            "份额分解与再配置弹性是静态测算——不考虑大额订单对市场价格的影响",
        ],
    )