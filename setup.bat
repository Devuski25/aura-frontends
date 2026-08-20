@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

title AURA-Dx - Frontend Demo Setup

echo ============================================
echo   AURA-Dx - Frontend Demo Setup
echo ============================================
echo.

REM ---- 1. Check Node.js is installed ----
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is NOT installed on this computer.
    echo.
    echo To fix: open https://nodejs.org and download the LTS version
    echo (v20 or newer). Install it, close this window, then run
    echo setup.bat again.
    echo.
    pause
    exit /b 1
)

REM ---- 2. Check Node version (need v20.19+ or v22.12+) ----
for /f "tokens=1,2 delims=." %%a in ('node -p "process.versions.node"') do (
    set NODE_MAJOR=%%a
    set NODE_MINOR=%%b
)

if !NODE_MAJOR! LSS 20 (
    echo [ERROR] Node.js v!NODE_MAJOR! is too old. AURA-Dx needs v20.19 or newer.
    echo.
    echo To fix: open https://nodejs.org and install the latest LTS version.
    echo Then close this window and run setup.bat again.
    echo.
    pause
    exit /b 1
)
if !NODE_MAJOR! EQU 20 if !NODE_MINOR! LSS 19 (
    echo [ERROR] Node.js v20.!NODE_MINOR! is too old. AURA-Dx needs v20.19 or newer.
    echo.
    echo To fix: open https://nodejs.org and install the latest LTS version.
    echo Then close this window and run setup.bat again.
    echo.
    pause
    exit /b 1
)
if !NODE_MAJOR! EQU 21 (
    echo [ERROR] Node.js v21 is not supported by the build tools used here.
    echo.
    echo To fix: open https://nodejs.org and install the latest LTS version
    echo (v22 or v24). Then close this window and run setup.bat again.
    echo.
    pause
    exit /b 1
)
if !NODE_MAJOR! EQU 22 if !NODE_MINOR! LSS 12 (
    echo [ERROR] Node.js v22.!NODE_MINOR! is too old. AURA-Dx needs v22.12 or newer.
    echo.
    echo To fix: open https://nodejs.org and install the latest LTS version.
    echo Then close this window and run setup.bat again.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found: v!NODE_MAJOR!.!NODE_MINOR!.x
echo.

REM ---- 3. Install dependencies (only once) ----
if exist "node_modules" (
    echo [OK] Dependencies are already installed - skipping npm install.
) else (
    echo Installing dependencies... this can take a few minutes.
    echo Do not close this window while it runs.
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] npm install failed. Check your internet connection
        echo and try running setup.bat again.
        echo.
        pause
        exit /b 1
    )
)
echo.

REM ---- 4. Start the dev server ----
echo Starting the dev server...
echo Your browser will open http://localhost:5176 in a few seconds.
echo If it does not, type that address into your browser manually.
echo.
echo To STOP the server later, come back to this window and press Ctrl+C.
echo.
start "" http://localhost:5176
timeout /t 5 /nobreak >nul
call npm run dev

echo.
echo The server was stopped.
pause