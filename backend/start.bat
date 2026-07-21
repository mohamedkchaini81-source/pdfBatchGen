@echo off
REM Start the FastAPI backend server.
REM Uses "python -m uvicorn" to avoid PATH issues on Windows.
echo Starting PDF Batch Gen backend on http://localhost:8000 ...
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
