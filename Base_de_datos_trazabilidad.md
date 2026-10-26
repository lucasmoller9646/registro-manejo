---
title: "Base de datos de trazabilidad — Registro de manejo"
subtitle: "Cómo funciona y cómo se mantiene (versión 3.4, octubre 2026)"
author: "Rural Bioenergía S.A. · Gerencia de trazabilidad"
lang: es
---

# 1. Para qué existe

La base de datos de trazabilidad recibe, de cada estancia, los eventos de manejo que los capataces cargan en el app **Registro de manejo** (entradas y salidas de animales, pesajes de auditoría, mortalidad, nacimientos, pérdida de botón electrónico y, en Ypoti, entradas a RIP y a confinamiento). Hoy sirve para ordenar lo recolectado y producir informes por estancia y período. Está armada para que, sin cambiar el modelo, se pueda hacer **trazabilidad individual** (dónde fue visto cada animal, cuándo, con qué peso, de dónde vino y a dónde fue), **margen por cabeza** (peso de entrada, peso de salida, días en campo, ganancia diaria) y **evaluación de proveedores y guías** (qué guía o proveedor trajo los animales que mejor rindieron).

El principio de diseño es simple: cada registro del app se guarda entero (JSON) y además se **descompone en tablas normalizadas** con claves estables, de modo que cualquier herramienta (Google Sheets, R, Python, PostgreSQL) pueda consultarlas sin depender del app.

# 2. Arquitectura

```
Teléfono del capataz                 Google (cuenta lucasmoller@ypoti.com)
┌─────────────────────┐   HTTPS     ┌──────────────────────────────────────┐
│ App "Registro de    │ ──POST───▶  │ Apps Script (servidor_apps_script.gs)│
│ manejo" (PWA,       │   JSON+PDF  │  · valida contraseña por estancia     │
│ offline, IndexedDB) │ ◀──JSON───  │  · guarda archivos en Drive           │
│ GitHub Pages        │             │  · escribe las tablas en Sheets       │
└─────────────────────┘             │  · envía el correo                    │
                                    └──────────────────────────────────────┘
                                         │                  │
                                         ▼                  ▼
                               Drive: carpeta        Sheets: planilla
                               "Banco de datos       "Registros de manejo
                                trazabilidad"         (base de datos)"
```

* **App**: página única (HTML/JS) publicada en GitHub Pages (`lucasmoller9646.github.io/registro-manejo`). Funciona sin señal: guarda todo en el teléfono (IndexedDB) y sincroniza cuando hay conexión. La URL del servidor y el correo vienen embebidos.
* **Servidor**: un proyecto de Google Apps Script publicado como aplicación web (URL `/exec`). Se ejecuta con la cuenta `lucasmoller@ypoti.com`. No hay base de datos externa ni servidor propio.
* **Drive**: carpeta `Banco de datos trazabilidad` (id `1ceQacSijwWHwh0dkiZTAqtvwyXlD5WKR`), una subcarpeta por estancia. Guarda el PDF y el JSON de cada registro, las fotos sueltas y la lista de IDE en CSV.
* **Sheets**: la planilla `Registros de manejo (base de datos)` dentro de esa carpeta, con una hoja por tabla (sección 4).

# 3. Flujo de un registro

1. El capataz completa el registro en el app. El app genera un **id** (UUID v4) y, al guardar, arma el JSON (esquema `manejo-ypoti/3.x`) y el PDF.
2. Para publicar, el app pide la **contraseña de la estancia** (o la maestra). Si no hay señal, el registro queda en cola y se envía solo al volver la conexión.
3. El servidor (`doPost`, `tipo: "registro"`) valida la contraseña, comprueba si el id ya existe y, si existe con la misma o mayor versión, responde "ya recibido" sin duplicar nada (**idempotencia**: un reintento nunca crea una fila doble).
4. Guarda PDF, JSON, fotos y CSV de IDE en Drive; escribe o reemplaza las filas en las hojas; reconstruye la hoja `animales`; registra el historial en `log`; envía el correo con PDF y JSON adjuntos.
5. **Ediciones**: si el capataz edita un registro ya publicado, el app sube el mismo id con `version` +1 y el detalle de qué cambió. El servidor reemplaza la fila en `registros`, borra y vuelve a escribir las filas hijas de ese id (animales, camiones, COTAs, faltantes, fotos) y deja los archivos anteriores en Drive con su sufijo `_vN`. Así la última versión es siempre la vigente, y el historial completo queda en `log` y en Drive.

