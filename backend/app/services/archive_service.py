"""
Archive service — ZIP creation and merged PDF assembly.
"""
import io
import zipfile
from pathlib import Path
from typing import Sequence

import pypdf


def create_zip(file_entries: Sequence[tuple[str, bytes]]) -> bytes:
    """
    Build a ZIP archive in memory.
    file_entries: list of (filename, pdf_bytes)
    Returns ZIP bytes.
    """
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for filename, data in file_entries:
            zf.writestr(filename, data)
    return buf.getvalue()


def create_merged_pdf(pdf_bytes_list: Sequence[bytes]) -> bytes:
    """
    Merge a list of single-page PDFs into one multi-page PDF.
    Equivalent to the pypdf merge logic in Flutter's pdf_generator.dart.
    """
    writer = pypdf.PdfWriter()
    for pdf_bytes in pdf_bytes_list:
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        for page in reader.pages:
            writer.add_page(page)
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()
