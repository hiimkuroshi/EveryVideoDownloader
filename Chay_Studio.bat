@echo off
title yt-dlp Studio Pro Workstation
chcp 65001 >nul
cls

echo =======================================================================
echo              yt-dlp Studio Pro — Trạm Tải Đa Phương Tiện
echo =======================================================================
echo.

set PATH=%USERPROFILE%\.deno\bin;%PATH%

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Khong tim thay Node.js tren may tinh!
    echo Vui long cai dat Node.js tu https://nodejs.org
    pause
    exit /b 1
)

echo [1/2] Dang khoi dong Web Server tren cong 3000...
start "" cmd /c "node server.js"

timeout /t 2 /nobreak >nul

echo [2/2] Dang mo giao dien web tren trinh duyet...
start http://localhost:3000

echo.
echo =======================================================================
echo  Studio dang chay tai: http://localhost:3000
echo  Cua so nay co the dong lai bat ky luc nao.
echo =======================================================================
echo.
exit