# 4. Tablas (hojas de la planilla)

Todas las hojas tienen **cabecera en la fila 1**. El servidor agrega automáticamente al final las columnas que falten cuando se publica una versión nueva, sin mover las existentes, de modo que la planilla nunca "se rompe" con una actualización. Fechas de evento en formato `YYYY-MM-DD`; horas en `HH:MM` (hora de Paraguay); identificaciones electrónicas (IDE) como texto de 15 dígitos sin espacios.

## 4.1 `registros` — un registro por fila (cabecera del evento)

Clave: `id` (UUID). Una fila por registro; las ediciones reemplazan la fila (la columna `version` sube). Columnas principales:

| Grupo | Columnas |
|---|---|
| Identificación | `id`, `version`, `tipo_evento` (`entrada`, `salida`, `mortalidad`, `nacimiento`, `pesaje`, `pesaje_simple`, `medicamento`, `solicitud_transferencia`, `perdida_boton`, `entrada_rip`, `entrada_confinamiento`), `grupo` (`pasto` / `intensivo`), `estancia`, `fecha_evento`, `hora_registro`, `respondente`, `creado_en`, `modificado_en`, `recibido_en`, `actualizado_en_servidor`, `app_version` |
| Ubicación en la estancia | `lote_controlpasto`, `piquete` (en intensivo: lote/piquete de destino) |
| Camiones y guías | `chapa_camion` (varias separadas por " / "), `cantidad_camiones`, `cota_nro` (varias " / "), `cota_qr`, `cantidad_cotas`, `total_declarado_cotas`, `cota_archivo`, `guia_archivo` |
| Animales | `cantidad_animales` (contados a mano), `cantidad_ids` (en la lista final), `cantidad_bascula`, `cantidad_baston`, `cantidad_sin_peso`, `peso_promedio_kg`, `peso_total_kg`, `fecha_pesaje`, `nombre_archivo_balanza`, `conciliacion_pct`, `solo_baston` (del bastón sin peso), `solo_bascula` (de la báscula descartados), `ids_coinciden`, `cota_coincide`, `guia_coincide`, `declarado_coincide` |
| Intensivo (Ypoti) | `propiedad` (`propio`/`boitel`), `propietario`, `origen_tipo`, `origen_sistema`, `origen_lote`, `origen_piquete`, `destino_lote`, `destino_piquete`, `origen`, `destino` |
| Mortalidad / nacimiento / botón | `nro_boton`, `causa_probable`, `ubic_lat`, `ubic_lon`, `ubic_precision_m`, `ubic_fuente`, `madre`, `sexo_cria`, `nro_boton_cria` |
| Acta de no arreados | `cantidad_faltantes`, `faltantes_peso_medio_kg`, `faltantes_lugar`, `faltantes_motivo`, `faltantes_capataz`, `faltantes_auditor`, `faltantes_conformidad` |
| Archivos | `url_pdf`, `url_json`, `url_fotos` (carpeta), `url_ids` (CSV), `url_foto_boton`, `cantidad_fotos` |
| Otros | `observaciones`, `lat`, `lon` (posición del teléfono al guardar) |

## 4.2 `ids_individuales` — libro de eventos por animal (la tabla central)

Clave: (`registro_id`, `ide`). **Una fila por animal y por registro.** Es la tabla sobre la que se hace la trazabilidad: cada vez que un animal "es visto" (pasa por el bastón, por la báscula, muere, nace, pierde el botón o queda en un acta de no arreados) aparece una fila.

