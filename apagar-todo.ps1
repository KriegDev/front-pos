<#
.SYNOPSIS
    Apaga todo el sistema VentaRápida de forma ordenada.

.DESCRIPTION
    Cierra el frontend, los 11 microservicios y la base de datos.
    La base de datos se cierra de forma limpia (no se mata el proceso), para
    evitar que InnoDB tenga que repararse en el siguiente arranque.

.PARAMETER RutaMysql
    Carpeta de instalación de MySQL. Por defecto la de WAMP.
#>

[CmdletBinding()]
param(
    [string]$RutaMysql = "F:\wamp64\bin\mysql\mysql8.3.0"
)

$ErrorActionPreference = "Continue"

function Titulo($texto) {
    Write-Host ""
    Write-Host $texto -ForegroundColor White -BackgroundColor DarkRed
}

function PuertoAbierto($puerto) {
    return [bool](Get-NetTCPConnection -LocalPort $puerto -State Listen -ErrorAction SilentlyContinue)
}

Clear-Host
Write-Host "==============================================================" -ForegroundColor DarkRed
Write-Host "   El Rincon de la Tia Ceci - apagado del sistema" -ForegroundColor White
Write-Host "==============================================================" -ForegroundColor DarkRed

# --- 1. Frontend -------------------------------------------------------------
Titulo " 1/3  FRONTEND"
if (PuertoAbierto 3000) {
    $conexion = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    Stop-Process -Id $conexion.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "   Frontend detenido." -ForegroundColor Green
}
else {
    Write-Host "   Ya estaba apagado." -ForegroundColor Gray
}

# --- 2. Microservicios -------------------------------------------------------
Titulo " 2/3  MICROSERVICIOS"
$java = Get-Process java -ErrorAction SilentlyContinue
if ($java) {
    Write-Host "   Cerrando $($java.Count) proceso(s) Java..." -ForegroundColor Gray
    $java | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 5
    Write-Host "   Microservicios detenidos." -ForegroundColor Green
}
else {
    Write-Host "   Ya estaban apagados." -ForegroundColor Gray
}

# --- 3. Base de datos --------------------------------------------------------
Titulo " 3/3  BASE DE DATOS"
$mysqladmin = Join-Path $RutaMysql "bin\mysqladmin.exe"

if (PuertoAbierto 3306) {
    if (Test-Path $mysqladmin) {
        & $mysqladmin -u root --host=127.0.0.1 --port=3306 shutdown 2>&1 | Out-Null
        Start-Sleep -Seconds 5
        if (PuertoAbierto 3306) {
            Write-Host "   No se pudo cerrar de forma limpia; cerrando el proceso." -ForegroundColor Yellow
            $conexion = Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue
            if ($conexion) { Stop-Process -Id $conexion.OwningProcess -Force -ErrorAction SilentlyContinue }
            Start-Sleep -Seconds 3
        }
    }
    else {
        Write-Host "   No encuentro mysqladmin; cerrando el proceso." -ForegroundColor Yellow
        Get-Process mysqld -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
    }

    if (PuertoAbierto 3306) { Write-Host "   La base sigue en el puerto 3306." -ForegroundColor Red }
    else { Write-Host "   Base de datos apagada." -ForegroundColor Green }
}
else {
    Write-Host "   Ya estaba apagada." -ForegroundColor Gray
}

# --- Comprobacion final ------------------------------------------------------
Titulo " ESTADO FINAL"
$puertos = @(3306, 4419, 4420, 4421, 4422, 4423, 4425, 4426, 4427, 4428, 4429, 4430, 3000)
$ocupados = @($puertos | Where-Object { PuertoAbierto $_ })

if ($ocupados.Count -eq 0) {
    Write-Host "   Todo apagado. Se pueden cerrar las ventanas." -ForegroundColor Green
}
else {
    Write-Host "   Siguen ocupados los puertos: $($ocupados -join ', ')" -ForegroundColor Yellow
    Write-Host "   Si algo quedó tomado, cierra su ventana o reinicia el equipo." -ForegroundColor Gray
}
Write-Host ""
