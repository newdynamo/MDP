@echo off
title Stop Co-Fleeter
color 0c
echo ===================================================
echo   Stopping Co-Fleeter Application
echo ===================================================
echo.
echo Terminating all Node.js processes...
taskkill /F /IM node.exe /T 2>nul
if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Co-Fleeter has been stopped successfully.
) else (
    echo.
    echo [INFO] No running Node.js processes found.
)
echo.
echo You can close this window now.
pause
