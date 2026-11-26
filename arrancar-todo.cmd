@echo off
REM Arranca todo el sistema con doble clic.
REM Llama al script de PowerShell saltando la politica de ejecucion.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0arrancar-todo.ps1" %*
echo.
pause
