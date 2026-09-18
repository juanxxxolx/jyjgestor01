@echo off
REM ================================================================
REM   start-dev.bat - Inicia backend (3000) y frontend (5173)
REM   en VENTANAS INDEPENDIENTES y minimizadas.
REM   Nota: usa rutas sin acentos para arranque robusto de nest.
REM ================================================================
setlocal
chcp 65001 >NUL

set "BACKEND_DIR=C:\Users\juan M\OneDrive\Escritorio\proyecto_jyjgestor\backend"
set "FRONTEND_DIR=C:\Users\juan M\OneDrive\Escritorio\proyecto_jyjgestor\frontend"

echo ============================================================
echo   JYJGestor - Iniciando servidores
echo ============================================================
echo.

echo [1/2] Backend  -> http://localhost:3000
start "JYJ-Backend" /D "%BACKEND_DIR%" /MIN node dist\main.js

echo [2/2] Frontend -> http://localhost:5173
start "JYJ-Frontend" /D "%FRONTEND_DIR%" /MIN cmd /k npm run dev

echo.
echo  Ambos servidores lanzados en ventanas minimizadas.
echo  Abre: http://localhost:5173
echo  (busca en la barra de tareas "JYJ-Backend" / "JYJ-Frontend")
echo.
endlocal
