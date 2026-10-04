@echo off
title AI Product Research & CRO Lab
cd /d "%~dp0"
echo.
echo ============================================
echo   AI Product Research & CRO Lab
echo   Starting server... open http://localhost:3000
echo   Press Ctrl+C in this window to stop.
echo ============================================
echo.

rem Open the browser after a short delay (server takes a moment to boot)
start "" cmd /c "timeout /t 6 /nobreak >nul && start http://localhost:3000"

call node node_modules/next/dist/bin/next dev

pause
