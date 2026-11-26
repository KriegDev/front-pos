@echo off
REM Apaga todo el sistema con doble clic.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0apagar-todo.ps1" %*
echo.
pause
