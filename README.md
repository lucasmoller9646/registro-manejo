# Registro de manejo · Rural Bioenergía / Ypoti — versión 3.0

App offline para el registro diario de manejo. Módulos de pasto: entrada pasto, salida de animales, mortalidad, nacimiento, pesaje de auditoría y pérdida de botón electrónico. Módulos de intensivo (solo Ypoti): entrada RIP y entrada confinamiento.

Abrir en el celular: https://lucasmoller9646.github.io/registro-manejo/ y agregar a la pantalla de inicio.
La URL del servidor y el correo de trazabilidad ya vienen configurados dentro del app: no hay que configurar nada en cada teléfono.

## Novedades 3.0.1

- Lector del archivo de la balanza probado con exportaciones reales de Tru-Test (`;` y `,`), XR5000 (líneas terminadas en CR), archivos con columna `IDV` antes de `IDE`, IDE con espacio ("600 010001073200" → 600010001073200), encabezados con acentos mal codificados, pesos con coma decimal, tabulaciones, archivos solo con IDE y archivos sin encabezado. Solo la IDE es obligatoria: si el archivo no trae columna de peso, o si algunos animales vienen sin peso (vacío o 0), el app lo carga igual y muestra un aviso en rojo con las IDE sin peso; el promedio y el total se calculan solo con los pesados; el JSON lleva `datos.cantidad_sin_peso` y `control.sin_peso`, el PDF marca "sin peso" en la lista y agrega un aviso, y la planilla tiene la columna `cantidad_sin_peso`.
- La COTA y la guía "del archivo" se toman solo cuando la columna trae un único número (las balanzas suelen guardarlo en la primera fila); si cada animal trae un número distinto (historial de compras), no se usan para el cruce con el QR.

## Novedades 3.0

- "Lote (como en ControlPasto)" y "Piquete (nombre de la pastura)" salen de los datos generales y se preguntan al inicio de cada módulo de pasto (en el JSON: `lote_controlpasto` y `piquete`; en la planilla, columna `piquete`).
- Entrada y salida ya no preguntan origen ni destino (están en la guía). Cada COTA lleva, además del QR, una foto de la primera página de la guía (`adjuntos.fotos_guia[]`, columna `foto_guia` en la hoja `cotas`). "Entrada de animales" pasa a llamarse "Entrada pasto" (la clave `entrada` no cambia).
- Nacimiento pide foto del nacimiento (`adjuntos.foto_nacimiento`).
- Mortalidad pide la ubicación de lo ocurrido: ubicación del teléfono (GPS), punto elegido en el mapa (mapa de OpenStreetMap si hay señal; sin señal se pueden escribir las coordenadas). En el JSON `datos.ubicacion {lat, lon, precision_m, fuente}`; en la planilla `ubic_lat`, `ubic_lon`, `ubic_precision_m`, `ubic_fuente`; en el PDF y en el correo va el punto en el mapa y el enlace a Google Maps.
- Pesaje de auditoría pide la cantidad contada a mano y la compara con el archivo (igual que entrada/salida).
- Los módulos se separan en "Pasto" e "Intensivo · solo Ypoti" (el segundo grupo aparece solo con la estancia Ypoti). Nuevos: **Entrada RIP** (origen misma propiedad → lote ControlPasto + piquete; otra propiedad → camiones + guías; conteo + pesaje; destino Lote BovinOS + Piquete) y **Entrada confinamiento** (animal propio o boitel; propio → misma propiedad [recría tradicional → lote ControlPasto + piquete; RIP → lote BovinOS + piquete] u otra propiedad; boitel → propietario; boitel u otra propiedad → camiones + guías; conteo + pesaje; destino Lote Confinamiento BovinOS + Piquete Confinamiento). En el JSON: `grupo` ('pasto'/'intensivo'), `datos.propiedad`, `propietario`, `origen_tipo`, `origen_sistema`, `origen_lote`, `origen_piquete`, `destino_lote`, `destino_piquete` (y `lote_controlpasto`/`piquete` = destino). Mismas columnas en la planilla.

## Novedades 2.1

- Entrada y salida: una misma subida puede tener varios camiones (chapa + foto del precinto de cada uno, botón "+ Agregar otro camión") y varias guías/COTAs (botón "+ Agregar otra COTA"; cada una con su QR). El app controla que la COTA del archivo de la balanza esté entre las cargadas y que la suma de animales declarados en todas las COTAs coincida con los contados. En la planilla hay hojas nuevas `camiones` y `cotas` (una fila por camión / por COTA) y columnas `cantidad_camiones`, `cantidad_cotas`, `total_declarado_cotas`. En el JSON: `datos.camiones[]`, `datos.cotas[]` y `adjuntos.fotos_precinto[]`; `chapa_camion` y `cota_nro` siguen existiendo con los valores unidos por " / ".

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
