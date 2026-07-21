"""
Filename sanitisation — exact port of Flutter sanitizeFilename().
"""
import re


def sanitize_filename(name: str) -> str:
    """Remove unsafe characters and truncate to 120 chars."""
    cleaned = re.sub(r'[<>:"/\\|?*\x00-\x1F]', "_", name)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    if not cleaned:
        return "certificate"
    return cleaned[:120]


def build_filename(index: int, name: str, used: dict[str, int]) -> str:
    """Return e.g. '001-Ahmed Feki.pdf' with duplicate suffix handling."""
    base  = sanitize_filename(name)
    count = used.get(base, 0) + 1
    used[base] = count
    suffix = f"-{count}" if count > 1 else ""
    num    = str(index + 1).zfill(3)
    return f"{num}-{base}{suffix}.pdf"
