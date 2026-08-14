@echo off
title EveryVideoDownloader — Workstation (Powered by yt-dlp)
chcp 65001 >nul

:: Chuyen den dung thu muc chua file bat nay
cd /d "%~dp0"

cls

set PATH=%USERPROFILE%\.deno\bin;%PATH%

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo =======================================================================
    echo  [!] CANH BAO: Khong tim thay Node.js tren may tinh cua ban!
    echo =======================================================================
    echo  EveryVideoDownloader can Node.js de chay giao dien web.
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
call node setup.js

:: Tu dong mo trinh duyet sau 1.5 giay
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

echo =======================================================================
echo  🌐 DANG CHAY SERVER TAI: http://localhost:3000
echo  (Trinh duyet se tu dong mo len trong giay lat)
echo  De tat server, ban chi can dong cua so nay lai.
echo =======================================================================
echo.

:: Chay Node Server truc tiep trong cua so nay de hien thi log thoi gian thuc
node server.js

pause
