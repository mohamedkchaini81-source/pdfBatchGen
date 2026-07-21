"""
Pre-export validation — mirrors Flutter validation.dart.
"""
from typing import Optional
from app.models.text_field import RulerBox

MIN_BOX_W_PT = 12.0
MIN_BOX_H_PT = 8.0


def box_is_valid(ruler: RulerBox, page_w: float, page_h: float) -> bool:
    w = (ruler.right - ruler.left) * page_w
    h = (ruler.bottom - ruler.top) * page_h
    return w >= MIN_BOX_W_PT and h >= MIN_BOX_H_PT


def validate_export_request(
    has_template: bool,
    records_count: int,
    ruler: RulerBox,
    page_w: float,
    page_h: float,
) -> Optional[str]:
    """Return an error string if validation fails, else None."""
    if not has_template:
        return "No PDF template provided."
    if records_count == 0:
        return "No participant records provided."
    if not box_is_valid(ruler, page_w, page_h):
        return "Name ruler box is too small (min 12×8 pt)."
    return None
