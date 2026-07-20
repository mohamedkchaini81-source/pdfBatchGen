"""
Tests for the PDF generation service.
Uses a minimal in-memory PDF as template.
"""
import io
import pytest
import pypdf

from app.models.participant import Participant
from app.models.text_field import TextFieldConfig, ExportSettings, RulerBox
from app.services.pdf_generation_service import stamp_pdf


def _make_blank_pdf() -> bytes:
    """Create a minimal single-page A4 PDF in memory."""
    from reportlab.pdfgen import canvas as rl_canvas
    buf = io.BytesIO()
    c = rl_canvas.Canvas(buf, pagesize=(595, 842))
    c.drawString(10, 820, " ")   # force at least one content item
    c.showPage()                 # commit the page before save
    c.save()
    return buf.getvalue()


NAME_CFG = TextFieldConfig(
    ruler=RulerBox(left=0.18, right=0.82, top=0.43, bottom=0.58),
    maxFontSize=48,
    colorHex="#111111",
    rotation=0,
    fontWeight=400,
    fontStyle="normal",
)

ROLE_CFG = TextFieldConfig(
    ruler=RulerBox(left=0.18, right=0.82, top=0.60, bottom=0.70),
    maxFontSize=32,
    colorHex="#444444",
    rotation=0,
    fontWeight=400,
    fontStyle="normal",
)

SETTINGS = ExportSettings(
    textMode="auto",
    exportMethod="individual",
    pageIndex=0,
    pageWidth=595,
    pageHeight=842,
    hasRoleColumn=True,
    pdfFileName="test.pdf",
)


def test_stamp_english_name():
    template = _make_blank_pdf()
    participant = Participant(id="1", name="Ahmed Feki", role="Manager")
    result = stamp_pdf(template, participant, NAME_CFG, ROLE_CFG, SETTINGS)
    assert isinstance(result, bytes)
    assert len(result) > 0
    # Verify it's a valid PDF
    reader = pypdf.PdfReader(io.BytesIO(result))
    assert len(reader.pages) == 1


def test_stamp_arabic_name():
    template = _make_blank_pdf()
    participant = Participant(id="2", name="أحمد الفقي", role="مدير")
    result = stamp_pdf(template, participant, NAME_CFG, ROLE_CFG, SETTINGS)
    reader = pypdf.PdfReader(io.BytesIO(result))
    assert len(reader.pages) == 1


def test_stamp_empty_role():
    template = _make_blank_pdf()
    participant = Participant(id="3", name="Sara", role="")
    result = stamp_pdf(template, participant, NAME_CFG, ROLE_CFG, SETTINGS)
    reader = pypdf.PdfReader(io.BytesIO(result))
    assert len(reader.pages) == 1


def test_stamp_with_rotation():
    cfg = TextFieldConfig(
        ruler=RulerBox(left=0.18, right=0.82, top=0.43, bottom=0.58),
        maxFontSize=48, colorHex="#000000", rotation=30,
        fontWeight=400, fontStyle="normal",
    )
    template    = _make_blank_pdf()
    participant = Participant(id="4", name="Rotated Name", role="")
    result      = stamp_pdf(template, participant, cfg, ROLE_CFG, SETTINGS)
    assert len(result) > 0
