"""
PDF Generation Service — direct port of stamp_pdf.py logic into a
Python module (no subprocess needed, same pipeline).

Pipeline per participant:
  1. Read source PDF
  2. Detect Arabic / Latin
  3. Arabic reshape + BiDi
  4. Compute effective ruler (combined when role is empty)
  5. Binary-search best font size (20 iterations)
  6. ReportLab vector overlay
  7. pypdf merge_page
  8. Write output PDF
"""
import io
import math
from pathlib import Path
from typing import Optional

from reportlab.lib.colors import Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as rl_canvas
import pypdf

from app.models.text_field import RulerBox, TextFieldConfig, ExportSettings
from app.models.participant import Participant
from app.utils.arabic_text import contains_arabic, prepare_text


# ── Font registry (process-wide cache) ──────────────────────────────────────

_registered_fonts: dict[str, str] = {}


def register_font(path: Optional[Path]) -> str:
    """Register a TTF/OTF with ReportLab once; return the font name."""
    if not path or not path.is_file():
        return "Helvetica"
    key = str(path.resolve())
    if key in _registered_fonts:
        return _registered_fonts[key]
    name = f"F{len(_registered_fonts)}"
    try:
        pdfmetrics.registerFont(TTFont(name, str(path)))
        _registered_fonts[key] = name
        return name
    except Exception:
        return "Helvetica"


# ── Font-size binary search ──────────────────────────────────────────────────

def fit_size(
    text: str,
    font_name: str,
    box_w: float,
    box_h: float,
    max_pt: float,
    rotation_deg: float,
) -> float:
    """Return largest pt size that fits text inside box_w × box_h."""
    pad = min(8.0, max(2.0, min(box_w, box_h) * 0.05))
    aw  = max(1.0, box_w - pad * 2)
    ah  = max(1.0, box_h - pad * 2)
    rot = math.radians(rotation_deg)

    lo, hi = 2.0, float(max_pt)
    for _ in range(20):
        mid = (lo + hi) / 2
        try:
            tw = pdfmetrics.stringWidth(text, font_name, mid)
        except Exception:
            tw = len(text) * mid * 0.55
        th = mid * 1.2
        rw = abs(tw * math.cos(rot)) + abs(th * math.sin(rot))
        rh = abs(tw * math.sin(rot)) + abs(th * math.cos(rot))
        if rw <= aw and rh <= ah:
            lo = mid
        else:
            hi = mid
    return max(2.0, lo)


# ── Color helper ─────────────────────────────────────────────────────────────

def parse_color(hex_str: str) -> tuple[float, float, float]:
    h = hex_str.strip().lstrip("#")
    if len(h) == 3:
        h = h[0]*2 + h[1]*2 + h[2]*2
    if len(h) != 6:
        return (0.0, 0.0, 0.0)
    return (
        int(h[0:2], 16) / 255.0,
        int(h[2:4], 16) / 255.0,
        int(h[4:6], 16) / 255.0,
    )


# ── Combined ruler (empty-role expansion) ────────────────────────────────────

def combined_ruler(name_ruler: RulerBox, role_ruler: RulerBox) -> RulerBox:
    """Mirrors Flutter combinedNameRuler()."""
    return RulerBox(
        left   = min(name_ruler.left,   role_ruler.left),
        right  = max(name_ruler.right,  role_ruler.right),
        top    = min(name_ruler.top,    role_ruler.top),
        bottom = max(name_ruler.bottom, role_ruler.bottom),
    )


# ── Draw one text block onto ReportLab canvas ────────────────────────────────

def draw_block(
    c,
    text: str,
    font_name: str,
    pt: float,
    color_hex: str,
    box_x: float,
    box_y: float,
    box_w: float,
    box_h: float,
    rotation_deg: float,
    page_h: float,
) -> None:
    """
    box_x/y are in PDF points, top-left origin.
    ReportLab uses bottom-left origin — convert accordingly.
    """
    r, g, b = parse_color(color_hex)
    rl_y = page_h - box_y - box_h
    cx = box_x + box_w / 2.0
    cy = rl_y  + box_h / 2.0

    c.saveState()
    c.setFillColor(Color(r, g, b, 1))
    c.setFont(font_name, pt)

    if rotation_deg != 0:
        c.translate(cx, cy)
        c.rotate(rotation_deg)
        c.translate(-cx, -cy)

    try:
        tw = c.stringWidth(text, font_name, pt)
    except Exception:
        tw = len(text) * pt * 0.55

    tx = cx - tw / 2.0
    ty = cy - pt * 0.35
    c.drawString(tx, ty, text)
    c.restoreState()


# ── Stamp one PDF ─────────────────────────────────────────────────────────────

def stamp_pdf(
    template_bytes: bytes,
    participant: Participant,
    name_cfg: TextFieldConfig,
    role_cfg: TextFieldConfig,
    settings: ExportSettings,
    name_font_path: Optional[Path] = None,
    role_font_path: Optional[Path] = None,
) -> bytes:
    """
    Stamp name + role onto template_bytes and return new PDF bytes.
    Preserves 100% vector quality — no rasterisation.
    """
    page_w = settings.pageWidth
    page_h = settings.pageHeight
    pg_idx = settings.pageIndex

    name = participant.name
    role = participant.role

    # Fonts
    nf = register_font(name_font_path)
    rf = register_font(role_font_path) if role_font_path else nf

    # Arabic reshape + BiDi
    dn = prepare_text(name)
    dr = prepare_text(role) if role else ""

    # Effective name ruler: expand when role column exists but role is empty
    if settings.hasRoleColumn and not role:
        eff_name_ruler = combined_ruler(name_cfg.ruler, role_cfg.ruler)
    else:
        eff_name_ruler = name_cfg.ruler

    # Ruler → PDF points
    def to_box(ruler: RulerBox) -> dict:
        return {
            "x": ruler.left  * page_w,
            "y": ruler.top   * page_h,
            "w": (ruler.right  - ruler.left) * page_w,
            "h": (ruler.bottom - ruler.top)  * page_h,
        }

    nb = to_box(eff_name_ruler)
    rb = to_box(role_cfg.ruler)

    # Fit sizes
    ns = fit_size(dn, nf, nb["w"], nb["h"], name_cfg.maxFontSize, name_cfg.rotation)
    rs = fit_size(dr, rf, rb["w"], rb["h"], role_cfg.maxFontSize, role_cfg.rotation) if dr else 0.0

    # Open template and copy all pages to writer
    reader = pypdf.PdfReader(io.BytesIO(template_bytes))
    writer = pypdf.PdfWriter()
    for page in reader.pages:
        writer.add_page(page)

    # Determine actual page size from the target page
    target_page = writer.pages[pg_idx]
    pw = float(target_page.mediabox.width)
    ph = float(target_page.mediabox.height)

    # Build ReportLab overlay canvas at the same page size
    buf = io.BytesIO()
    c   = rl_canvas.Canvas(buf, pagesize=(pw, ph))

    draw_block(c, dn, nf, ns, name_cfg.colorHex,
               nb["x"], nb["y"], nb["w"], nb["h"], name_cfg.rotation, ph)

    if dr and rs > 0:
        draw_block(c, dr, rf, rs, role_cfg.colorHex,
                   rb["x"], rb["y"], rb["w"], rb["h"], role_cfg.rotation, ph)

    c.save()
    buf.seek(0)

    # Merge vector overlay onto the target page
    overlay_page = pypdf.PdfReader(buf).pages[0]
    writer.pages[pg_idx].merge_page(overlay_page)

    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()
