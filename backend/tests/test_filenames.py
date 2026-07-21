"""Tests for filename sanitisation — mirrors Flutter behavior exactly."""
import pytest
from app.utils.filenames import sanitize_filename, build_filename


def test_sanitize_normal():
    assert sanitize_filename("Ahmed Feki") == "Ahmed Feki"


def test_sanitize_removes_forbidden():
    assert sanitize_filename('file<name>:bad/path') == "file_name__bad_path"


def test_sanitize_empty():
    assert sanitize_filename("") == "certificate"
    assert sanitize_filename("   ") == "certificate"


def test_sanitize_truncates():
    long = "A" * 200
    assert len(sanitize_filename(long)) == 120


def test_sanitize_arabic():
    result = sanitize_filename("أحمد الفقي")
    assert "أحمد" in result


def test_build_filename_basic():
    used: dict = {}
    assert build_filename(0, "Ahmed", used) == "001-Ahmed.pdf"


def test_build_filename_duplicate():
    used: dict = {}
    build_filename(0, "Ahmed", used)
    result = build_filename(1, "Ahmed", used)
    assert result == "002-Ahmed-2.pdf"


def test_build_filename_sequence():
    used: dict = {}
    f1 = build_filename(0, "Sara", used)
    f2 = build_filename(1, "Sara", used)
    f3 = build_filename(2, "Sara", used)
    assert f1 == "001-Sara.pdf"
    assert f2 == "002-Sara-2.pdf"
    assert f3 == "003-Sara-3.pdf"
