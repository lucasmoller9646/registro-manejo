# Registro de manejo · Rural Bioenergía / Ypoti — versión 2.0

App offline para el registro diario de manejo: entrada y salida de animales, mortalidad, nacimiento, pesaje de auditoría y pérdida de botón electrónico.

Abrir en el celular: https://lucasmoller9646.github.io/registro-manejo/ y agregar a la pantalla de inicio.
La URL del servidor y el correo de trazabilidad ya vienen configurados dentro del app: no hay que configurar nada en cada teléfono.

## Novedades 2.0

- Borradores: se puede cargar de a poco, tocar "Guardar borrador" y seguir después desde el inicio.
- Campo opcional "Lote ControlPasto" en todos los tipos de registro.
- Del archivo de la balanza se importan solo el ID y el peso (tolera archivos de distintas balanzas).
- Las fotos se pueden sacar con la cámara o elegir de la galería del teléfono.
- Mortalidad: el botón se escribe a mano y la causa se elige de la lista oficial.
- Nuevos tipos: "Pesaje de auditoría" (nombre, estancia, lote, archivo CSV) y "Pérdida de botón electrónico" (botón a mano + foto).
- Pantalla final: botón verde "Guardar en Banco de Datos" (pide la contraseña de la estancia) y, más abajo, "Generar archivos y compartir" (PDF + JSON por WhatsApp, correo u otra app).
- Registros viejos: se abren desde el inicio, se pueden editar y volver a publicar; cada cambio queda en el historial (en el app, en el JSON y en la hoja "log" de la planilla).
- "Importar varios (JSON)": agrega nuevos y reemplaza repetidos / solo nuevos / reemplazar todo. "Exportar todos (JSON)" para pasar registros entre teléfonos.

## Archivos

- `index.html`, `sw.js`, `manifest.webmanifest`: el app. Subirlos al repositorio de GitHub Pages (reemplazar `index.html`).
- `servidor_apps_script.gs`: el servidor (Google Apps Script). Pegar todo el contenido en el proyecto existente y publicar con
  Implementar > Administrar implementaciones > lápiz > Versión "Nueva versión" > Implementar (la URL /exec no cambia).
- `contrasenas_por_estancia.txt`: contraseñas de publicación. NO subir al repositorio.

## Base de datos (Google Sheets, en la carpeta "Banco de datos trazabilidad")

- Hoja `registros`: una fila por registro (si se edita, la fila se reemplaza y sube `version`). Columnas nuevas al final: `lote_controlpasto`, `version`, `modificado_en`, `actualizado_en_servidor`, `nombre_archivo_balanza`.
- Hoja `ids_individuales`: una fila por animal (ide, peso_kg, lote, versión).
- Hoja `log`: historial de cada registro (creado, editado — qué cambió —, autorizado, recibido/actualizado en el servidor).
- Los PDF y JSON quedan en Drive, en una subcarpeta por estancia; las versiones editadas llevan sufijo `_v2`, `_v3`, …
