@echo off
REM Install all Python dependencies.
REM If pydantic-core fails to build, this script sets the required env var.
echo Installing backend dependencies...
set PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1
python -m pip install -r requirements.txt
echo.
echo Done. Run start.bat to launch the server.
pause
