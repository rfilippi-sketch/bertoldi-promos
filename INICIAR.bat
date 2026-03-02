@echo off
setlocal
cd /d "%~dp0"

echo.
echo  ============================================
echo      Iniciando Bertoldi Promos Lab
echo  ============================================
echo.

:: Inicia el servidor de depuracion en una ventana nueva
echo  (Paso 1 de 2) Iniciando el servidor en una ventana nueva...
echo  (No cierres la nueva ventana que aparecera)
start "Bertoldi Promos Server" debug_server.bat

:: Espera 8 segundos para que el servidor inicie
echo.
echo  (Paso 2 de 2) Esperando 8 segundos a que el servidor este listo...
timeout /t 8 /nobreak > nul

:: Busca Chrome en las rutas mas comunes
set "CHROME_PATH="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=%LocalAppData%\Google\Chrome\Application\chrome.exe"

:: Abre la URL en Chrome si se encontro, si no, en el navegador predeterminado
if defined CHROME_PATH (
    echo.
    echo  Listo! Abriendo la aplicacion en Google Chrome...
    start "" "%CHROME_PATH%" "http://localhost:5173"
) else (
    echo.
    echo  [ADVERTENCIA] No se encontro Google Chrome.
    echo  Listo! Abriendo la aplicacion en tu navegador predeterminado...
    start "" "http://localhost:5173"
)

echo.
echo  ============================================
echo. 
echo  El script finalizo. Ya puedes cerrar esta ventana.
echo  Recuerda no cerrar la otra ventana (el servidor).
echo.
pause
endlocal