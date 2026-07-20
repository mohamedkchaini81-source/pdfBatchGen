"""
Arabic text utilities — mirrors Flutter arabic_reshaper.dart logic.
Used only in the PDF generation pipeline (export).
The frontend handles direction/alignment for live preview.
"""
import re

ARABIC_PATTERN = re.compile(
    r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]"
)


def contains_arabic(text: str) -> bool:
    return bool(ARABIC_PATTERN.search(text))


def prepare_text(text: str) -> str:
    """
    Reshape Arabic glyphs and apply BiDi visual order.
    Falls back to original text if libraries are unavailable.
    """
    if not text or not contains_arabic(text):
        return text
    try:
        from arabic_reshaper import reshape          # type: ignore
        from bidi.algorithm import get_display       # type: ignore
        return get_display(reshape(text))
    except ImportError:
        return text
