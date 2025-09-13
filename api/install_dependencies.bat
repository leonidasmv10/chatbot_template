@echo off
title Instalador de Entorno Virtual - Proyecto IA
color 0A

echo ==================================================
echo        🚀 Instalador de Entorno Virtual 🚀
echo ==================================================
echo.

:: Actualizar pip
echo [1/5] Actualizando pip...
py -m pip install --upgrade pip
echo.

:: Instalar virtualenv
echo [2/5] Instalando virtualenv...
py -m pip install virtualenv
echo.

:: Crear entorno virtual (solo si no existe)
if not exist env (
    echo [3/5] Creando entorno virtual "env"...
    py -m venv env
) else (
    echo [3/5] Entorno virtual "env" ya existe. Saltando...
)
echo.

:: Activar entorno virtual
echo [4/5] Activando entorno virtual...
call .\env\Scripts\activate
echo.

:: Instalar dependencias del proyecto
echo [5/5] Instalando dependencias desde requirements.txt...
pip install -r requirements.txt
echo.

echo ==================================================
echo ✅ Instalación completada con éxito
echo ==================================================
echo.
pause
