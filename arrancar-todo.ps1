<#
.SYNOPSIS
    Levanta todo el sistema VentaRápida: base de datos, backend y frontend.

.DESCRIPTION
    Abre una ventana para cada componente, en el orden correcto, y va
    comprobando que cada uno quede respondiendo antes de pasar al siguiente.

    Al terminar muestra un resumen con las direcciones y los usuarios de prueba.

.PARAMETER RutaBackend
    Carpeta del repositorio del backend. Por defecto se busca al lado de este
    proyecto (..\ventarapida-backend).

.PARAMETER RutaMysql
    Carpeta de instalación de MySQL. Por defecto la de WAMP.

.PARAMETER SinNavegador
    No abre el navegador al terminar.

.PARAMETER SoloEstado
    No levanta nada: solo informa qué está corriendo y qué falta.

.EXAMPLE
    .\arrancar-todo.ps1

.EXAMPLE
    .\arrancar-todo.ps1 -SoloEstado
#>

[CmdletBinding()]
param(
    [string]$RutaBackend = "",
    [string]$RutaMysql = "F:\wamp64\bin\mysql\mysql8.3.0",
    [switch]$SinNavegador,
    [switch]$SoloEstado
)

$ErrorActionPreference = "Stop"

# --- Datos del sistema -------------------------------------------------------
$raizFront = $PSScriptRoot

if (-not $RutaBackend) {
    $RutaBackend = Join-Path (Split-Path $raizFront -Parent) "ventarapida-backend"
}

# Lista de los 11 microservicios: puerto y nombre.
$servicios = @(
    [pscustomobject]@{ Puerto = 4428; Nombre = "service-auth" },
    [pscustomobject]@{ Puerto = 4419; Nombre = "service-catalogo" },
    [pscustomobject]@{ Puerto = 4420; Nombre = "service-cliente" },
    [pscustomobject]@{ Puerto = 4421; Nombre = "service-inventario" },
    [pscustomobject]@{ Puerto = 4422; Nombre = "service-ventas" },
    [pscustomobject]@{ Puerto = 4423; Nombre = "service-pagos" },
    [pscustomobject]@{ Puerto = 4426; Nombre = "service-facturacion" },
    [pscustomobject]@{ Puerto = 4427; Nombre = "service_proveedores" },
    [pscustomobject]@{ Puerto = 4429; Nombre = "service-reportes" },
    [pscustomobject]@{ Puerto = 4430; Nombre = "service-notificacion" },
    [pscustomobject]@{ Puerto = 4425; Nombre = "API GATEWAY" }
)

# --- Ayudas ------------------------------------------------------------------
function Titulo($texto) {
    Write-Host ""
    Write-Host $texto -ForegroundColor White -BackgroundColor DarkRed
}

function Bien($texto)     { Write-Host "   [OK]    $texto" -ForegroundColor Green }
function Aviso($texto)    { Write-Host "   [AVISO] $texto" -ForegroundColor Yellow }
function Problema($texto) { Write-Host "   [FALLA] $texto" -ForegroundColor Red }

function PuertoAbierto($puerto) {
    return [bool](Get-NetTCPConnection -LocalPort $puerto -State Listen -ErrorAction SilentlyContinue)
}

function EsperarPuerto($puerto, $etiqueta, $maxSegundos) {
    for ($i = 0; $i -lt $maxSegundos; $i++) {
        if (PuertoAbierto $puerto) {
            Bien "$etiqueta respondiendo en el puerto $puerto (${i}s)"
            return $true
        }
        Start-Sleep -Seconds 1
    }
    Problema "$etiqueta NO respondió en el puerto $puerto después de ${maxSegundos}s"
    return $false
}

function ServiciosApagados {
    return @($servicios | Where-Object { -not (PuertoAbierto $_.Puerto) })
}

function AbrirVentana($titulo, $comando) {
    $guion = "`$host.UI.RawUI.WindowTitle = '$titulo'; $comando"
    Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-NoExit", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $guion `
        -WindowStyle Normal | Out-Null
}

# --- Encabezado --------------------------------------------------------------
Clear-Host
Write-Host "==============================================================" -ForegroundColor DarkRed
Write-Host "   El Rincón de la Tía Ceci - arranque completo del sistema" -ForegroundColor White
Write-Host "==============================================================" -ForegroundColor DarkRed
Write-Host "   Base de datos + 11 microservicios + tienda y panel"
Write-Host ""

# --- Comprobaciones previas --------------------------------------------------
$mysqld  = Join-Path $RutaMysql "bin\mysqld.exe"
$myIni   = Join-Path $RutaMysql "my.ini"
$scriptBackend = Join-Path $RutaBackend "iniciar-servicios.ps1"

$faltantes = @()
if (-not (Test-Path $mysqld))        { $faltantes += "MySQL:        $mysqld" }
if (-not (Test-Path $myIni))         { $faltantes += "my.ini:       $myIni" }
if (-not (Test-Path $RutaBackend))   { $faltantes += "Backend:      $RutaBackend" }
if (-not (Test-Path $scriptBackend)) { $faltantes += "Script:       $scriptBackend" }
if (-not (Test-Path (Join-Path $raizFront "package.json"))) { $faltantes += "Frontend:     $raizFront" }