| Columna | Contenido |
|---|---|
| `registro_id`, `version`, `tipo_evento`, `estancia`, `fecha_evento`, `hora`, `respondente`, `recibido_en` | de qué registro viene |
| `ide` | identificación electrónica (15 dígitos). En mortalidad y pérdida de botón es el número escrito a mano; en nacimiento, el botón del ternero (si ya tiene); en actas, la caravana leída (puede quedar vacía) |
| `peso_kg` | peso del animal para ese evento (vacío si no tiene) |
| `peso_fuente` | de dónde salió ese peso: `bascula` (real), `historico` (último peso de báscula en la base, hasta 60 días antes; `peso_origen_fecha` y `peso_origen_registro` dicen de qué registro), `manual` (escrito por el usuario en el paso de inconformidades) o `promedio` (promedio de los pesados del mismo registro). Vacío en filas viejas = báscula. **Para cualquier cálculo de rendimiento usar solo `bascula`/vacío.** |
| `fuente` | `ambos` (bastón y báscula), `baston` (leído, sin peso), `bascula` (pesaje sin bastón), `manual` (mortalidad, nacimiento, botón perdido), `acta` (no arreado; el peso es el estimado medio) |
| `lote_controlpasto`, `piquete`, `origen`, `destino`, `grupo` | ubicación/contexto del evento |
| `nro_guia`, `cota_nro`, `propietario_origen`, `establecimiento_origen`, `propietario_destino`, `establecimiento_destino` | datos de la guía/COTA del movimiento (cuando hay una sola COTA en el registro se copian a cada animal; con varias, se copian los números unidos por " / ") |
| `raza`, `sexo`, `categoria`, `proveedor`, `nacimiento` | **mejor esfuerzo**: se toman del archivo de la báscula cuando trae esas columnas (exportaciones Tru-Test/XR5000). Pueden venir vacías. |
| `causa`, `detalle` | causa de muerte; texto libre (madre, motivo del acta, ubicación, etc.) |

Reglas importantes:

* En **entradas y salidas** (y entradas RIP/confinamiento) valen solo los animales leídos con el **bastón**; la báscula aporta el peso (unión por IDE). Los animales que están en la báscula pero no en el bastón **no** se escriben.
* Los animales del **acta de no arreados** sí se escriben (fuente `acta`), para que no se pierda su rastro, pero no son pesajes reales.
* Desde la versión 3.5 el app puede completar pesos faltantes (histórico, a mano o promedio): esas filas llevan `peso_fuente` distinto de `bascula` y **no cuentan** para GMD ni para la búsqueda de pesos históricos (`tipo: 'pesos'` del servidor). El registro guarda además las **inconformidades** detectadas y su justificación (`registros.inconformidades`, `registros.justificaciones`).
* Cuando un registro se edita, sus filas se borran y se reescriben con la nueva versión.

## 4.3 `animales` — estado actual de cada animal (tabla derivada)

Clave: `ide`. **Se reconstruye entera desde `ids_individuales` después de cada registro recibido** (y se puede reconstruir a mano ejecutando `reconstruirAnimales` en el editor de Apps Script). No se edita a mano: cualquier corrección se hace en los registros (editando desde el app) y la tabla se regenera.

| Columna | Contenido |
|---|---|
| `estado` | `activo`, `salido` (último evento es una salida) o `muerto` |
| `estancia_actual`, `lote_actual`, `piquete_actual` | del último evento, si está activo |
| `primer_evento`, `primer_tipo`, `primera_estancia`, `ultimo_evento`, `ultimo_tipo`, `ultima_estancia`, `eventos`, `pesajes` | resumen del recorrido |
| `primer_peso_kg`, `fecha_primer_peso`, `ultimo_peso_kg`, `fecha_ultimo_peso`, `ganancia_total_kg`, `dias_entre_pesos`, `gmd_kg_dia` | rendimiento (pesos reales de báscula; no cuenta los estimados del acta) |
| `peso_entrada_kg`, `fecha_entrada`, `guia_entrada`, `cota_entrada`, `proveedor`, `propietario_origen`, `establecimiento_origen` | de la primera entrada registrada: base para margen por cabeza y evaluación de proveedores |
| `raza`, `sexo`, `categoria`, `nacimiento` | primer valor conocido |
| `fecha_salida`, `destino_salida`, `guia_salida`, `peso_salida_kg` | de la última salida |
| `fecha_muerte`, `causa_muerte` | si murió |
| `registros` | ids de todos los registros donde aparece (separados por espacio) |

## 4.4 `cotas` — guías / COTAs (una fila por COTA y por registro)

