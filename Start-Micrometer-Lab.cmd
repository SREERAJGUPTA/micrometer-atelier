@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py scripts\serve.py
) else (
  python scripts\serve.py
)
if errorlevel 1 (
  echo.
  echo Python 3 is required for this offline launcher.
  echo Alternatively run npm ci, npm run build, and npm run dev.
  pause
)