if ($faltantes.Count -gt 0) {
    Problema "No encuentro estas rutas:"
    $faltantes | ForEach-Object { Write-Host "             $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "   Si el backend está en otra carpeta, indícalo así:" -ForegroundColor Yellow
    Write-Host "   .\arrancar-todo.ps1 -RutaBackend 'D:\otra\ruta\ventarapida-backend'" -ForegroundColor Yellow
    exit 1
}

# --- Modo solo estado --------------------------------------------------------
if ($SoloEstado) {
    Titulo " ESTADO ACTUAL"
    $componentes = @(
        [pscustomobject]@{ Puerto = 3306; Nombre = "MySQL" },
        [pscustomobject]@{ Puerto = 4425; Nombre = "API Gateway" },
        [pscustomobject]@{ Puerto = 3000; Nombre = "Frontend Next.js" }
    )
    foreach ($c in $componentes) {
        if (PuertoAbierto $c.Puerto) { Bien "$($c.Nombre) (puerto $($c.Puerto))" }
        else                         { Aviso "$($c.Nombre) apagado (puerto $($c.Puerto))" }
    }
    $apagados = ServiciosApagados
    if ($apagados.Count -eq 0) { Bien "Los 11 microservicios están arriba" }
    else { Aviso "$($apagados.Count) microservicios apagados: $(($apagados | ForEach-Object { $_.Nombre }) -join ', ')" }
    Write-Host ""
    exit 0
}

# --- 1. Base de datos --------------------------------------------------------
Titulo " 1/3  BASE DE DATOS"

if (PuertoAbierto 3306) {
    Aviso "MySQL ya está corriendo en el puerto 3306; no se abre otra ventana."
}
else {
    Write-Host "   Abriendo una ventana con MySQL..." -ForegroundColor Gray
    AbrirVentana "VentaRapida - MySQL" "& '$mysqld' --defaults-file='$myIni' --console"
    if (-not (EsperarPuerto 3306 "MySQL" 90)) {
        Problema "Revisa la ventana de MySQL. Si dice 'ibdata1 must be writable',"
        Problema "ya hay otro MySQL usando los archivos: apágalo primero."
        exit 1
    }
}

# --- 2. Backend --------------------------------------------------------------
Titulo " 2/3  BACKEND (11 microservicios)"

if (PuertoAbierto 4425) {
    Aviso "El API Gateway ya está corriendo en el puerto 4425."
}
else {
    Write-Host "   Abriendo una ventana con los 11 microservicios..." -ForegroundColor Gray
    AbrirVentana "VentaRapida - Backend" "Set-Location '$RutaBackend'; .\iniciar-servicios.ps1"
}

# Se espera a que TODOS los servicios abran su puerto. Los microservicios con
# base de datos tardan más que el gateway, así que no basta con esperar al 4425.
$limite = 240
Write-Host "   Esperando a los 11 servicios (hasta ${limite}s)..." -ForegroundColor Gray
$paso = 0
while ($paso -lt $limite) {
    $apagados = ServiciosApagados
    if ($apagados.Count -eq 0) { break }
    Start-Sleep -Seconds 2
    $paso += 2
    if ($paso % 20 -eq 0) {
        Write-Host "      ... faltan $($apagados.Count): $(($apagados | ForEach-Object { $_.Nombre }) -join ', ')" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "   Estado de los servicios:" -ForegroundColor Gray
$apagados = ServiciosApagados
foreach ($s in $servicios) {
    if (PuertoAbierto $s.Puerto) {
        Write-Host ("      {0,-22} {1,-6} OK" -f $s.Nombre, $s.Puerto) -ForegroundColor Green
    }
    else {
        Write-Host ("      {0,-22} {1,-6} APAGADO" -f $s.Nombre, $s.Puerto) -ForegroundColor Red
    }
}

if ($apagados.Count -gt 0) {
    Write-Host ""
    Problema "Estos servicios no responden: $(($apagados | ForEach-Object { $_.Nombre }) -join ', ')"
    Write-Host "   Revisa el detalle en: $RutaBackend\logs\" -ForegroundColor Yellow
    Write-Host "   Causa típica: falta compilar el servicio. Prueba:" -ForegroundColor Yellow
    Write-Host "      cd '$RutaBackend'; .\iniciar-servicios.ps1" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# --- 3. Frontend -------------------------------------------------------------
Titulo " 3/3  FRONTEND (tienda y panel)"

if (PuertoAbierto 3000) {
    Aviso "El frontend ya está corriendo en el puerto 3000."
}
else {
    if (-not (Test-Path (Join-Path $raizFront "node_modules"))) {
        Problema "Falta la carpeta node_modules. Ejecuta primero:"
        Write-Host "   cd '$raizFront'; npm install" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "   Abriendo una ventana con Next.js..." -ForegroundColor Gray
    AbrirVentana "VentaRapida - Frontend" "Set-Location '$raizFront'; npm run dev"
    if (-not (EsperarPuerto 3000 "Frontend" 120)) {
        Problema "Revisa la ventana del frontend."
        exit 1
    }
}

# --- Resumen -----------------------------------------------------------------
Titulo " LISTO - SISTEMA COMPLETO ARRIBA"
Write-Host ""
Write-Host "   Direcciones:" -ForegroundColor White
Write-Host "     Tienda         http://localhost:3000" -ForegroundColor Cyan
Write-Host "     Panel          http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host "     Swagger        http://localhost:4425/swagger-ui.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Usuarios de prueba:" -ForegroundColor White
Write-Host "     servicios / Servicios123    (Administrador)" -ForegroundColor Gray
Write-Host "     vendedor  / vendedor123     (Vendedor)" -ForegroundColor Gray
Write-Host ""
Write-Host "   Para apagar todo:  .\apagar-todo.ps1" -ForegroundColor DarkGray
Write-Host ""

if (-not $SinNavegador) {
    Start-Process "http://localhost:3000" | Out-Null
    Write-Host "   Abriendo la tienda en el navegador..." -ForegroundColor DarkGray
}

Write-Host "   Deja las ventanas abiertas mientras uses el sistema." -ForegroundColor Yellow
Write-Host ""