Clave: (`registro_id`, `nro`). Columnas: `cota_nro`, `nro_guia`, `fecha_emision`, `propietario_origen`, `establecimiento_origen`, `lat_origen`, `lon_origen`, `propietario_destino`, `establecimiento_destino`, `lat_destino`, `lon_destino`, `finalidad`, `animales_declarados`, `total_declarado`, `texto_qr` (contenido completo del QR de SENACSA), `foto_guia`, `modo` (`qr` = leído del código; `manual` = el QR no se pudo leer y se cargaron a mano guía y COTA), `cantidad_animales` y `peso_promedio_kg` del registro, `respondente`. Es la tabla para analizar por guía o por proveedor (`propietario_origen` / `establecimiento_origen` son los códigos SENACSA).

## 4.5 Otras hojas

* `camiones`: (`registro_id`, `nro`) → `chapa`, `foto_precinto`, `nro_precinto` (v4: número leído de la foto por la IA o escrito a mano).
* `faltantes`: acta de no arreados del pesaje de auditoría: una fila por caravana identificada (o una sola con la `cantidad` si no se identificó ninguna), con `lugar`, `motivo`, `capataz`, `auditor`, `conformidad`, `peso_medio_estimado_kg`.
* `fotos`: una fila por foto guardada en Drive (`tipo_foto`: precinto_camionN, guia, animal, boton, nacimiento, ocurrido, no_arreados, satelite; `url`).
* `medicamentos`: una fila por aplicación de medicamento (`registro_id`, `brinco`, `medicamento`, `codigo_articulo` del depósito o vacío, `en_lista`, `dosis`, `unidad`, `modo` simple/masiva, lote, piquete, respondente, versión). Las mismas aplicaciones aparecen en `ids_individuales` como eventos del animal (fuente `manual`, detalle "medicamento: …"), para que el historial sanitario quede junto al resto del recorrido de cada IDE/brinco.
* `brincos_activos` (opcional, se crea a mano): `ide`, `estancia`, `lote`, `categoria`. Sirve para cargar una exportación del stock (ControlPasto / SIGOR) y que el app sugiera esos brincos al escribir el Nº de botón aunque los animales todavía no hayan pasado por un registro. El pedido `brincos` combina esta hoja con los animales activos de `animales` (los muertos o salidos según `animales` nunca se sugieren).
* `respaldos`: copias de seguridad que mandan los teléfonos de lo que todavía **no** está en la base (borradores, registros terminados sin publicar y ediciones en curso): `id`, `estancia`, `tipo_evento`, `estado_local` (borrador / pendiente / compartido / enviado con edición), `edicion`, `respondente`, `version`, `actualizado_en`, `recibido_en`, `id_archivo` y `url` del JSON en la carpeta de Drive `respaldos_telefonos` (el registro completo del teléfono, con fotos; se sobrescribe en cada copia), `tamano_kb`, `dispositivo`, `app_version`. Cuando el registro se publica, su fila y su archivo se borran. No forma parte de la trazabilidad: es solo para recuperar el trabajo de un teléfono (pedidos `recuperar` y `recuperar_items`, con la contraseña de la estancia).
* `solicitudes`: una fila por solicitud de transferencia de ganado (`registro_id`, `token` del enlace, `estado` pendiente/aprobada/rechazada, origen y destino con códigos SENACSA, categoría, guías, animales por guía, total y total en letras, naturaleza, fecha, lugar, solicitante, observaciones, `decidido_en`, `aprobador`, `comentario`, `hash_firma` SHA-256, `url_pdf_firmado`/`id_pdf_firmado`). La decisión se toma desde la página web del enlace (`doGet?sol=<token>`, protegida por `CONFIG.CLAVE_APROBACION`); el app consulta el estado con el pedido `estado_solicitud` y descarga el PDF firmado.
* `usuarios` (v4): una fila por persona: `id`, `nombre` (MAYÚSCULAS), `codigo` (6 números, único), `estancias` (separadas por coma, `TODAS` u `Otra`), `rol` (normal / administrador), `estado` (pendiente / aprobado / rechazado / bloqueado), `creado_en`, `aprobado_en`, `ultimo_acceso`, `dispositivo`, `observaciones`. La administración la edita a mano.
* En v4, `registros` suma `creado_por`, `creado_por_id`, `modificado_por`, `enfermedad` y `nros_precinto`; `medicamentos` suma `enfermedad`; `respaldos` suma `usuario_id` y `usuario`; el tipo de evento `descarga_camion` (Descarga de camión, Ypoti) se agrega a los intensivos.
* `escore_heces_baias` (v4.4, Ypoti): una fila por baia evaluada en el escore de heces: `registro_id`, `estancia`, `fecha_evento`, `evaluador`, `baia` (A01…U10), `linea`, `nro`, `dieta` (adaptacion / crecimiento / terminacion), `dias_cocho`, `ims_pv`, `muestras`, conteos `liquida`/`suave`/`pastosa`/`firme`/`dura`, `nota` (sobre 10: pastosa 1, firme y suave 0,5, dura y líquida 0), `clase` (deseable ≥ 8,5 · atencion 7 a 8,5 · peligro < 7), `ia_leidas`, `ia_iguales`, `inicio`, `fin`, `version`. El pedido `heces_historial` la lee para sugerir las baias del protocolo (3 por línea, rotando semana a semana).
* `escore_heces_muestras` (v4.4): una fila por bosta: `baia`, `n` (1 a 10), `nota_persona`, `nota_fuente` (persona / aceptó la IA), `nota_ia`, `coincide`, `ia_vista` (sí, o "no (a ciegas)" cuando la IA leyó después), `ia_seguro`, `ia_modelo`, `ia_motivo`, `lat`/`lon`/`precision_m` del teléfono al sacar la foto, `hora`, `url_foto` (Drive, carpeta `fotos_escore_heces_<fecha>_<id8>`).
* `log`: historial de cada registro (creado, editado — con el detalle de qué cambió —, autorizado, recibido/actualizado en el servidor), con `version`, `fecha`, `app_version` y (v4) `usuario` que hizo cada paso.

