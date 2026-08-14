@echo off
title yt-dlp Studio Pro Workstation
chcp 65001 >nul
cls

set PATH=%USERPROFILE%\.deno\bin;%PATH%

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo =======================================================================
    echo  [!] CANH BAO: Khong tim thay Node.js tren may tinh cua ban!
    echo =======================================================================
    echo  yt-dlp Studio Pro can Node.js de chay giao dien web.
    echo  Dang mo trang tai Node.js (https://nodejs.org)...
    echo.
    start https://nodejs.org
    pause
    exit /b 1
)

:: Neu chua co node_modules, tu dong cai dat npm
if not exist node_modules (
    echo [Khoi tao] Dang cai dat thu vien ban dau (npm install)...
    call npm install
)

:: Chay trinh kiem tra he thong & tu dong tai cac cong cu thieu (yt-dlp, ffmpeg, download dir)
node setup.js

:: Khoi dong Web Server tren cong 3000
echo Dang khoi dong Web Server tren cong 3000...
start "" cmd /c "node server.js"

timeout /t 2 /nobreak >nul

:: Tu dong mo trinh duyet vao giao dien Studio
echo Dang mo giao dien Studio tren trinh duyet...
start http://localhost:3000

echo.
echo =======================================================================
echo  Studio dang chay tai: http://localhost:3000
echo  Cua so nay co the dong lai bat ky luc nao.
echo =======================================================================
echo.
exit
