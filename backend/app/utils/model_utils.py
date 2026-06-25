"""通用 Model 工具函数"""


def update_if_not_none(obj, **kwargs) -> None:
    """批量更新非 None 字段

    Args:
        obj: 要更新的对象
        **kwargs: 要更新的字段名=值对，仅更新值不为 None 的字段
    """
    for key, value in kwargs.items():
        if value is not None:
            setattr(obj, key, value)