# 5. Archivos en Drive

Dentro de `Banco de datos trazabilidad/<estancia>/`:

* `manejo_<estancia>_<fecha>_<tipo>_<id8>[_vN].pdf` y `.json`: el registro completo (el JSON incluye las fotos en base64; es la fuente de verdad si alguna vez hubiera que reprocesar).
* `manejo_..._ids.csv`: `ide;peso_kg;fuente;raza;sexo;categoria;proveedor;nacimiento;peso_fuente;peso_origen_fecha` (lista final de animales del registro).
* `fotos_manejo_.../`: fotos sueltas en JPG (precintos, guías, animal, botón, nacimiento, acta, imagen satelital).

# 6. Cómo consultar

* **Sheets**: filtros y tablas dinámicas directamente sobre `animales`, `ids_individuales` o `cotas`. Ejemplos: ganancia media por `proveedor` (tabla dinámica sobre `animales`, promedio de `gmd_kg_dia`); animales que entraron con una guía (`ids_individuales` filtrado por `nro_guia`); recorrido de un animal (`ids_individuales` filtrado por `ide`, ordenado por `fecha_evento`).
* **Informe de trazabilidad** desde el app: por estancia y período, con una tabla por tipo de evento y enlaces a fotos e IDE (usa el pedido `consulta` del servidor).
* **Recuperar registros** desde el app (pedidos `recuperar` y `recuperar_items`, con la contraseña de la estancia o la maestra): lista los registros publicados de la estancia en el período (desde `registros`) y las copias de `respaldos`, y devuelve el JSON completo de cada uno leyendo el archivo de Drive (`registros.id_json`, o la URL `url_json` en los registros anteriores a la versión 3.8).
* **Pesos históricos** desde el app (pedido `pesos` del servidor, sin contraseña): recibe una lista de IDE, una fecha y una ventana en días (60) y devuelve, por IDE, el último peso real de báscula dentro de esa ventana (`peso_kg`, `fecha`, `tipo_evento`, `registro_id`). Lo usa el paso de inconformidades para completar animales que pasaron por el bastón pero no por la báscula.
* **R / Python**: exportar las hojas como CSV (Archivo → Descargar) o leerlas con la API de Sheets (`googlesheets4` en R, `gspread` en Python) con la cuenta de servicio que defina TI. Las claves son estables, así que se pueden cruzar tablas sin ambigüedad.
* **Migración a PostgreSQL** (cuando el volumen lo justifique): las hojas se corresponden una a una con tablas. Propuesta de DDL mínima, respetando los nombres de columna:

