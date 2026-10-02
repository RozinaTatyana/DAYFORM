@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js не найден. Для запуска DAYFORM нужен Node.js 20 или новее.
  echo Установите Node.js или откройте проект через Codex.
  pause
  exit /b 1
)
start "DAYFORM server" powershell.exe -NoExit -NoProfile -Command "Set-Location -LiteralPath '%CD%'; node serve.mjs"
timeout /t 2 /nobreak >nul
start "DAYFORM" "http://127.0.0.1:4173/"
