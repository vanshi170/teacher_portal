@echo off
title Student QR Scanner (Port 5173)
cd /d "%~dp0"
echo =======================================================
echo   Student QR Scanner - Symbiosis Institute of Tech
echo =======================================================
echo.
echo Starting Student Scanner on http://localhost:5173...
call npm.cmd run dev
pause
