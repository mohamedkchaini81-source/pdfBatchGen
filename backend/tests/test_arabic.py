"""Tests for Arabic detection and text preparation."""
import pytest
from app.utils.arabic_text import contains_arabic, prepare_text


def test_arabic_detection_positive():
    assert contains_arabic("أحمد الفقي") is True
    assert contains_arabic("سارة") is True


def test_arabic_detection_negative():
    assert contains_arabic("Ahmed Feki") is False
    assert contains_arabic("Sara Ayadi") is False
    assert contains_arabic("") is False


def test_arabic_detection_mixed():
    assert contains_arabic("Ahmed أحمد") is True


def test_prepare_text_latin():
    assert prepare_text("Hello") == "Hello"


def test_prepare_text_empty():
    assert prepare_text("") == ""


def test_prepare_text_arabic_does_not_crash():
    result = prepare_text("أحمد")
    assert isinstance(result, str)
    assert len(result) > 0
