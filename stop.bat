@echo off
title Stop Co-Fleeter
color 0c
echo ===================================================
echo   Stopping Co-Fleeter Application
echo   (Targeting Ports 3000 & 8000)
echo ===================================================
echo.

:: 1. Attempt graceful shutdown first
echo [INFO] Sending graceful shutdown signal to Backend...
curl -X POST http://localhost:8000/api/system/shutdown >nul 2>&1
timeout /t 3 /nobreak >nul

set found=0

:: Kill process on Port 3000 (Frontend)
call :KillPort 3000

:: Kill process on Port 8000 (Backend)
call :KillPort 8000

if %found% equ 0 (
    echo.
    echo [INFO] No running processes found on ports 3000 or 8000.
) else (
    echo.
    echo [SUCCESS] Co-Fleeter processes stopped.
)

echo.
echo You can close this window now.
pause
goto :eof

:KillPort
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R ":%1\>" ^| findstr "LISTENING"') do (
    echo [KILL] Cleaning up port %1 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
    set found=1
)
goto :eof
