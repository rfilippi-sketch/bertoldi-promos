@echo off
echo.
echo  ================================================
echo    Servidor de Desarrollo Bertoldi Promos
echo  ================================================
echo.
echo  - Este script iniciara el servidor de la aplicacion.
echo  - La ventana debe permanecer abierta.
echo  - Si se cierra, la app dejara de funcionar.
echo.
echo  Presiona cualquier tecla para empezar...
pause
echo.

echo  Cambiando al directorio del script...
cd /d "%~dp0"
echo  Directorio actual: %cd%
echo.

echo  Iniciando 'npm run dev'...
echo  Esto puede tardar unos segundos.
echo  ------------------------------------------
npm run dev
echo  ------------------------------------------
echo  [ERROR] El comando 'npm run dev' ha terminado.
echo  Puede ser un error o que lo hayas detenido manualmente.
echo.
echo  Esta ventana permanecera abierta para que veas los mensajes.