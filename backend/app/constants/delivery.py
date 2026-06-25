"""
交付双维常量（空间 × 形式）

业务含义：客户在 booking 第一屏选完策划师后，
  - 先选交付空间（线上 / 到店 / 上门）
  - 再选交付形式（文档交付 / 谈话交付）
两维交叉，appointment 表存为 delivery_space + delivery_form 两个字段。

前端对应：jxmapk/frontend/src/lib/delivery.ts
  后端改了这里必须同步改前端 const，反之亦然。
"""
from enum import Enum


# ==================== 交付空间 ====================

class DeliverySpace(str, Enum):
    """交付空间：客户与策划师在哪个空间/媒介完成服务"""

    ONLINE = "online"        # 线上（视频/语音/消息）
    ONSITE = "onsite"        # 到店（客户到工作室）
    HOME = "home"            # 上门（策划师到客户指定地点）


SPACE_LABELS: dict[str, str] = {
    DeliverySpace.ONLINE.value: "线上",
    DeliverySpace.ONSITE.value: "到店",
    DeliverySpace.HOME.value: "上门",
}


# ==================== 交付形式 ====================

class DeliveryForm(str, Enum):
    """交付形式：服务成果以什么形式给到客户"""

    DOCUMENT = "document"            # 文档交付（报告/方案/命名清单等书面产出）
    CONVERSATION = "conversation"    # 谈话交付（线上/到店/上门当面沟通）


FORM_LABELS: dict[str, str] = {
    DeliveryForm.DOCUMENT.value: "文档",
    DeliveryForm.CONVERSATION.value: "谈话",
}


# ==================== 校验辅助 ====================

def is_valid_space(value: str | None) -> bool:
    """校验 delivery_space 字段值合法性（None 视为合法，可空字段）"""
    if value is None:
        return True
    return value in SPACE_LABELS


def is_valid_form(value: str | None) -> bool:
    """校验 delivery_form 字段值合法性（None 视为合法，可空字段）"""
    if value is None:
        return True
    return value in FORM_LABELS
