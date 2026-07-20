@echo off
echo Starting PDF Batch Gen development servers...
echo.

REM Start backend in a new window
start "PDF Batch Gen - Backend" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Wait 2 seconds for backend to initialise
timeout /t 2 /nobreak >nul

REM Start frontend in a new window
start "PDF Batch Gen - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both servers starting in separate windows.
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/api/docs
echo.
pause