```sql
create table registros       (id uuid primary key, version int, tipo_evento text, estancia text, fecha_evento date, ... );
create table ids_individuales(registro_id uuid references registros(id), ide text, fecha_evento date, peso_kg numeric, fuente text, ...,
                              primary key (registro_id, ide));
create table cotas           (registro_id uuid references registros(id), nro int, cota_nro text, nro_guia text, ..., primary key (registro_id, nro));
create table camiones        (registro_id uuid references registros(id), nro int, chapa text, ..., primary key (registro_id, nro));
create table faltantes       (registro_id uuid references registros(id), ide text, cantidad int, ...);
create table fotos           (registro_id uuid references registros(id), tipo_foto text, nro int, url text);
create table log             (registro_id uuid, version int, fecha timestamptz, accion text, detalle text);
-- 'animales' no se migra: se reconstruye con una vista materializada sobre ids_individuales
```

La carga puede hacerse con un trabajo programado que lea la planilla (o los JSON de Drive) y haga `upsert` por clave; como el servidor nunca borra filas de `registros` (solo reemplaza por id), la sincronización incremental es directa usando `recibido_en` / `actualizado_en_servidor`.

# 7. Mantenimiento

* **Contraseñas**: de 4 números, una por estancia (más "Otra" para estancias escritas a mano, la maestra y la de aprobación de solicitudes). Viven solo en `CONFIG` del script (el app no las guarda ni lleva sus hash) y las verifica el servidor (`verificar_clave` y en cada pedido), con un límite de `CONFIG.MAX_FALLOS` intentos incorrectos cada 15 minutos por estancia (CacheService). Para cambiar una clave se edita `CONFIG.CLAVES` y se publica una nueva versión del script; no hace falta tocar el app.
* **Actualizar el servidor**: pegar el `.gs` nuevo en el proyecto y publicar con *Implementar → Administrar implementaciones → lápiz → Nueva versión*; la URL `/exec` no cambia, así los teléfonos no necesitan reconfigurarse. Una vez por cambio de permisos, ejecutar `probarConfiguracion` desde el editor.
* **Actualizar el app**: reemplazar `index.html` y `sw.js` en el repositorio de GitHub Pages. El `sw.js` lleva un número de versión de caché; al cambiarlo, los teléfonos instalados toman la versión nueva la próxima vez que abren el app con señal.
* **Reconstruir `animales`**: función `reconstruirAnimales` en el editor de Apps Script (se ejecuta sola tras cada registro).
* **Corregir un registro**: desde el app, abrirlo, *Editar*, guardar y volver a publicar; el servidor reemplaza la fila y las filas hijas, y anota el cambio en `log`. No conviene editar las hojas a mano, porque la siguiente versión del mismo registro pisaría la corrección.
* **Copias de seguridad**: Drive guarda versiones de la planilla (Archivo → Historial de versiones). Además, cada registro existe como JSON en Drive, así que la planilla entera puede regenerarse reprocesando los JSON si hiciera falta.
* **Límites conocidos**: Sheets admite hasta 10 millones de celdas; `ids_individuales` crece unas 300 filas por camión cargado, por lo que hay margen para varios años. El tiempo de respuesta del servidor crece con el tamaño de `ids_individuales` (reconstruye `animales` en cada envío); cuando pase de ~200 000 filas conviene pasar esa reconstrucción a un trabajo programado o migrar a PostgreSQL. El servidor usa un bloqueo (`LockService`) para que dos teléfonos no escriban al mismo tiempo.

# 8. Identificadores y convenciones

* `id` de registro: UUID generado en el teléfono; único en toda la base; aparece en el nombre de los archivos (primeros 8 caracteres).
* `ide`: identificación electrónica de 15 dígitos (`600 010001073200` → `600010001073200`). El app acepta cualquier archivo de balanza y solo usa las columnas IDE y peso (y, si existen, raza, sexo, categoría, proveedor y nacimiento).
* `version`: empieza en 1 y sube con cada edición publicada.
* Estancias: Ypoti, Ybypora, Cafetalera, La Esperanza, Santa Clara, Lusipar, Oro Verde, Santa Maria, Cielo Azul, Bella Vista, Cerro Memby y "Otra" (nombre libre, escrito por el capataz).
* Tipos de evento y su significado para el stock: `entrada*` suma, `salida` resta, `mortalidad` resta, `nacimiento` suma, `pesaje` y `perdida_boton` no mueven stock.
