@echo off
cd /d "%~dp0"
title EveryVideoDownloader - Workstation [Powered by yt-dlp]
chcp 65001 >nul

set "PATH=%USERPROFILE%\.deno\bin;%PATH%"

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo =======================================================================
    echo  [!] CANH BAO: Khong tim thay Node.js tren may tinh cua ban!
    echo =======================================================================
    echo  EveryVideoDownloader can Node.js de chay giao dien web.
    echo  Dang mo trang tai Node.js: https://nodejs.org
    echo.
    start https://nodejs.org
    pause
    exit /b 1
)

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    where py >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo =======================================================================
        echo  [!] CANH BAO: Khong tim thay Python tren may tinh cua ban!
        echo =======================================================================
        echo  EveryVideoDownloader can Python de chay engine ma nguon yt-dlp.
        echo  Dang mo trang tai Python: https://www.python.org
        echo.
        start https://www.python.org
        pause
        exit /b 1
    )
)

if not exist node_modules (
    echo [Khoi tao] Dang cai dat thu vien ban dau: npm install...
    call npm install
)

call node setup.js

echo =======================================================================
echo  DANG CHAY SERVER TAI: http://localhost:3000
echo  Trinh duyet dang tu dong mo...
echo  De tat server, ban chi can dong cua so nay lai.
echo =======================================================================
echo.

start http://localhost:3000

node server.js

pause
