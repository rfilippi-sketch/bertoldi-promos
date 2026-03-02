# Bertoldi Promos Lab 🎯

Herramienta interna para crear y simular promos y bundles.

---

## Instalación (una sola vez)

### Paso 1 — Instalar Node.js
1. Ir a **https://nodejs.org**
2. Descargar la versión **LTS** (botón verde grande)
3. Instalar con todas las opciones por defecto
4. Reiniciar la PC si lo pide

### Paso 2 — Arrancar la app
1. Ir a la carpeta `bertoldi-promos`
2. Hacer **doble clic** en `INICIAR.bat`
3. La primera vez descarga dependencias (~30 segundos)
4. Se abre automáticamente en el navegador

---

## Uso diario

Solo hacer doble clic en `INICIAR.bat` cada vez que quieras usarla.

La app queda disponible en:
- **Esta PC:** http://localhost:5173
- **Red local (para el equipo):** http://TU-IP:5173
  - Para ver tu IP: abrir CMD y escribir `ipconfig`
  - Buscar "Dirección IPv4" (ej: 192.168.1.105)
  - Cualquier persona en la misma red puede entrar a http://192.168.1.105:5173

---

## Importar el CSV del ERP

1. Exportar desde el ERP con columnas: `Id`, `descripcion`, `marca`, `cant`, `Costo_Final_$`, `Lista_3$`
2. En la app, hacer clic en **"Importar CSV del ERP"**
3. Los productos se guardan automáticamente — no hay que reimportar cada vez

---

## Actualizar la app (cuando haya cambios)

Cuando se actualice la herramienta desde Claude, reemplazar el archivo `src/App.jsx` con la nueva versión.
No hace falta reinstalar nada más.
