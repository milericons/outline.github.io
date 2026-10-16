@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo No se encontro Node.js. Instala Node.js para iniciar la galeria.
  pause
  exit /b 1
)
start "Galeria de iconos" /min node server.js
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:3000"
