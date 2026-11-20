# Registro de manejo · Rural Bioenergía / Ypoti — versión 4.15.0

App offline para el registro diario de manejo. Módulos de pasto: entrada pasto, salida de animales, mortalidad, nacimiento, pesaje de auditoría, pesaje simple, aplicación de medicamento y pérdida de botón electrónico. Módulos de intensivo (solo Ypoti): entrada RIP, entrada confinamiento, descarga de camión, salida a faena, informe Padroniza y escore de heces.

Abrir en el celular: https://lucasmoller9646.github.io/registro-manejo/ y agregar a la pantalla de inicio.
La URL del servidor y el correo de trazabilidad ya vienen configurados dentro del app: no hay que configurar nada en cada teléfono.

## Novedades 4.15.0

- **Plan de suplementación** (🌾 en el inicio; lo ven el capataz y la administración, no el tratorista). Por estancia: los suplementos que hay, con su dosis (g por 100 kg de peso vivo por día) y los kg de la bolsa; y para cada lote del ControlPasto, el suplemento y cada cuántos días se carga el comedero. El lote se sigue por el ControlPasto: si cambia de pasto, el plan y el aviso dicen el pasto nuevo.
- **Tratorista:** en el Registro de trato aparece «📋 Hoy toca» con los pastos del día (y los atrasados). Al tocar uno se completan el lote, las cabezas, el peso, el suplemento, la dosis y los días; el app calcula los sacos. Si pone más o menos, dice para cuántos días alcanza y cuándo vuelve a tocar. **Cada mañana** (06:00, se cambia en el plan) le llega un **WhatsApp** con todos los pastos que tocan ese día y un PDF con la lista.
- **Informe «Consumo de suplemento»** (Generar informes): por lote (kg, bolsas, g por cabeza por día y g/100 kg reales al lado de lo planeado), por suplemento, por bolsa y cada trato. PDF y Excel.
- **Pegar fotos:** en todos los lugares de foto se puede pegar una foto copiada: en la computadora con Ctrl+V (va al lugar de foto que se tocó último) y en el celular con «📋 Pegar foto copiada».
- **Lectura de fotos por la IA:** la IA recibe la foto sin girar (antes las fotos apaisadas le llegaban de costado) y en mejor calidad; si el modelo rápido no lee, prueba con el más capaz. El botón: lee los dígitos aunque no se vea la palabra SIAP o falten los primeros, y el app completa el número con los brincos activos de la estancia. La chapa: busca la placa y no confunde el número pintado en el camión.
- **Precinto solo en el traslado entre estancias de la empresa** (sale de una recría nuestra y entra en otra). Entradas y salidas preguntan de dónde vienen / a dónde van (se completa sola con la COTA); en compras, ventas y faena solo la chapa y, opcional, la foto del camión.
- **Guías (COTA):** primero el QR; si no se lee, la IA saca los datos de esa misma foto de la COTA (sin pedir otra); si tampoco, a mano. La COTA resuelta queda como una tarjeta chica de una línea (✅ QR, 🤖 IA, ✍️ a mano): con 10 camiones y 10 guías no se confunden.
- **Entrada pasto** sin lote ni pasto.
- **Pérdida de botón:** se escribe el número del botón nuevo y el app sabe que es el mismo animal (el botón nuevo sigue con toda la historia; buscar el número viejo avisa por cuál se cambió). La foto es opcional.
- **Informe de trazabilidad:** stock inicial y final del ControlPasto, con entradas, salidas y muertes del ControlPasto al lado de las de los registros del app, y lo que no cierra.
- **Escore de heces también en la RIP:** dieta «RIP» con el piquete como en el Bovino.OS (ej.: PC01A).
- La curva de consumo de la guía del confinamiento ya funciona con los datos del ypoti-integracao (paquete 2026-11-20a).

## Novedades 4.14.0

- **Diseño para computadora y tablet grande.** En pantallas de 900 px o más el app se arma solo en dos columnas: a la izquierda las acciones (Nuevo registro, Informes…), a la derecha la lista de registros. Las opciones de cada registro (Editar, PDF, Borrar…) aparecen al pasar el mouse, sin deslizar. Los formularios se centran y las fichas de registro se ven en 3 o 4 columnas. En los mapas (guía de la estancia, guía del confinamiento) el mapa ocupa la pantalla y la ficha va en una columna a la derecha. En ⚙ Configuración › **Pantalla** se elige Automático, Siempre como en el celular o Siempre como en la computadora.
- **Buscar un animal** ya no se queda en «Buscando…»: el servidor lee solo la columna necesaria, el app muestra los segundos que lleva, corta a los 3 minutos con «↻ Intentar de nuevo» y dice cuánto tardó el servidor.
- **Animal muerto en la base:** al escribir el brinco de un animal que figura muerto (en cualquier registro), aparece un aviso con la fecha y la causa, y se elige **Corregir el número**, **Seguir igual** (queda anotado en el registro) o **Cancelar el registro**.
- **Última medicación:** en la aplicación de medicamento, al escribir el brinco se ve la última medicación de ese animal (cuándo, qué, cuánto y quién). En rojo si fue hace 7 días o menos.
- **Stock de la farmacia:** al elegir el medicamento se ve cuánto hay en la farmacia de la estancia, para cuántos días alcanza, cuánto usa esta aplicación y cuánto queda, el lote que vence primero y si hay pedido en camino. Necesita la API del app de la farmacia (pedido en `pedido_api_farmacia.md`) y las propiedades del script `FARMACIA_API_URL` y `FARMACIA_API_TOKEN`. Sin ellas no se muestra nada.
- **Informe de sanidad y mortandad:** el informe sanitario y el de mortandad son ahora uno solo, en el app (PDF con las dos partes y el Excel) y en los envíos automáticos.
- **Informe de trazabilidad:** cada registro tiene un ícono con el enlace al PDF en el Drive.
- **Guía del confinamiento:** la ficha de cada lote muestra la **curva de consumo** (en % del peso vivo o kg MS/cab), con las franjas de la dieta, el mínimo de 1,8 % PV en terminación (días debajo en rojo) y las curvas esperada y posterior, como en el ypoti-integracao. Llega cuando el app de integración mande los campos nuevos (`pedido_app_integracao_curva_consumo.md`). Además, el mapa se vuelve a encuadrar cuando llegan los datos.
- **WhatsApp de cada usuario:** se pide al pedir el código y, para los usuarios que ya existen, la primera vez que abren el app (se cambia en ⚙ Configuración). Cada usuario puede programar **sus propios informes por WhatsApp** (📬 Mis informes por WhatsApp), solo de sus estancias.
- **Envíos automáticos:** la pantalla muestra «Cargando los envíos programados…» con los segundos, y mientras tanto muestra lo último guardado.

## Novedades 4.13.4

- **Envíos automáticos:** la pantalla ya no se traba con «undefined is not an object (evaluating 'E.whatsapp.token')». Si el servidor responde sin el estado del WhatsApp o sin la lista de envíos, el app lo dice con claridad (y muestra qué llegó), en vez de cortar.
- El servidor informa su versión en `ping` y en el estado de los envíos (`servidor: v4.13.4`).
- **Informe automático de mortandad completo** (también el de todas las estancias): proyección de 12 meses en los indicadores (con el color de la meta), gráfico de la mortandad mes a mes del ControlPasto con los colores de la meta, gráfico de estacionalidad, muertes por raza, animales muertos que habían recibido medicación y **mapa satelital por estancia** con cada muerte numerada como en la lista (columna «Mapa»): rojo evitable, naranja inevitable, violeta evitable con 60 días o menos desde la llegada. El mapa usa el servicio Maps de Apps Script: la primera vez puede pedir autorización (ejecutar cualquier función a mano en el editor).
- **Archivos de báscula:** las líneas de título antes de los encabezados (ej.: «PESAJE DE LLEGADA - CAMION 1») ya no hacen perder la columna del peso; y si el peso promedio no tiene sentido (más de 1.500 kg o menos de 15 kg) el app avisa (báscula que guardó el peso sin la coma).

## Novedades 4.13.3

- **Máquinas del diesel con buscador.** La máquina ya no se elige en una lista cerrada: se escribe parte del nombre, el número interno o la norma de reparto (por ejemplo «hilux 2023», «6135», «pala», «6.10») y la lista se va filtrando; se toca la máquina para elegirla. Vienen en el app las **182 máquinas de Logística** (normas de reparto del SAP, lista del 19/11/2026), así funciona sin señal. Arriba salen las del SAP de esa estancia y las que tienen la estancia en el nombre (YPOTI, LUSIPAR, STA CLARA…). Si no está, la última opción es **➕ Otra máquina: «lo escrito»**.
- En ⚙ Parámetros › Máquinas hay una opción **Todas las estancias** para sumar máquinas que valen en todas (hoja `maquinas`, estancia `*`).
- Se corrigió el selector «Carga a máquina / Entrada al tanque», que se veía aplastado arriba del formulario.

## Novedades 4.13.2

- **Diesel: entrada al tanque.** El módulo ⛽ Diesel tiene ahora dos opciones arriba: **Carga a máquina** (como antes: máquina y fotos del reloj) y **Entrada al tanque** (cuando llega el camión cisterna). En la entrada se saca la foto de la **nota de remisión o de la factura**; con señal, la IA lee el tipo de documento, el número, el proveedor, la fecha y los litros, y los deja escritos para revisar. Sin señal se escriben a mano. Obligatorios: foto, tipo, número y litros (hasta 60.000 L). En la hoja `diesel`: columnas `movimiento`, `documento_*`, `proveedor`, `tanque`, `url_foto_documento`; si el mismo documento del mismo proveedor ya estaba cargado, `documento_repetido` dice cuál.
- **Meta de mortandad: 1,10 % a 1,30 % al año.** En el informe de mortandad (PDF del app y envío automático) y en el informe sanitario: **rojo** arriba de 1,30 %, **verde** debajo de 1,10 %, **ámbar** dentro de la meta. La proyección de 12 meses y los últimos 12 meses del ControlPasto van en color; la meta del período es proporcional a los días (0,09 % a 0,11 % por mes); el gráfico mensual tiene las dos líneas de la meta.

## Novedades 4.13.1 (solo el servidor .gs)

Pedido del app de compras (19/11/2026), para que el cierre de la compra tenga la quiebre aunque el gado se pese otro día:

- **Peso de llegada desde un pesaje posterior.** Cuando la entrada vinculada a una orden no tiene peso (solo bastón en la llegada), el servidor busca la primera pesada posterior de esos mismos IDE en un pesaje simple o de auditoría, hasta 15 días después de la llegada, y pone el peso medio en `llegadas`. Columnas nuevas en `llegadas` (y en `compras_vinculos`): `peso_llegada_fuente` (balanza_llegada o pesaje_posterior), `fecha_pesaje_llegada`, `registros_pesaje` (ids de los registros de pesaje usados, separados por coma) y `cabezas_pesadas`. Con peso posterior `quiebre_pct` queda vacío: la recuperación de peso la descuenta el app de compras con los pesos individuales de `ids_individuales`. Se recalcula hasta 30 días después de la llegada (por si el pesaje se carga tarde). En BD COMPRAS, W se llena con ese peso solo si está vacío.
- **Raza vista en la llegada.** Columnas `raza` (Zebu, Híbrido o Mezclado) y `raza_fuente` en `llegadas`: la que elige el capataz en la entrada pasto (Cebú → Zebu, Híbrido, Mixto → Mezclado); en entrada RIP y descarga de camión, la del archivo de la báscula si trae raza (80 % o más de una clase; si no, Mezclado).
- Las columnas que lee el app de compras no cambian de nombre.

## Novedades 4.13.0

- **Integración con el app de compras de ganado** (Orden de compra de ganado):
  - al cargar una entrada (entrada pasto, entrada RIP, descarga de camión), la revisión muestra la orden de compra de ese camión: proveedor, intermediario, cabezas compradas contra contadas y peso de compra contra peso de llegada (quiebre). Se encuentra por el número de COTA o de guía; si no, como «probable» por destino, propietario de la COTA y fecha. Se puede elegir otra o marcar «No es esta compra»; el registro guarda la orden (datos.compra);
  - cada 15 minutos el servidor lleva la llegada al app de compras: hoja `llegadas` en su base (cabezas, quiebre, muertes en los primeros 60 días) y, en COMPRAS DE DESMAMANTES › BD COMPRAS, la fecha de llegada (K) y el peso promedio de báscula (W), solo si están vacíos. Aquí queda la hoja `compras_vinculos`. Pausar: `COMPRAS_APAGADO = si`.
- **Muertes en los primeros 60 días desde la llegada**: en el informe de mortandad el animal va circulado (en la lista y en el mapa) con el **proveedor** y el **intermediario**; el resumen las cuenta por proveedor y por intermediario y avisa cuando hay más de una del mismo. **No cuentan las inevitables** (rayo, víbora, enroscado en el alambrado…) ni abigeo / faena interna. Proveedor e intermediario: de la orden de compra vinculada; si no hay, del libro de animales, de la planilla de la balanza (columna comisionista) o del SENACSA (vendedor). El informe automático de mortandad trae las dos tablas.
- `pedido_app_compras_llegadas.md`: qué escribe el app de manejo en la base del app de compras y qué conviene mostrar allá.

## Novedades 4.12.1

- Informe de mortandad: los gráficos de barras van en dos columnas (índice estacional | mortandad mensual; por causa | por raza), así el informe ocupa menos páginas.
- El animal que murió después de recibir medicamento se destaca solo en «Ocurrencias» (fondo rojo, con fecha, producto, dosis, enfermedad, quién lo aplicó, días hasta la muerte y la foto del registro de medicamento); ya no hay sección aparte arriba.
- El mapa de la estancia empieza en página nueva cuando no entra entero.

## Novedades 4.12.0

- **Usuario tratorista** (columna `rol` = `tratorista` en la hoja usuarios): en el inicio ve solo 🌾 Registro de trato, ⛽ Carga de diesel y 🗺 Lotes activos (la guía de la estancia con los lotes del ControlPasto). El servidor no le acepta otros registros. Los usuarios normales y los administradores tienen además los dos módulos entre los tipos de registro.
- **🌾 Registro de trato**: el lote se elige en el mapa (o en la lista de lotes activos); con las cabezas y el peso medio del ControlPasto el app calcula los sacos: cabezas × peso medio × gramos por 100 kg de PV ÷ 100 000 ÷ kg por saco, redondeado hacia arriba (por defecto 100 g/100 kg y saco de 25 kg). Los sacos vienen ya cargados y se pueden cambiar con − / +. Toque ✓ Listo y sale solo a la base (hoja `tratos`, con su PDF).
- **⛽ Carga de diesel**: máquina de la lista de la estancia (llega del SAP por el app de integración, o se agrega a mano) u "otra"; foto del reloj del surtidor antes y después; la IA lee los números y el app calcula los litros. Sin señal, se escriben los números a mano y sale después. Hoja `diesel`, con las dos fotos en Drive.
- **⚙ Parámetros** (nueva pestaña de 📬 Envíos automáticos, solo administración): productos del trato (g por 100 kg de PV y kg por saco), máquinas por estancia y clasificación de las causas de muerte (evitable, inevitable, sin determinar, no es muerte).
- **Informe de mortandad por intervalo de fechas** (atajos: mes pasado, este mes, 30 días, 90 días, este año). Nuevo:
  - stock medio del período (ControlPasto, día a día), % de mortandad del período y proyección a 12 meses **con estacionalidad** (índice por mes del año calculado con el historial de muertes del ControlPasto de todas las estancias, ajustado a la estancia cuando tiene historia suficiente) y sin ella; referencia: real de los últimos 12 meses y meta de 1,20 % al año;
  - gráficos: índice estacional, mortandad mensual de la estancia, evitables / inevitables (barra apilada), causas coloreadas por grupo y muertes por raza;
  - **animales que murieron después de recibir medicamento**: sección propia (fecha, producto, dosis, enfermedad, quién, días hasta la muerte y la foto) y la ocurrencia destacada en rojo;
  - abigeo y faena interna no cuentan como muerte en el %.
- **Al cargar una mortalidad**, si el animal había sido medicado, el app lo avisa debajo del botón (con la foto del registro de medicamento), siempre que haya señal.
- **Archivo de la balanza → IA (en el servidor)**: el archivo entero va con el registro; el servidor lo ordena después (disparador de 15 minutos): cada columna a un campo estándar (raza, sexo, categoría, proveedor, guías, potrero anterior, sanidad, precio…), valores de raza, sexo y categoría a una lista estándar, números, fechas e IDE normalizados. Resultado en la hoja `balanza_datos`; completa raza, sexo y categoría vacíos en `ids_individuales`. Las columnas y valores ya vistos quedan en `balanza_columnas` y `balanza_diccionario` (se pueden corregir a mano) y no se le vuelven a preguntar a la IA.
- **Informe automático de mortandad**: también trae evitables / inevitables y la proyección anual.
- **Avisos de cada novedad**: nueva opción "🚜 Trato y diesel" (apagada en los avisos que ya existían, para no mandar un WhatsApp por cada trato).
- **App de integración**: `pedido_app_integracao_maquinas_sap.md` explica cómo mandar la lista de máquinas del SAP (`{tipo:'maquinas_base', token, maquinas}`).

## Novedades 4.11.0

- **📬 Envíos automáticos** (nuevo botón en el inicio, solo para administradores con todas las estancias). Tres pestañas:
  - **Contactos**: nombre, cargo, WhatsApp (con el código del país; un 09… de Paraguay se convierte solo en 5959…), correo, idioma del WhatsApp (español o portugués) y activo/inactivo.
  - **Envíos**: cada envío dice qué informe va, de qué estancias, cada cuánto, a qué hora, para quién y por dónde (WhatsApp, correo o los dos). Se puede editar, pausar, ver la vista previa en PDF y mandar en el momento.
  - **Historial**: los informes que salieron, con el período, los destinatarios, el resultado del WhatsApp y el enlace al PDF en el Drive.
- **Informes que el servidor arma y manda solo** (PDF + correo con el informe en el cuerpo):
  - Informe de mortandad: muertes por estancia y por causa, % sobre el rodeo del ControlPasto contra la meta (0,10 % al mes, proporcional al período), potreros con casos repetidos y cada ocurrencia con enlace al PDF, al mapa y a las fotos.
  - Resumen de manejo: registros por estancia y tipo, entradas y salidas (cabezas, peso, origen y destino), pesajes, inconformidades y borradores abiertos.
  - Informe sanitario: aplicaciones y animales tratados por enfermedad y medicamento; morbilidad y mortalidad por estancia contra la meta.
  - Stock y lotación: cabezas, lotes y UA/ha por estancia (hoy y media de 12 meses), movimientos del mes y del mes anterior, mortalidad de 12 meses y activos en el SENACSA.
  - Confinamiento (Ypoti): cabezas por dueño y por fase, faenas de los próximos 15 días, lotes con la fecha de faena vencida y lotes con riesgo.
  - Pendientes e inconformidades: borradores sin terminar, registros que siguen solo en el teléfono e inconformidades del período.
  - Análisis de la IA: informe gerencial de todas las estancias elegidas (un solo pedido a la IA).
- **Alcance**: todas las estancias o las que se elijan; con varias, un solo PDF (con el detalle por estancia) o un PDF por estancia (en "todas", solo las que tienen datos).
- **Frecuencia**: diaria, semanal (día de la semana), quincenal (días 1 y 16) o mensual (día 1 a 28 o el último), a la hora elegida (hora de Paraguay). **Período**: automático (el día anterior, los 7 días anteriores, la quincena o el mes anterior), acumulado del mes, acumulado del año o últimos 30 días. Stock y confinamiento son una foto del día.
- **Aviso de cada novedad** (en el momento) reemplaza a la lista fija de la 4.10: cada envío de este tipo dice qué estancias, qué novedades (registros guardados, informes PDF del app, importación del SENACSA), quién y por dónde. La primera vez se carga solo con la lista que había (Lucas, Santiago, Ronei y Rodrigo todo; Paulinho solo la Ypoti), así que nada cambia hasta que se edite.
- **Servidor**: nuevo `envios.gs`; hojas `envios_contactos`, `envios_programados` y `envios_historial`. El disparador `procesarEnviosProgramados` (cada 15 minutos) se instala solo al guardar el primer envío; si no se puede, ejecutar `instalarEnviosProgramados`. La cola de WhatsApp ahora lleva los destinatarios de cada aviso (columnas `para` y `correos`) y también manda los correos. El disparador de cada minuto ya no abre la planilla cuando no hay nada nuevo (ahorra la cuota diaria de disparadores).

## Novedades 4.10.0

- **Avisos por WhatsApp** desde el número institucional de la Ypoti (+595 976 218401). Avisa de tres cosas:
  - cada registro guardado en la base, nuevo o editado, con el PDF del registro adjunto (los borradores no avisan);
  - cada informe en PDF que se genera en un teléfono, con el PDF adjunto: trazabilidad, mortandad, sanitario, guía de la estancia, guía del confinamiento e informe de la IA;
  - cada importación del historial del SENACSA, con el resumen.
- **Quién recibe**:
  - Lucas, Santiago, Ronei y Rodrigo reciben todo.
  - Paulinho recibe solo lo de la Ypoti (registros e informes de la Ypoti y la guía del confinamiento).
  - Lucas y Ronei lo reciben en portugués; Santiago y Rodrigo, en español.
  - La lista se cambia sin tocar el código: propiedad `WHATSAPP_DESTINOS` del Apps Script.
- **Cómo sale**:
  - El app nunca espera al WhatsApp: el aviso entra en la hoja `whatsapp_cola`.
  - Un disparador de cada minuto lo manda con los modelos aprobados `manejo_aviso` (texto) y `manejo_aviso_pdf` (con el documento).
  - Reintenta solo los errores pasajeros, durante 48 horas como máximo, y nunca manda dos veces a la misma persona.
  - El teléfono manda solo los informes generados desde que tiene esta versión. Sin señal, los manda cuando vuelve la conexión.
- **Servidor (.gs)**, nuevo archivo `whatsapp.gs`. Una sola vez, en el editor:
  1. Propiedad del script `WHATSAPP_TOKEN` (la pega Lucas).
  2. Ejecutar `crearModelosWhatsApp`.
  3. Esperar con `estadoModelosWhatsApp` a que los modelos queden APPROVED.
  4. Ejecutar `probarWhatsApp` (manda solo a Lucas).
  5. Ejecutar `instalarAvisosWhatsApp` (crea el disparador).
  - Para pausar los envíos: `WHATSAPP_APAGADO = si`.

## Novedades 4.9.1

- **Historial del SENACSA de todas las estancias** (planillas del 09/11/2026: Ypoti, Ypoti 2 / Oro Verde, Lusipar, Santa Clara, Santa Maria, Ybypora, Bella Vista y La Esperanza — 127.533 eventos de 42.939 animales). Cada planilla trae los animales cuyo último establecimiento es esa estancia, con toda su historia (dónde se identificaron y por dónde pasaron); un mismo animal no aparece en dos planillas.
- **Importación de varias planillas a la vez, o directamente el .zip** que manda el SENACSA (Informes › Buscar un animal › Importar). Se manda en tandas de 4.000 filas (unas 32 tandas para todo; el último paso arma el resumen de cada animal).
- Nuevo tipo de evento del SENACSA **Reidentificación** (botón aplicado de nuevo; 20 animales en Bella Vista): cuenta como ubicación y aparece en la historia del animal.
- Servidor más liviano con 43 mil animales: la lista de brincos y la búsqueda leen solo las columnas que usan, y el chequeo de un brinco lee solo su fila.

## Novedades 4.9.0

- **🔎 Buscar un animal** (Informes, para todos los usuarios): se escribe el brinco — los 15 dígitos, la serie y el número SIAP ("SIAP 00015 6338") o los últimos números (si hay varios, se elige de una lista) — y aparece toda la historia del animal: situación según el SENACSA (activo en tal estancia desde tal fecha, faenado en tal frigorífico, dado de baja, en un establecimiento de terceros), dónde se identificó y de quién era, cuándo y de quién se compró, el **mapa "Por dónde pasó"** (estancias de la Rural en su lugar; establecimientos de terceros en el centro del departamento, con línea de puntos, porque el SENACSA no da sus coordenadas; puestos de control de Pozo Colorado, Concepción y Villa Florida), los **pesajes** del app con la ganancia diaria entre uno y otro, y la **historia completa** mezclando los eventos del SENACSA y los registros del app (pesajes, mortalidad, medicamentos, movimientos), cada uno marcado con su fuente. Avisa si el app y el SENACSA no coinciden en la estancia. Sin señal se ven los últimos 30 animales buscados en ese teléfono.
- **Importar la planilla del SENACSA** (solo administradores con todas las estancias, dentro de "Buscar un animal"): el .xls de historial de DIs que entrega el SENACSA, tal cual (el app lee el formato de Excel 97-2003). Se puede importar todas las veces que haga falta: lo que ya estaba no se repite. Primera planilla: Estancia Santa Maria (0101190045), 2217 eventos de 767 animales.
- **Chequeo de los brincos con el SENACSA al cargar un registro**: si el animal, en la fecha del registro, estaba según el SENACSA en otra estancia o en un establecimiento de terceros, o ya había sido faenado o dado de baja, aparece en el campo del brinco ("⚠ Según el SENACSA el 09/11/2026 estaba en Santa Maria…") y como **inconformidad** que hay que justificar para guardar. Vale para mortalidad, pérdida de botón, medicamento, pesajes y salidas; en las entradas (que vienen de otra estancia) solo se controla faena y baja. Tolera 30 días por el atraso de las COTAs. Los animales que no están en el historial importado no se controlan.
- **Ayuda de brincos**: los animales que el SENACSA ubica activos en una estancia se suman a la lista de brincos sugeridos de esa estancia.
- **Servidor (.gs):** nuevo archivo `senacsa.gs` (pedidos `senacsa_importar`, `buscar_animal`, `animal_situacion`) y hojas `senacsa_eventos` y `senacsa_animales` (ver Base_de_datos_trazabilidad.md). Publicar en la misma implementación (Nueva versión).

## Novedades 4.8.0

- **Nuevo informe "🐂 Guía del confinamiento" (solo usuarios de la Ypoti).** En Informes aparece solo para quien tiene permiso para la Ypoti. Abre un mapa **solo de los corrales** (sin pastos), pintado por el criterio elegido (empieza por la fase de la dieta), con la leyenda, el resumen (cabezas, lotes, corrales ocupados), la lista "Para mirar hoy / esta semana" de las señales del Consultor y, al tocar un corral, la ficha de cada lote. El botón **📄 PDF** arma la guía: resumen, mapa pintado, resumen por línea, "para mirar", todos los lotes de los corrales (la celda del corral con el color del criterio) y, aparte, los lotes del Bovino.OS que están en potreros. Sin señal se arma con la última foto guardada en el teléfono.
- **La guía de la estancia (pastura) vuelve a ser solo de pastos:** no mezcla los corrales ni los lotes del Bovino.OS.
- **De cuándo es la foto:** "foto de las 17:16 (hace 20 min)"; si pasan más de 3 horas sin foto nueva, avisa que el app de integración de la oficina (con la VPN del Bovino.OS) no está mandando.
- **Servidor (.gs):** cada foto que llega también se escribe en la planilla del app: pestaña `confinamiento` (la foto de ahora, un lote por renglón) y `confinamiento_envios` (un renglón por envío, para ver que llegan cada hora). El app de integración manda la foto cada hora: ver `pedido_app_integracao_confinamento.md`.

## Novedades 4.7.1 (solo el servidor .gs)

- **Los datos del ControlPasto vuelven a contar.** Desde octubre la API devuelve la operación como **código** (1 entrada, 2 salida, 3 muerte, 4 transferencia, 5 cambio de piquete, 6 pesaje, 8 previsión) y no como texto. El servidor guardaba "3", "4"… y no los contaba: las estancias quedaron sin entradas, salidas, muertes ni transferencias desde el último IAS41. Ahora se traducen los códigos, también en los movimientos ya guardados (no hace falta releer).
- **Nuevo `verApiControlPasto()`** (Ejecutar en el editor): muestra los campos crudos que manda la API y un ejemplo por código, para revisar el piquete y el peso, que en los movimientos nuevos vienen vacíos.

## Novedades 4.7.0

- **El "Mapa de la estancia" de la Ypoti muestra el confinamiento (Bovino.OS).** Arriba del mapa aparecen el botón **🐂 Confinamiento** (lleva a los corrales) y un selector para pintar los corrales con los mismos criterios de "Currais e lotes" del app de escritorio: dueño (boitel × propio), fase de la dieta, cabezas por corral, fecha prevista de faena, señales del Consultor, consumo en % del peso vivo, consumo de MS, lectura de comedero, entrega × previsión, peso estimado y días de comedero (mismos colores y leyenda). Al tocar un corral se ve la ficha de cada lote: cabezas (entradas y muertes), dueño, categoría y genética, dieta y fase, días de comedero, consumo de MS y % del peso vivo, peso estimado y de salida, faena prevista, lectura de comedero y los motivos del Consultor. Los lotes del Bovino.OS que están en pastos de la Ypoti pintan esos pastos y aparecen al tocarlos. Abajo: total de cabezas, lotes y corrales ocupados, y de cuándo es la foto (con aviso si tiene 2 días o más). Sin señal se ve la última foto guardada en el teléfono.
- **De dónde salen los datos:** la API del Bovino.OS solo responde en la red de la Ypoti, así que el app de escritorio **ypoti-integracao** manda una foto de los lotes activos al servidor del app (`ferramentas/enviar_confinamento_app.py --enviar`, o solo cada 2 horas desde el segundo plano si existe la variable `REGISTRO_MANEJO_TOKEN_CONF`). Solo la ven los usuarios con permiso para la Ypoti.
- **Servidor (.gs):** nuevo archivo `confinamiento.gs` incluido en `servidor_apps_script.gs` (pedidos `confinamiento_base` y `mapa_confinamiento`). Crear en Propiedades del script `CONFINAMIENTO_TOKEN` (16 caracteres o más; el mismo valor va en la variable de Windows `REGISTRO_MANEJO_TOKEN_CONF` del PC de la Ypoti). Publicar en la misma implementación (Nueva versión).
- **Informe de mortandad, mapa más limpio (retroactivo, sirve para los informes de octubre):** en las estancias **sin mapa en el app** (Bella Vista, Cerro Memby…), un punto a más de 15 km de la mediana de las demás muertes del mes no se dibuja (se avisa en la lista); las muertes con el **mismo punto** (a menos de 50 m: registradas desde la sede con "Ubicación del teléfono") van como un solo marcador **×N** con una nota; y si la estancia no tiene mapa y todas las muertes tienen el mismo punto, no se dibuja el mapa y se explica por qué.

## Novedades 4.6.5

- **Los informes ya no dejan afuera el último día del período.** La planilla devuelve la fecha del evento como fecha (Date); el servidor la pasaba a texto con la hora ("2026-10-31T00:00:00") y la comparaba con el fin del período ("2026-10-31"): como texto, la primera es "mayor", y todo lo del último día quedaba afuera. Caso real: el informe de mortandad de Lusipar de octubre de 2026 salió con 29 muertes y faltaba la del 31/10 (brinco 05864 7416). Afectaba la consulta de los informes de **mortandad** y de **trazabilidad** (PDF y CSV de brincos) de todas las estancias; el informe de la IA y el sanitario ya comparaban solo la fecha. Ahora se compara solo la fecha.
- **Servidor (.gs):** publicar en la **misma implementación** (Administrar implementaciones › ✏️ › Nueva versión) y volver a generar los informes de octubre que se hayan sacado antes.

## Novedades 4.6.4

- **Informe de mortandad liviano para el teléfono.** En Lusipar, octubre de 2026 (29 muertes, 58 fotos), el servidor mandaba todas las fotos enteras en una sola respuesta de unos 20 MB: en la computadora el informe salía en minuto y medio, pero en el teléfono, con la señal del campo, quedaba en "Generando…". Ahora el servidor manda **miniaturas de Drive de 480 px** (unos 40 KB cada una, pedidas de a 20 en paralelo) y **solo las fotos del mes del informe** (las muertes del mes anterior se usan solo para contar). La respuesta baja a unos 3 MB y el PDF también sale más liviano. Si Drive no entrega la miniatura de alguna foto, esa va entera, como antes.
- **Ubicación de la muerte, controlada al elegir el punto.** El app compara el punto con el mapa de la estancia del registro:
  1. **dentro de la estancia:** todo bien;
  2. **fuera pero cerca** (hasta 3 km del límite): todo bien, con una nota;
  3. **lejos y dentro de otra estancia:** avisa "el punto cae dentro de …" y ofrece **Cambiar la estancia** (si la persona tiene permiso para esa estancia);
  4. **lejos de todas las estancias:** aviso en el momento y, al continuar, una **inconformidad obligatoria**: se puede guardar, pero hay que explicar por qué el punto quedó ahí (por ejemplo, murió en un traslado). La explicación queda en la base (`justificaciones`).
  En los casos 3 y 4 el punto **no se dibuja en el mapa del informe de mortandad** (deformaba el mapa: el caso de Lusipar, octubre de 2026); la muerte sigue en la lista, con "ATENCIÓN: a … km de la estancia". El control se hace al armar el informe, así vale también para las muertes ya cargadas. El registro guarda `ubic_chequeo` (estado, km, otra estancia).
- **Servidor (.gs):** cambia la consulta del informe (`fotos_desde`, `fotos_px`). Publicar en la **misma implementación** (Administrar implementaciones › ✏️ › Nueva versión). Con el app nuevo y el servidor viejo, el informe sale igual que antes (pesado).

## Novedades 4.6.3

- **Un registro que ya está en la base no queda "En cola".** Caso de Lusipar (mortalidad del 31/10/2026, versión 2): el servidor la guardó a las 11:09, con PDF, JSON y fotos, pero el teléfono la seguía mostrando "En cola". Ahora, en cada sincronización, el app compara con la lista de la base: si la base ya tiene esa versión (o una mayor), el registro pasa solo a "En la base" y el historial dice "confirmado al sincronizar".
- **El correo ya no tumba el envío.** El servidor manda el correo al final, cuando el registro, el PDF y las fotos ya están guardados; si el correo fallaba (por ejemplo, por la cuota diaria de correos de Google), respondía con error y el teléfono creía que el registro no había llegado. Ahora responde "guardado" con un aviso, y la falla del correo queda anotada en la hoja `log`.
- **La cola nunca se traba.** Todo pedido al servidor tiene límite de tiempo (si la señal se corta a mitad, el pedido se da por fallido y se reintenta), y si el teléfono no puede guardar (por ejemplo, sin espacio libre) el app lo dice en vez de quedarse esperando.
- **El error queda a la vista.** En la pantalla del registro, debajo de "En cola", aparece "Último intento de envío (hora): motivo", para que quien está en el campo pueda mandar una captura.
- **PDF:** si no se puede generar, la pantalla lo dice con un botón "↻ Intentar de nuevo" (antes podía quedar en "Generando PDF…"); desde la lista, si el teléfono no deja abrir el PDF, avisa que quedó en Descargas.
- **Servidor (.gs):** cambia el envío del correo. Publicar en la **misma implementación** (Administrar implementaciones › ✏️ › Nueva versión).

## Novedades 4.6.2

- **Informe de mortandad: ya no se pierden fotos.** El servidor descartaba sin aviso toda foto de más de 400 KB al armar el informe mensual; las fotos del animal en el pasto, con mucho detalle, pasan de ese tamaño (caso de Ybypora, 17/10/2026: 420 KB), y esa muerte salía solo con la foto del botón. Ahora entra hasta 2,5 MB por foto (30 MB por informe), y el app achica cada foto a 800 px antes de ponerla en el PDF, así el archivo sale más liviano que antes.
- Cada muerte tiene siempre dos lugares, en el mismo orden: **foto del animal** y **foto del botón**. Si una no se puede incluir, en su lugar va un recuadro que dice por qué ("no se cargó", "archivo muy pesado", "no se pudo leer en Drive"…), en vez de desaparecer.
- **Servidor (.gs):** cambia la consulta del informe (`con_fotos`). Publicar en la **misma implementación** (Administrar implementaciones › ✏️ › Nueva versión). Con el app nuevo y el servidor viejo, la foto pesada sigue sin llegar, pero el PDF ya muestra el recuadro.

## Novedades 4.6.1

- **↩ Informar otra … después de guardar.** En la pantalla del registro guardado aparece arriba de todo, a la vista sin bajar, el botón **"↩ Informar otra aplicación de medicamento"** ("otra entrada pasto", "otra mortalidad", "otro nacimiento", etc., según el tipo). Lleva directo al paso 2 de un registro nuevo del **mismo tipo y la misma estancia**, con la fecha de hoy, sin volver al inicio ni elegir de nuevo; en medicamento mantiene la carga simple o masiva. Es el botón principal cuando el registro ya está en la base o en cola para subir solo (también sin señal); si el registro todavía necesita la contraseña de la estancia, "Guardar en Banco de Datos" sigue siendo el principal y el botón va justo debajo. No aparece en la solicitud de transferencia ni al editar.
- **Aplicación de medicamento:** los botones **"➕ Agregar otro brinco"** y **"➕ Agregar otro medicamento"** son más grandes, de ancho completo y con fondo verde, con una línea de ayuda ("otro animal tratado igual" / "a los mismos animales, con su dosis").

## Novedades 4.6

- **🩺 Informe sanitario (morbilidad y mortalidad), en la pestaña Informes.** Reproduce los informes que hoy se arman en la planilla FOCO ("Controle de ronda sanitária" y "Controle de mortes"), por estancia y período, a partir de los registros de mortalidad y de aplicación de medicamento publicados en la base:
  - **PDF:** cuadros de resumen (muertes, % de mortalidad, medicaciones, animales medicados, % de morbilidad); **mortalidad mensual** con gráfico y la meta de 0,1 % por mes; **morbilidad mensual**; causas de muerte, de morbilidad (síntomas) y de medicación; medicamentos usados (aplicaciones, animales y dosis total); corrales con más casos; y al final, apaisadas, las planillas **Controle de mortes** y **Controle de ronda sanitária** con las mismas columnas que FOCO.
  - **Excel (formato FOCO):** hojas `BD Mortes` y `BD Medicações` con las columnas exactas de FOCO (más el IDE completo), para pegar en la planilla de siempre, y hojas de resumen `Mortalidade`, `Morbidade`, `Causas` y `Medicamentos`.
  - **Cómo se calcula (igual que FOCO):** % de mortalidad del mes = muertes ÷ rodeo medio del mes (promedio del stock del 1º del mes y del 1º del mes siguiente, del ControlPasto); medicaciones = eventos distintos (fecha, animal, síntoma); animal medicado (caso nuevo) = primera vez que el animal se trata en el año, contado en el mes de ese primer tratamiento; % de morbilidad = casos nuevos ÷ rodeo acumulado expuesto (entradas del mes + stock inicial del año × días del mes ÷ 365). El rodeo sale del ControlPasto; si no está disponible, el informe sale igual, sin las columnas de %, y lo avisa.
  - La tabla mensual de mortalidad muestra al lado las muertes que registró el **ControlPasto** en el mismo mes (en ámbar cuando no coinciden con el app), para controlar que las dos fuentes digan lo mismo.
- **Datos del animal (opcional) en mortalidad y en medicamento simple:** sexo (macho/hembra), raza (Nelore, Híbrido, Cebú, otra) y, en mortalidad, si se hizo **necropsia**. Nada es obligatorio: si no se cargan, el informe los toma de la hoja `animales` (lo que se sabe del animal por su entrada). El corral es el piquete de "➕ Lote y piquete" y el lugar de la muerte es el pasto donde cayó la ubicación GPS.
- **Planilla de aplicación masiva:** acepta columnas opcionales `Sexo`, `Raza` y `Corral` (y `Síntoma` como sinónimo de enfermedad), así se puede pegar directamente la ronda sanitaria. La planilla modelo ya las trae.
- **Servidor (.gs):** nuevo pedido `informe_sanitario`; columnas nuevas `sexo`, `necropsia`, `lugar_muerte` en `registros` y `sexo`, `raza` en `medicamentos` (se agregan solas al final). Publicar en la **misma implementación** (Administrar implementaciones › ✏️ › Nueva versión): sin eso, el botón del informe sanitario responde que el servidor no conoce el pedido.

## Novedades 4.5

- **Salida a faena (solo Ypoti, tile 🏭 en "Intensivo").** Para el camión que sale del confinamiento al frigorífico:
  - **Camión:** solo la **chapa** (escrita o con 🤖 Leer con foto; esa foto queda como foto del camión). **No se pide la foto ni el número del precinto.** Varios camiones en el mismo registro, como en la salida.
  - **COTA:** el QR de la guía, como en la salida (si no se lee, foto de la guía o Nº de guía).
  - **Animales:** cantidad contada y archivos (solo báscula, o bastón + báscula), con las mismas inconformidades de siempre.
  - **¿De qué baia salen?** La **baia del confinamiento es obligatoria** (el lote Feed Manager es opcional). Se escribe como en el cartel ("c5" queda C-05) o se toca en el **🗺 mapa del confinamiento**. El mismo botón de mapa aparece ahora también en la entrada confinamiento.
  - En la base: `tipo_evento = salida_faena`, grupo intensivo, `piquete` = baia, `origen` "Confinamiento · baia …" y `destino` "Faena"; los animales quedan con estado **"a faena"** en la hoja `animales` (pasan a "faenado" cuando llega el informe Padroniza). El PDF y el correo dicen de qué baia salieron.
- **Servidor (.gs):** reconoce `salida_faena` (intensivo, etiqueta, estado de los animales). Publicar en la **misma implementación** (Administrar implementaciones › ✏️ › Nueva versión).

## Novedades 4.4

- **Escore de heces (solo Ypoti, tile 🔎 en "Intensivo").** Una evaluación es una sesión con varias baias:
  - **La baia** se escribe como en el cartel (F-08, f8, F 08…) o se toca en el **🗺 mapa del confinamiento** (las 210 baias de las líneas A a U, del archivo `linhas_confinamento.geojson`). Con GPS, el app propone sola la baia donde está parado. Se elige la **dieta** (adaptación, crecimiento o terminación); días de cocho e IMS % PV son opcionales.
  - **10 bostas por baia, una foto por bosta** (cámara o galería). La IA sugiere la nota de cada foto con la tarjeta de 1 a 5 (1 Líquida · 2 Suave · 3 Pastosa · 4 Firme · 5 Dura); la nota queda puesta para confirmar y la persona la cambia con un toque. Cuando la persona no coincide con la IA, la bosta queda marcada.
  - **Nota de la baia** igual que la planilla: pastosa suma 1, firme y suave 0,5, dura y líquida 0; sobre 10 bostas, la nota sobre 10. Desde 8,5 es deseable; de 7 a 8,5, atención; abajo de 7, peligro.
  - **✓ Guardar baia y evaluar otra** deja el editor listo para la próxima. Todo queda en el teléfono (las fotos en un almacén aparte, para que el borrador no pese) y **va a la base de datos recién al final**, con ✓ Guardar. El escore no manda borradores a la base.
  - **Protocolo:** el app sugiere 3 baias por línea, intercaladas (una de terminación, una de crecimiento y otra), distintas de las de la semana anterior, y muestra cuántas van de las 63 del día. Es una ayuda: se puede evaluar cualquier baia.
  - **Sin señal:** la IA lee las fotos cuando vuelve la señal; si no alcanzó, las lee el servidor al publicar. Esas lecturas quedan marcadas como **a ciegas** (la persona no vio la sugerencia), que es la comparación limpia.
  - **Al publicar,** las fotos suben a Drive en tandas de 6 (`fotos_escore_heces_<fecha>_<id>`), y después va el registro con el enlace de cada foto.
- **PDF del escore (mejorado respecto a la planilla):** resumen con nota media, deseables / atención / peligro, reparto de las bostas, nota por dieta y **baias para mirar**; tabla **persona × IA**; **mapa del confinamiento con un punto por bosta del color de su nota** y la baia pintada según su estado (un bloque de líneas por página: A a F y G a U); planilla por línea (las baias no evaluadas dicen "No evaluadas esta vez" en lugar de 0,0); y **todas las fotos indexadas** (F-08·1 … F-08·10) con la nota de la IA y la de la persona.
- **Base de datos:** hojas nuevas `escore_heces_baias` (una fila por baia: conteos, nota, estado, coincidencia con la IA) y `escore_heces_muestras` (una fila por bosta: nota de la persona, de la IA, si coinciden, si fue a ciegas, ubicación y enlace de la foto). El correo trae el resumen; si el PDF pasa de 20 MB va solo el enlace.
- **Servidor (.gs):** archivo `heces.gs` (va dentro de `servidor_apps_script.gs`); pedidos nuevos `heces_fotos` y `heces_historial`, y `leer_foto` con clase `heces`. Modelo del escore en la propiedad `ANTHROPIC_MODEL_HECES` (por defecto `claude-sonnet-4-5`). La instrucción de la IA está calibrada con el padrón de este confinamiento (ver *Test_IA_escore_heces_22-10-2026.pdf*). Publicar en la **misma implementación** (Administrar implementaciones › ✏️ › Nueva versión).

## Novedades 4.3

- **Brincos: una sola forma de escribir el número.** Cada persona escribía el botón distinto ("SIAP 00350 8539", "350-8539", "3508539", "600010003508539"). Ahora el app lo corrige solo, sin IA: 15 dígitos quedan como están; 9 dígitos (serie + número del botón) se completan con el prefijo SIAP 600010; 7 u 8 dígitos se completan con ceros; y cualquier terminación que coincida con un solo brinco activo de la estancia se completa con ese brinco. Si no se entiende (por ejemplo, solo "8539" y hay dos brincos que terminan así), avisa y lo guarda tal como se escribió. Vale en mortandad, medicamento (simple y planilla), nacimiento (madre y cría), pérdida de botón y caravanas del acta de no arreados. El registro guarda también cómo se escribió (`nro_boton_escrito`, `brinco_escrito`). **El servidor aplica la misma regla al recibir** cada registro (sirve para teléfonos con versiones viejas). En el Excel del frigorífico la regla es estricta: solo se completan los botones que coinciden con un brinco activo.
- **Varios camiones o guías, solo del mismo origen.** El app lo dice en el formulario y no deja guardar si las guías vienen de establecimientos de origen distintos: hay que hacer un registro por cada origen (si no, no se sabe de qué lugar es cada brinco).
- **Lote del ControlPasto por lista o por mapa, y nunca obligatorio.** En "Lote y piquete" y en el origen de los registros intensivos aparecen primero los botones **📋 Lotes del ControlPasto** (lista con buscador, de los datos del mapa de pastos) y **🗺 Elegir en el mapa**: tocando uno se completan el lote y el piquete. Escribir a mano queda como última opción. El lote y el piquete de origen no son obligatorios en ningún registro; **lo único siempre obligatorio es la baia** (del confinamiento o de la RIP). El lote Feed Manager / BovinOS tampoco es obligatorio.
- **Entrada confinamiento y entrada RIP:** la primera pregunta es "¿A qué lote y baia van?"; después el origen y los animales.
- **Botón de la IA estándar en todo el app:** siempre **🤖 Leer con foto**, del mismo tamaño (chapa, precinto, guía, botón de mortandad, brincos del medicamento). Sin fotos repetidas: la foto que lee la IA queda como foto del registro (la de la chapa es la foto del camión; la del botón en medicamento es la foto del registro).
- **Informe Padroniza (solo Ypoti):** registro nuevo que carga el Excel del frigorífico (secuencia, número de botón, peso de carcasa). Lee la fecha, el frigorífico y la cantidad del encabezado, corrige los botones que coinciden con brincos activos, cuenta los "sin botón" y guarda una fila por animal en `ids_individuales` con `peso_fuente = carcasa` (no entra en la GMD). El animal queda con estado `faenado` en la hoja `animales`.
- **📑 Generar informes** (un solo botón en el inicio) con cinco opciones:
  - **Informe de trazabilidad:** todos los registros de la estancia en el período, con dos botones en la lista: **📄 PDF** y **📊 CSV de brincos** (una fila por animal y por registro). El PDF ya no tiene iconos con enlaces a las fotos.
  - **Informe de mortandad:** como el informe mensual: resumen del mes (muertes, mes anterior, causas con porcentajes, potreros, rodeo del ControlPasto), **mapa de la estancia con un punto por muerte y un color por causa**, cada ocurrencia con sus fotos (botón y animal) y una **conclusión escrita por la IA** (causas, manejo y tratamiento; marcada como texto de la IA).
  - **Informe de pastura:** la guía de la estancia de siempre.
  - **Pedir informe a la IA:** la IA lee los registros del período y escribe un informe gerencial (movimientos, mortandad, nacimientos, sanidad, inconformidades, recomendaciones).
  - **Preguntar a la IA:** una pregunta libre sobre los registros de la estancia en el período; la respuesta en texto (se puede copiar) o en PDF. El app avisa que la IA puede equivocarse.
- **Servidor (.gs):** pedido nuevo `informe_ia` (modelo en la propiedad `ANTHROPIC_MODEL_IA`, por defecto `claude-sonnet-4-5`; se puede poner un modelo más potente); `consulta` devuelve además la lista de IDE (`con_ids`) y las miniaturas de las fotos de mortandad (`con_fotos`); brincos normalizados al recibir. Publicar en la **misma implementación** (Administrar implementaciones › ✏️ › Nueva versión).

## Novedades 4.2.1

- **Ningún registro queda "sin guardar en la base" por error.** Al tocar ✓ Guardar, el registro queda autorizado para publicarse en ese mismo momento. Antes, la ubicación del teléfono podía llegar justo después y pisar esa marca: el registro quedaba en el teléfono con la etiqueta roja "Sin guardar en la base" y no salía solo al volver la señal. Ahora sin señal queda "En cola" y sale solo.
- **Rescate automático:** los registros hechos con la versión 4 que quedaron en esa situación se autorizan y se publican solos en la próxima sincronización (no se tocan los rechazados por el servidor, las solicitudes de transferencia ni los registros de versiones anteriores a la 4).
- La chapa del camión se ve entera (el botón 📷 Leer ya no achica el campo).
- Textos: el aviso de edición dice que la versión nueva va sola a la base; la ayuda de la COTA ya no pide la foto de la guía.

## Novedades 4.2

- **Aplicación de medicamento en otro orden:** primero *simple o masiva*, después **1 · Animales tratados** (botón **📷 Foto** al lado de cada brinco: se saca la foto del botón y la IA escribe el número sola), **2 · Enfermedad** y **3 · Medicamentos aplicados**.
- **Aviso de la IA igual en todo el app:** mientras lee aparece una ruedita con "🤖 La IA está leyendo … en la foto…" (botón, chapa del camión, precinto o guía) y el campo lo dice también; al terminar, "🤖 La IA leyó …: X. Revise: si está mal, corríjalo." El campo queda siempre editable. Se puede seguir completando lo demás mientras la IA lee.
- **La IA sabe que la foto puede estar girada** (de costado, cabeza abajo o espejada) y no inventa números que no se leen. Vale para todas las lecturas.
- **Mortandad:** el orden ahora es foto del botón → foto del animal → causa de muerte → Nº de botón → ubicación. Así la IA va leyendo el botón mientras se completa el resto, y el número aparece escrito solo.
- **Entradas y salidas con báscula:** se elige **Solo báscula** (cuentan todos los animales de la báscula) o **Bastón + báscula** (cuentan los del bastón; la báscula solo da el peso, y los que están en la báscula y no en el bastón no se cuentan).
- **Guía (COTA):** ya no se pide la foto de la primera página. Se lee el QR; **solo si el QR no se puede leer** aparece la opción de sacar la foto de la guía y la IA completa Nº de guía, COTA y cantidad (para revisar). Si la IA tampoco puede, alcanza con escribir el Nº de guía.
- **Raza:** nueva opción **Mixto**.
- Servidor (.gs): instrucciones de la IA para fotos giradas y lectura de la guía. Publicar en la **misma implementación** (Administrar implementaciones › ✏️ › Nueva versión).

## Novedades 4.1.1 (solo el servidor .gs)

- La guía y el mapa de pastos reconocen los nombres que la API del ControlPasto usa para algunas estancias (por ejemplo "Estancia Bella Vista" = Bella Vista; "Lusipar Central" = Lusipar; "YBY PORÃ" = Ybypora).
- El área de pasto de La Esperanza ya no se cuenta dos veces (el mapa trae la pastura y, además, sus divisas): la lotación de La Esperanza queda bien.
- Base de pasto (`pasto_semente.json`): se genera en la computadora, en la carpeta ypoti-integracao, con `python ferramentas/enviar_base_pasto_app.py` después de importar el IAS41 nuevo, y se sube a mano a la carpeta **controlpasto** dentro de la carpeta del app en el Drive. El servidor usa el archivo más nuevo y completa los días siguientes con la API del ControlPasto.

## Novedades 4.1

- **El app se actualiza solo.** Ya no hace falta borrar y volver a instalar el app. La página se pide siempre primero a internet (sin señal se usa la guardada) y el app revisa cada 15 minutos, y cada vez que se abre, si hay una versión nueva en GitHub; si la hay, se recarga sola en un momento seguro (en el inicio o en la pantalla del código, nunca en medio de un formulario: lo escrito ya está guardado) y avisa "App actualizado". Para publicar una versión basta con subir `index.html` y `sw.js` a GitHub (GitHub Pages tarda hasta ~10 minutos en servir los archivos nuevos). Los teléfonos que tienen la 4.0 reciben la 4.1 la segunda vez que abren el app después de subirla; de ahí en adelante, todo es automático.
- **Servidor (.gs):** el app usa siempre la misma dirección del Apps Script, así que lo nuevo del servidor vale apenas se publica, sin tocar los teléfonos, **siempre que se publique en la misma implementación**: Implementar › Administrar implementaciones › ✏️ (editar) › Versión: *Nueva versión* › Implementar. No use "Nueva implementación": cambia la dirección y los teléfonos dejarían de encontrar el servidor.
- **Sin zoom de pellizco en el app** (ni doble toque): la pantalla ya no se agranda sin querer. El único lugar donde se pellizca es el mapa.
- **Mapa nuevo:** el pin queda **fijo en el medio de la pantalla** y se mueve el mapa (arrastrar; tocar un lugar lo trae al pin; pellizcar o + y − para acercar). Los botones (OK, Cancelar, +, −, ◎) quedan siempre a la vista, aunque el navegador muestre sus barras.
- **Mapas de los pastos de cada estancia** (shapefiles de Ypoti, Ybypora, Lusipar, Santa Clara, Oro Verde, Cafetalera, La Esperanza, Santa Maria y Cielo Azul) vienen dentro del app y se ven **sin señal**. En la mortandad se marca el lugar sobre el mapa de pastos (el satélite queda como opción) y el registro anota en qué pasto fue (también con "📍 Ubicación del teléfono").
- **Guía de la estancia:** el botón abre el mapa de la estancia de la persona (la que tiene su ubicación), con el punto azul de dónde está ("Usted está en el pasto A13A"). Con **Lotación hoy** o **Media 12 meses**, cada pasto se pinta según la carga del ControlPasto: azul = sin animales (descansando), rojo = menos de 0,8 UA/ha, amarillo = 0,8 a 1,4, verde claro = 1,4 a 2, verde oscuro = más de 2 (UA = 450 kg). Tocando un pasto se ven sus lotes (cabezas y peso). El PDF de la guía sigue disponible con el botón 📄 PDF.
- **Elegir el pasto en el mapa** en "Lote y piquete" (y en el lote/piquete de origen de la entrada a confinamiento): se pone el pin sobre el pasto y el app completa el **piquete** como lo escribe el ControlPasto y el **lote** que está ahí (si hay varios, se elige; si el ControlPasto todavía no tiene lotes cargados en ese pasto, se anota solo el piquete).
- Servidor: pedido nuevo `mapa_pasto` (lotes por pasto y lotación de hoy / media de 12 meses, con el código del usuario). Los pastos de La Esperanza todavía no tienen nombre en el mapa (solo las divisas): ahí la lotación es de la estancia entera. Ita Vera (otro grupo) y Luna Blanca no entran en el app. Para actualizar los mapas: `python3 tools/shp_a_js.py <carpeta por_camada>` regenera `src/fazendas_geo.js`.

## Novedades 4.0

**Usuarios con código personal**
- **Lo primero que pide el app es el código personal de 6 números** (teclado tipo celular). Cada persona tiene el suyo: por el código el app sabe quién es (el nombre sale solo en "Quién registra") y qué estancias puede elegir. Ya no se piden las contraseñas de 4 números por estancia: ni al guardar, ni en el borrador, ni en el informe.
- **"No tengo código: pedir uno":** la persona escribe su nombre (queda en MAYÚSCULAS), marca las estancias donde hace registros y elige su código. El pedido llega a la hoja **`usuarios`** de la planilla (carpeta compartida del Drive) con estado `pendiente`, y se manda un correo a la administración.
- **Administración en la hoja `usuarios`:** `estado` = `aprobado` / `rechazado` / `bloqueado` (o `pendiente`); `rol` = `normal` o `administrador`; `estancias` separadas por coma (o `TODAS`; `Otra` para retiros y estancias escritas a mano); `codigo` se puede cambiar (la persona entra con el nuevo). También se pueden agregar personas escribiendo una fila nueva. Un código bloqueado o cambiado deja de valer en la siguiente sincronización. Por seguridad, después de 40 códigos equivocados en 15 minutos el ingreso se bloquea 15 minutos.
- **Dos tipos de usuario** (el pedido mencionaba "tres" pero detallaba dos): **normal** — ve y edita los registros de sus estancias (los suyos y los de sus compañeros); **administrador** — ve todas las estancias. Toda edición queda en el log con quién la hizo; en la base hay columnas `creado_por`, `creado_por_id` y `modificado_por`, y el log tiene la columna `usuario`.
- Sin señal se puede entrar con un código que ya se usó en ese teléfono (queda guardado cifrado). Botón **Salir** en el inicio y en Configuración.

**Todo se sincroniza con la nube**
- Con el app abierto, **cada minuto** se sincroniza el teléfono con la nube: sube lo nuevo (registros, borradores, ediciones) y baja lo que cambió. También al tocar **⟳ Actualizar**, al tocar **Borrador** y al **Guardar**.
- **✓ Guardar ya lo manda solo a la base de datos** (sin contraseña); sin señal queda en cola.
- **Lo incompleto también va a la base como BORRADOR**, aunque no se toque "Borrador": mientras se escribe (cada minuto) y al salir del formulario.
- **Si se pierde el teléfono:** en otro, se entra con el código y vuelven solos los registros y borradores de esa persona. Los de los compañeros aparecen en "En la nube · de sus estancias" y se traen con un toque. "Recuperar de la nube" (en Configuración) queda para traer registros más viejos.

**IA para leer fotos** (API de Claude; la clave va SOLO en el servidor)
- **Foto del precinto** (salidas, llegadas a Ypoti, entradas de estancias de la empresa): lee el número y lo anota en el nuevo campo **"Nº de precinto(s)"** del camión (columna `nros_precinto` en registros y `nro_precinto` en camiones).
- **Foto del camión / 📷 Leer** junto a la chapa: lee la chapa y la anota.
- **Foto del botón** (mortandad) y **📷 en cada brinco** (medicamento): lee los 9 números del botón SIAP (ej. "00350 6968") y anota la caravana en el formato de la base: **600010** + 9 números (600010003506968), o el brinco activo de la estancia que termina en esos números.
- Siempre se puede corregir lo que leyó la IA. Para activarla: en Apps Script, **Configuración del proyecto › Propiedades del script › agregar `ANTHROPIC_API_KEY`** con la clave del Claude Console (opcional `ANTHROPIC_MODEL`; por defecto `claude-haiku-4-5`). Para probarla, ejecute `probarIA` en el editor. Sin la clave, el app funciona igual pero no lee las fotos.

**Otros ajustes**
- **Mortandad:** la imagen satelital del PDF ahora muestra un **radio de 3 km** (más cerca, con escala de 1 km). Los registros viejos se rehacen solos al generar el PDF con señal.
- **Ypoti:** "Entrada confinamiento" se separó en dos módulos: **Descarga de camión** (propio/boitel, camiones, precintos, COTAs, cantidad, báscula y bastón; sin lote ni piquete) y **Entrada confinamiento** (propio/boitel, de dónde vienen, animales, **piquete y lote Feed Manager**; sin camión).
- **Medicamento:** se anota la **enfermedad** (lista del protocolo de recría 15/05/2026: neumonía, casco ligera/severa, diarrea, timpanismo, tristeza parasitaria, lesión, polioencéfalo, intoxicación, requema, queratoconjuntivitis ligera/severa, u otra). Al elegirla, **sugiere y carga los medicamentos del protocolo**; con el peso aproximado del animal calcula las dosis por peso (ej. ROFLIN 2 ml cada 15 kg). La planilla masiva tiene la columna opcional "Enfermedad". En la base: columna `enfermedad` en registros y en medicamentos.
- Datos obligatorios: como en la 3.11, si falta alguno se puede seguir, pero hay que explicar cada uno en la página de inconformidades.
- Corrección: un borrador ya enviado a la base ya no borraba la copia del teléfono en la nube.

**Para instalar:** subir `index.html` y `sw.js` a GitHub; pegar `servidor_apps_script.gs` en Apps Script y **Implementar › Administrar implementaciones › Nueva versión**; agregar `ANTHROPIC_API_KEY` en Propiedades del script; crear el primer administrador (pedir un código desde el app y, en la hoja `usuarios`, poner `estado` = aprobado y `rol` = administrador).

## Novedades 3.12

- **Modificar una solicitud de transferencia vuelve a la aprobación.** En una solicitud ya enviada, el botón pasa a ser "✎ Modificar solicitud (vuelve a la aprobación)". Al cambiar la cantidad (u otro dato) y tocar "Enviar solicitud", **no se crea una solicitud nueva**: la misma solicitud pasa a la versión 2, vuelve a "Pendiente" con un enlace nuevo y Ronei recibe un correo "[MODIFICACIÓN de solicitud]" que dice qué cambió (por ejemplo "Total de animales: 100 → 120") y que, si la aprueba, la versión anterior queda cancelada. Mientras tanto sigue valiendo la versión aprobada anterior. El enlace del correo viejo avisa que la solicitud fue modificada y manda a usar el más reciente.
- **PDF firmado con las dos versiones.** Al aprobar la modificación, el PDF firmado trae primero la versión nueva con su firma digital y después la versión anterior con su firma original y un sello grande **CANCELADA** ("Reemplazada por la versión 2, aprobada el …; este documento ya no tiene validez"). Si la modificación se rechaza, la versión anterior aprobada aparece con el sello **SIGUE VIGENTE**. En la hoja `solicitudes` quedan `modifica_version`, `cambios` y `versiones_anteriores` (cada versión con su decisión, firma, PDF y la fecha en que quedó cancelada).
- Hay que subir `index.html` y `sw.js` y pegar el `.gs` nuevo (Nueva versión).

## Novedades 3.11

- **Borrador a la base de datos.** Al tocar "Borrador" el app guarda en el teléfono (como antes) y además pide la contraseña de 4 números de la estancia y manda el borrador a la base de datos. En la hoja `registros` queda una fila con `estado_registro` = **BORRADOR** y la lista de lo que falta en `items_faltantes` (por ejemplo "Falta cargar el archivo de la báscula"), sin PDF ni correo. Así se ve el trabajo del día aunque el CSV de la báscula llegue al día siguiente. Cada vez que se toca "Borrador" se actualiza la misma fila (la contraseña se pide una vez por registro). Sin señal queda "Borrador · por enviar" y sube solo al volver la señal. Cuando se guarda el registro completo, la misma fila pasa a COMPLETO (o COMPLETO CON FALTANTES JUSTIFICADOS) y los archivos del borrador van a la papelera. Los borradores no cambian el estado de los animales (hoja `animales`); sus filas en `ids_individuales` llevan `borrador = sí`. No entran en el informe de trazabilidad (se avisa cuántos hay) ni en "Recuperar de la nube" como registros publicados.
- **Datos obligatorios sin completar → justificación.** Si falta un dato obligatorio, al tocar "Continuar" el app muestra la lista; si se toca "Continuar" otra vez, pasa a la página de inconformidades con una tarjeta por cada dato que falta ("✎ Falta la foto del animal", etc.), con "‹ Volver y completar" y el campo "¿Por qué no se pudo completar?", obligatorio uno por uno. El registro guarda `faltantes` (dato y motivo) y la base las columnas `cantidad_items_faltantes`, `items_faltantes` y `justificacion_faltantes`; el PDF y el correo las muestran. Lo que está mal escrito (números de COTA o guía, chapas o brincos repetidos, totales incoherentes, ubicación fuera del Paraguay) y las preguntas que definen el formulario no se pueden saltar; las solicitudes de transferencia tampoco (van al aprobador).
- **Entrada de un proveedor externo: foto del camión en lugar del precinto.** En las entradas con camión hay una pregunta nueva, "Los animales vienen de: Estancia de la empresa / Proveedor externo", que se completa sola al leer la COTA (si el establecimiento de origen no es de la empresa, es proveedor externo; en confinamiento, el boitel también). De un proveedor externo no se pide el precinto: el lugar de las fotos pasa a ser "Foto del camión (opcional)". En la base: columna `proveniencia` en `registros` y `proveniencia` / `foto_camion` en `camiones`; las fotos van a Drive como `camion1_…`.
- **Guía de la estancia:** si el servidor todavía es el anterior o no tiene la base de pasto, el app ahora dice exactamente qué falta hacer.
- Hay que subir `index.html` y `sw.js` y pegar el `.gs` nuevo (Nueva versión).

## Novedades 3.10.1

- **Mapa de mortandad fijo dentro del Paraguay.** El mapa para marcar dónde está el animal muerto ya no deja poner el punto fuera del país: lo que queda fuera aparece oscurecido y la frontera marcada con una línea amarilla; si se toca o se arrastra el punto hacia afuera, el punto se frena en la frontera (del lado paraguayo) y avisa "El punto tiene que quedar dentro del Paraguay". La vista tampoco se puede llevar fuera del país (el centro queda dentro del rectángulo del Paraguay y el zoom mínimo muestra el país entero). El GPS del teléfono se rechaza si da fuera del Paraguay (pide marcar el punto en el mapa), y al guardar se valida de nuevo. Se toleran 1,5 km de la línea porque el contorno es aproximado en los ríos de frontera.
- Hay que subir `index.html` y `sw.js` (el servidor no cambia).

## Novedades 3.10

- **🗺 Ver guía de la estancia** (debajo de "Informe de trazabilidad"). El capataz elige la estancia y el app arma un PDF con los animales a pasto según el ControlPasto: cabezas, UA, área y carga de hoy (UA/ha) con la media de 12 meses; entradas, salidas y muertes del mes y mortandad de 12 meses; el **mapa de carga por potrero** hoy y la media de los cierres de 12 meses (azul descansando; rojo hasta 0,5; naranja 0,5–1; amarillo 1–1,5; verde 1,5–2; verde oscuro más de 2 UA/ha); la carga mes a mes con la media del grupo y las cabezas; la tabla por potrero con los lotes de hoy; entradas/salidas/mortandad de 6 meses y los últimos movimientos del ControlPasto. Es la misma cuenta del app de escritorio (lotacao_pasto_*.pdf): para Ypoti al 15/10/2026 da 7.260 cabezas, 5.065 UA, 3.816 ha, 1,33 UA/ha hoy y 1,76 de media. Lusipar sale con una sección por fazenda del ControlPasto (Lusipar, Lusipar 1 y Lusipar 2); las estancias sin mapa (Santa Maria, Bella Vista, Cerro Memby, La Esperanza) traen la tabla de potreros ocupados. No pide contraseña: solo lee. La guía queda en la lista del teléfono para abrirla sin señal (la nueva reemplaza a la anterior de la misma estancia); sin señal queda pendiente y se arma sola al volver.
- **Dónde están los datos.** El servidor guarda una base de pasto en el Drive del app (carpeta `controlpasto`): los cierres mensuales de stock por lote (IAS41), los movimientos de los lotes y los mapas de los potreros. Se carga con `pasto_semente.json`, que genera el app de escritorio (`ypoti-integracao/ferramentas/enviar_base_pasto_app.py`; con `--enviar` la manda directo con la clave maestra) — repetir cada vez que se importa un IAS41 nuevo. Encima, el servidor lee la **API del ControlPasto** cada 6 horas (desde el último movimiento menos 15 días) y reemplaza, por estancia, el tramo que la API devuelve.
- **Credenciales del ControlPasto fuera del código y de GitHub.** Van en el proyecto de Apps Script › Configuración del proyecto › Propiedades del script: `CONTROLPASTO_USUARIO` y `CONTROLPASTO_CLAVE` (opcional `CONTROLPASTO_URL`). Nadie que use el app las ve ni las escribe. Probar con Ejecutar › `probarControlPasto` (muestra las estancias que ve ese usuario) e instalar la lectura automática con Ejecutar › `instalarSincronizacionPasto` (una vez).
- Hay que subir `index.html` y `sw.js`, pegar el `.gs` nuevo (Nueva versión), cargar las propiedades y mandar la base de pasto.

## Novedades 3.9.1

- **Varios medicamentos y varios brincos en la carga simple.** Cuando un animal enfermo recibe más de un remedio, o el mismo tratamiento se da a varios animales a la vez, ya no hace falta un registro por cada uno. En "Aplicación de medicamento → Carga simple" hay dos listas, igual que los camiones: **+ Agregar otro brinco** (una fila por animal, con la misma sugerencia de brincos activos y ✕ para quitar) y **+ Agregar otro medicamento** (un bloque por remedio, con su dosis y unidad, y ✕ Quitar). Abajo aparece el resumen "Se van a registrar 6 aplicaciones: 3 animales × 2 medicamentos. Cada animal recibe todos los medicamentos de la lista."
- El registro guarda una aplicación por cada combinación brinco × medicamento (`datos.aplicaciones`), así que la hoja `medicamentos` y el historial de cada brinco salen igual que antes, sin cambios en el servidor. La revisión, el PDF (con la tabla de detalle y la foto, si hay) y la lista del inicio muestran los animales y los medicamentos. Se avisa si un brinco o un medicamento está repetido; los bloques de medicamento que quedaron vacíos se ignoran.
- Para planillas grandes sigue estando la carga masiva. Hay que subir `index.html` y `sw.js` (el servidor `.gs` no cambia).

## Novedades 3.9

- **Contraseñas de 4 números con teclado tipo celular.** Todas las contraseñas (las de cada estancia, la de "Otra", la maestra y la de aprobación de solicitudes) pasan a ser de 4 números. Al pedirlas, el app abre un teclado numérico grande (1–9, ⌫, 0, ✓) con 4 puntos que se van llenando; al tocar el cuarto número se envía sola. Lo usan "Guardar en Banco de Datos", "Enviar solicitud", el informe de trazabilidad y "Recuperar de la nube"; la página de aprobación de Ronei también tiene el mismo teclado.
- **El app ya no lleva las contraseñas.** Antes el app traía el SHA-256 de cada contraseña para avisar al instante si era incorrecta; con 4 números eso permitiría descubrirlas en segundos, así que ahora las verifica el servidor (pedido `verificar_clave`): con señal, el teclado avisa "Contraseña incorrecta" y se vacía; sin señal, la acepta, el registro queda en cola y, si al sincronizar el servidor la rechaza, sale de la cola y queda anotado en el historial para volver a pedirla.
- **Límite de intentos.** El servidor cuenta las claves incorrectas: después de 8 en 15 minutos bloquea esa estancia (o la maestra, o la de aprobación) durante 15 minutos (`CONFIG.MAX_FALLOS`).
- Las claves nuevas están en `contrasenas_por_estancia.txt` (no subir ese archivo a GitHub). Hay que subir `index.html` y `sw.js`, pegar el `.gs` nuevo con **Nueva versión** y avisar a cada capataz su clave nueva: las anteriores dejan de funcionar en cuanto se publica el servidor.

## Novedades 3.8.2

- **Sugerencia de brincos activos.** En mortalidad (Nº de botón) y en la carga simple de medicamento (brinco), al escribir 3 o más números el app sugiere los brincos activos de la estancia que contienen esos números (primero los que terminan así), con lote y categoría; al tocar uno se completa el número y aparece "✓ Brinco activo en …". Si el número no está en la lista, se avisa y se guarda igual. La lista se baja del servidor (pedido `brincos`) y queda guardada en el teléfono, así también funciona sin señal (se actualiza cada 6 horas con señal). Fuente: hoja `animales` (estado activo y estancia actual) más una hoja opcional **`brincos_activos`** (columnas `ide`, `estancia`, `lote`, `categoria`) que se puede llenar con una exportación del stock de ControlPasto o SIGOR para cubrir los animales que todavía no pasaron por el app. El registro de mortalidad guarda `datos.boton_en_base` (true/false). Hay que pegar el `.gs` nuevo (Nueva versión).

## Novedades 3.8.1

- Solicitud de transferencia: **origen y destino son cajas de selección** (estancias de la lista u "Otra…"), cada una con su **código SENACSA a la derecha**, que se completa solo y queda bloqueado cuando la estancia está en la tabla de códigos; si no está (Cafetalera, Cerro Memby, Cielo Azul u "Otra…"), el código se escribe a mano.

## Novedades 3.8

- **Nada se pierde al cerrar el app.** Todo lo que se escribe en un registro se guarda solo en el teléfono (cada 2 segundos, al tocar "⌂ Salir", al salir por la casita de arriba y cuando el app pasa a segundo plano o se apaga la pantalla), incluidas las fotos, todos los camiones, las COTAs, los archivos de bastón y báscula, la ubicación del mapa y las decisiones del paso de inconformidades. Ya no hace falta tocar "Borrador": el botón pasó a llamarse **⌂ Salir** y arriba del formulario una línea confirma "✓ Guardado en el teléfono hh:mm · ☁ copia en la nube hh:mm". Las ediciones de registros ya guardados también se guardan solas, aparte del registro original: si se cierra el app a mitad de una edición, el registro avisa "Seguir la edición sin terminar" (con opción de descartarla).
- **Copia en la nube y "☁ Recuperar registros de la nube".** Los borradores, los registros terminados que todavía no se publicaron y las ediciones en curso se copian solos al servidor cuando hay señal (nunca la contraseña). Si se reinstala el app, se cambia de teléfono o se borran los datos del navegador, el botón **☁ Recuperar registros de la nube** del inicio (también en Configuración) pide estancia, período y contraseña de la estancia, muestra cuántos registros hay en la base y cuántas copias, y trae a este teléfono lo que falta: los registros publicados (con fotos, desde el JSON guardado en Drive) y las copias de borradores y registros sin publicar, cada uno en su versión más nueva. "Todas las estancias" funciona con la clave maestra. Borrar un borrador del teléfono borra también su copia en la nube; al publicar un registro, su copia se borra sola porque ya está en la base.
- **Más simple para el campo.** Inicio con tres botones cortos (Nuevo registro, Informe de trazabilidad, Solicitud de transferencia) y "Recuperar de la nube"; exportar/importar JSON pasó a Configuración. Mosaicos con íconos grandes (🚚 entrada, 🚛 salida, ✝️ mortalidad, 🐮 nacimiento, ⚖️ pesajes, 💉 medicamento, 🏷️ botón, 🌱 RIP, 🏠 confinamiento), letra un poco más grande, las explicaciones largas plegadas en un botón "ⓘ Ayuda", **lote y piquete** (opcionales) plegados y al final del formulario, y en la pantalla final los archivos PDF/JSON dentro de "📎 Archivos".
- **Mapa de mortalidad.** Se arrastra el **punto rojo** hasta el lugar (o se toca el mapa para ponerlo ahí; arrastrar fuera del punto mueve el mapa) y se aprieta **✓ OK, abajo a la derecha**; "✕ Cancelar" quedó abajo a la izquierda y "Satélite" arriba. Se quitó la opción de escribir coordenadas a mano.
- Servidor 3.8: nuevos pedidos `respaldo`, `borrar_respaldo`, `recuperar` y `recuperar_items`; hoja **`respaldos`** y carpeta de Drive `respaldos_telefonos` (un JSON por registro, se sobrescribe en cada copia); columna `id_json` en `registros` (los registros anteriores se encuentran por la URL del JSON). Hay que pegar el `.gs` nuevo y crear una **Nueva versión** de la implementación.

## Novedades 3.7.1

- Tabla completa de **códigos SENACSA** de los establecimientos propios (Ypoti 0103780002, Oro Verde 0103780080, Lusipar 0210150003, Santa Clara 0210150007, Santa Maria 0101190045, Ybypora 0107240013, Bella Vista 0107120040, La Esperanza 1302220001): la solicitud de transferencia precarga el código al elegir origen o destino, y en las COTAs leídas por QR el app muestra el nombre de la estancia junto al código de origen y destino (panel, revisión y PDF). Cafetalera, Cielo Azul y Cerro Memby no tienen código cargado todavía: se escribe a mano.

## Novedades 3.7

- **Solicitud de transferencia de ganado** (botón propio en el inicio, debajo de "Nuevo registro" y "Generar informe"). Reemplaza la planilla de papel "Declaración de traslado de stock de animales": estancia de origen, categoría, establecimiento y código SENACSA de origen y destino (Santa Maria y Ypoti vienen precargados), cantidad de guías, animales por guía, total (calculado y en letras), naturaleza de la operación, lugar de firma y observaciones. Al final, el botón **"Enviar solicitud"** (con la contraseña de la estancia) guarda el pedido en la base de datos y el servidor manda un correo a Ronei Barrios (`CONFIG.APROBADOR`, roneizoo@gmail.com) con los datos y un **enlace de aprobación**. El enlace abre una página que pide la contraseña de aprobación (`CONFIG.CLAVE_APROBACION`, ver `contrasenas_por_estancia.txt`), muestra los datos y permite **aprobar o rechazar con un comentario**; al decidir, el servidor genera el **PDF firmado digitalmente** (sello con nombre, fecha, comentario y código de verificación SHA-256), lo guarda en el Drive de trazabilidad junto a los demás PDF, lo ofrece para descargar en esa misma página y avisa por correo.
- En el teléfono, la solicitud aparece en "Registros en este teléfono" con estado **Pendiente** (gris), **Aprobada** (verde) o **Rechazada** (rojo); el estado se actualiza solo (con señal, cada 5 minutos y al abrir la solicitud) o con "Consultar estado". Una vez decidida, el usuario puede descargar el mismo **PDF firmado** desde el teléfono. En lugar de "Generar archivos y compartir", la solicitud ofrece **"Mensaje para WhatsApp"**: un texto ordenado con emojis, los datos del pedido y el enlace para el aprobador (se copia o se abre directo en WhatsApp).
- **Estética** renovada al estilo del Simulador Trava do Boi: tipografías Archivo (títulos, botones, mosaicos) e IBM Plex Sans / Plex Mono (texto y números), tarjetas planas, etiquetas en mayúsculas pequeñas, pastillas de estado monoespaciadas, segmentos tipo pestaña y modo oscuro verde profundo; todo sobre la paleta del logo YPOTI.
- Servidor 3.7: hoja **`solicitudes`**, pedido `estado_solicitud`, página de aprobación (`doGet?sol=<token>`, funciones `verSolicitud` / `decidirSolicitud`), `CONFIG.APROBADOR`, `CONFIG.CLAVE_APROBACION` y `CONFIG.EMPRESA`. Hay que pegar el `.gs` nuevo y crear una **Nueva versión** de la implementación (acceso "Cualquier persona", como hasta ahora, para que el enlace funcione sin cuenta de Google).

## Novedades 3.6.1

- **Estética con el logo YPOTI** y paleta derivada del logo: verde institucional `#04522B` (marca, botones, barra de pasos) y bordó `#701E0C` (acento, mortalidad, alertas), fondos crema y modo oscuro ajustado (logo en versión clara). El logo va en la cabecera del app, en el ícono de la pantalla de inicio (`manifest.webmanifest`) y en la cabecera de todos los PDF. Para que el teléfono tome el ícono nuevo hay que subir también `manifest.webmanifest`.

## Novedades 3.6

- **Aplicación de medicamento** (nuevo tipo `medicamento`, grupo pasto). Lo primero que pregunta es **carga simple o carga masiva**.
  - *Carga simple*: brinco del animal (obligatorio), medicamento (al escribir se filtra la lista de 183 artículos veterinarios del depósito — `ARTICULO_VETERIANRIA_RURAL.xlsx`, embebida en el app; si no está, se guarda el nombre tal como se escribió y queda marcado "fuera de la lista"), dosis aplicada (número) y unidad (un., L, ml, g, mg, µg); foto opcional.
  - *Carga masiva*: botón **"Descargar planilla modelo (Excel)"** (genera un `.xlsx` con las columnas Brinco · Medicamento · Dosis · Unidad, más las hojas "Medicamentos" con la lista del depósito y "Unidades"), se completa en Excel y se carga con **"Cargar planilla"** (`.xlsx` o `.csv`). El app valida fila por fila (brinco y medicamento obligatorios, dosis numérica, unidad válida — acepta variantes como "un", "lt", "cc", "mcg") y no deja continuar mientras haya filas con error. Sin foto.
  - El registro guarda `datos.aplicaciones[]` (brinco, medicamento, `codigo_articulo`, `en_lista`, dosis, unidad), `cantidad_animales`, `medicamentos`, `fuera_de_lista`. PDF con tabla de aplicaciones; informe de trazabilidad con tabla propia.
  - Servidor 3.6: nueva hoja **`medicamentos`** (una fila por aplicación, con código de artículo y si estaba en la lista), una fila por animal en `ids_individuales` (detalle "medicamento: …"), columnas `medic_modo`, `medic_aplicaciones`, `medicamentos` y `medic_fuera_de_lista` en `registros`, y la foto `medicamento` en Drive. Hay que pegar el `.gs` nuevo y crear una **Nueva versión**.
- Las planillas modelo se generan en el teléfono sin librerías externas (escritor `.xlsx` propio).

## Novedades 3.5

- **Guía, COTA y cantidad en cada COTA**: al leer el QR, el app muestra el Nº de guía, el Nº de COTA y la cantidad de animales declarada **prellenados y bloqueados** (no se pueden editar: se incentiva leer el QR). Si el QR no se pudo leer (escaneo de 30 s o imagen ilegible), los tres campos se habilitan y son **obligatorios** a mano. La suma de animales de todas las guías se compara con la lectura del bastón (`control.declarado_vs_baston`) y, si no coincide, pasa al paso de inconformidades.
- **Fotos apaisadas → retrato**: cualquier foto que se cargue (precinto, guía, animal, botón, nacimiento, acta) y venga en horizontal se gira 90° en sentido antihorario antes de guardarla.
- **Paso de inconformidades** (nuevo, entre el detalle y la revisión): aparece solo si hay algo que revisar; si no, se pasa directo a la revisión y al guardado. Casos: (1) las guías declaran una cantidad distinta de la del bastón/archivo; (2) la cantidad contada no coincide con la lista; (3) animales del bastón sin peso de báscula. En (1) y (2) se puede **volver y corregir** o escribir una **justificación obligatoria**. En (3) se puede **buscar en la base de datos el último peso** de cada animal (hasta 60 días antes de la fecha del registro, el más reciente; necesita conexión) y, para los que sigan sin peso, elegir **escribir el peso**, usar el **promedio** de los pesados del registro o **dejarlos sin peso** (con justificación). Prioridad fija: báscula › histórico › elección del usuario. Cada animal guarda `peso_fuente` (`bascula` / `historico` / `manual` / `promedio`), el registro guarda `datos.inconformidades` (con justificación) y `datos.pesos_completados`; la revisión y el PDF lo muestran (en la lista de pesos: `(h)`, `(m)`, `(p)`). En la base, la GMD de `animales` y la búsqueda de pesos históricos usan **solo pesos reales de báscula**.
- **Pesaje simple** (nuevo tipo `pesaje_simple`, grupo pasto): cargar uno o muchos archivos de báscula sin conteo, sin bastón, sin acta ni inconformidades. El app solo toma IDE y peso. Sirve para alimentar la base de datos con pesajes de rutina.
- **Archivos Excel**: los archivos del bastón y de la báscula pueden ser `.xlsx` (primera hoja), además de CSV/TXT. Se leen en el teléfono sin librerías externas.
- Servidor 3.5: nuevo tipo `pesos` (consulta de últimos pesos por IDE), columnas `peso_fuente`, `peso_origen_fecha` y `peso_origen_registro` en `ids_individuales`; `inconformidades`, `justificaciones`, `cantidad_sin_peso_bascula`, `pesos_historico`, `pesos_manual`, `pesos_promedio` y `declarado_vs_baston` en `registros`; el CSV de IDE en Drive agrega `peso_fuente` y `peso_origen_fecha`. Hay que pegar el `.gs` nuevo y crear una **Nueva versión** de la implementación.

## Novedades 3.4

- **Base de datos de trazabilidad**: `ids_individuales` pasa a ser el libro de eventos por animal (una fila por animal y por registro, también para mortalidad, nacimiento, pérdida de botón y actas de no arreados), con hora, guía, COTA, propietario/establecimiento de origen y destino de la COTA, y, cuando el archivo de la báscula los trae, raza, sexo, categoría, proveedor y nacimiento. Nueva hoja **`animales`** (una fila por IDE: estado activo/salido/muerto, estancia/lote/piquete actual, primer y último evento, pesos de entrada y salida, ganancia total y GMD, guía/COTA/proveedor de entrada, muerte y causa), reconstruida desde el libro de eventos después de cada registro (y a mano con `reconstruirAnimales`). La hoja `cotas` agrega `modo` (qr/manual), `cantidad_animales`, `peso_promedio_kg` y `respondente`. El CSV de IDE en Drive incluye las columnas extra. Todo está explicado en **`Base_de_datos_trazabilidad.docx`** (también `.md`) para TI.
- **Lectura de QR**: en cada COTA hay tres opciones, "Escanear QR", "Foto del QR" y "Subir imagen" (archivo del teléfono o de la computadora). Si el escaneo no lee en 30 segundos, o la imagen no se puede decodificar, el app avisa y ofrece reintentar o cargar a mano el **Nº de guía y el Nº de COTA** (los dos obligatorios); esos campos solo aparecen después de un intento fallido. La COTA cargada a mano se marca como `modo: manual` en el JSON, la planilla, la revisión y el PDF, y alcanza para publicar; la foto de la primera página de la guía sigue siendo obligatoria.

## Novedades 3.3

- El correo de destino por defecto pasa a ser **lucasmoller@ypoti.com** (app y servidor). Los teléfonos que ya tenían el anterior se actualizan solos al abrir el app, salvo que se haya escrito un correo propio en Configuración.
- COTAs: en cada COTA son obligatorios **el QR leído** (con la cámara o con la foto del QR; el número escrito a mano ya no alcanza) **y la foto de la primera página de la guía**.
- **Varios archivos de bastón y varios de báscula**: los botones aceptan varios archivos a la vez (o de a uno, varias veces) y aparecen como fichas con su cantidad y una ✕ para quitar cada uno. Los del bastón se consolidan entre sí por IDE; los de la báscula entre sí por IDE y peso (si una IDE se repite con peso distinto, vale el último cargado y se avisa). El resultado es el mismo que si todo hubiera venido en un solo archivo. En el JSON: `datos.baston.archivos[]`, `datos.bascula_archivos[]` y `archivo_balanza.archivos[]`.
- **Entradas y salidas (y entradas RIP / confinamiento): valen solo los animales del bastón.** La báscula aporta únicamente el peso de cada uno (unión por IDE, tipo PROCV/left join); los animales que están en la báscula pero no en el bastón se descartan (no entran en la lista, en el conteo, en el peso promedio ni en el PDF; solo queda la cantidad en `datos.conciliacion.descartados_bascula`). La barra y los avisos muestran: animales del bastón, con peso, sin peso y el % con peso; se avisa únicamente de los que están en el bastón y no tienen peso. Si no se cargó bastón, se usa la lista de la báscula como antes. El pesaje de auditoría no cambia (solo báscula, varios archivos permitidos).

## Novedades 3.2.2

- PDF de mortalidad en **una sola página**: datos del animal (botón, causa, **lote y piquete** tal como los cargó el informante, ubicación, enlace a Google Maps, observaciones), debajo el mapa del Paraguay y la imagen satelital lado a lado, y abajo las dos fotos (animal y botón) una al lado de la otra, escaladas para entrar en el espacio restante.

## Novedades 3.2.1

- Mapa de la mortalidad: los botones "Cancelar" y "✓ Usar este punto" pasan a la barra superior, siempre visible (en algunos teléfonos la barra de abajo quedaba tapada por el navegador), y el lienzo ya no puede empujar la barra fuera de la pantalla. Nuevo botón "🛰 Satélite / 🗺 Mapa" para alternar entre OpenStreetMap y la imagen satelital de Esri World Imagery.
- PDF de mortalidad: el mapa macro del Paraguay marca el punto siempre (si la coordenada cae fuera del país, se dibuja en el borde con la leyenda "fuera del mapa" en vez de desaparecer) y a la derecha va una **imagen satelital** centrada en el lugar con un círculo de 20 km de radio, escala de 5 km y el punto marcado. La imagen se baja al guardar el registro (o al publicarlo / abrirlo, si en ese momento hay señal) y queda guardada en el JSON como `adjuntos.imagen_satelite`, así el PDF se genera igual sin conexión; si nunca hubo señal, el PDF lo aclara y la imagen se agrega sola al regenerarlo con conexión. El servidor la guarda también como foto suelta en Drive (`..._satelite.jpg`).

## Novedades 3.2

- **Acciones por deslizamiento** en "Registros en este teléfono": deslizando un registro hacia la izquierda aparecen JSON, PDF, Editar y Borrar (los borradores: Editar y Borrar; los informes: PDF y Borrar). Borrar pide confirmación y avisa si el registro todavía no está en la base de datos.
- **Animales no arreados** (pesaje de auditoría): primero se responde si quedaron animales sin pasar por el corral; si sí, se piden la cantidad (obligatoria), el peso medio estimado (opcional), las caravanas/botones identificados cuando fue posible (opcional, uno por línea), el retiro/lugar, el motivo por el que no se pudo hacer el pesaje (obligatorio), fotos, capataz, auditor y conformidad. En el JSON `datos.faltantes {cantidad, peso_medio_estimado_kg, ids[], identificados, sin_identificar, lugar, motivo, capataz, auditor, conformidad}`; en la planilla, hoja `faltantes` (una fila por caravana identificada, o una sola fila con la cantidad si no se identificó ninguna) y columna `faltantes_peso_medio_kg` en `registros`.
- **Informe de trazabilidad** (botón en la pantalla de inicio): se elige estancia y período, se escribe la contraseña de la estancia (o la maestra) y el informe aparece en la lista de registros con el estado "Generando…" (o "Esperando señal" si no hay conexión; se genera solo al volver). El app consulta la base de datos (nuevo tipo de pedido `consulta` en el servidor, que devuelve los registros publicados de esa estancia en el período, con camiones, COTAs, faltantes y enlaces), y arma un PDF apaisado al estilo del cierre mensual: resumen del período y una tabla por tipo de evento para todo el período (entrada pasto, salida, entrada RIP, entrada confinamiento, pesaje de auditoría, mortalidad, nacimiento, pérdida de botón) con informante, fecha y hora, lote/piquete, chapa(s), guía(s), COTA(s), establecimiento de origen/destino según la COTA, cabezas, animales en archivo, peso promedio, causa de muerte, madre, etc. En cada fila hay un **ícono de cámara** (enlace a la carpeta de fotos del registro en Drive) y un **ícono de caravana** (enlace al CSV con las identificaciones y pesos del registro; en mortalidad, a la foto del botón). Tocando el informe listo se abre el PDF.
- Para que esos enlaces existan, el servidor ahora guarda cada foto como archivo suelto en Drive (carpeta `fotos_<registro>` dentro de la carpeta de la estancia) y la lista de IDE como `<registro>_ids.csv`, y agrega a `registros` las columnas `url_fotos`, `url_ids`, `url_foto_boton`, `cantidad_fotos` y `hora_registro`, más la hoja `fotos` (una fila por foto). Los registros publicados antes de esta versión no tienen esos enlaces (el ícono sale gris).

## Novedades 3.1

- Estancias: se agrega **Cerro Memby** (contraseña propia) y la opción **"Otra…"** para escribir a mano el nombre de la estancia o retiro; esos registros se publican con la contraseña "Otra" (ver `contrasenas_por_estancia.txt`). En Drive se crea la subcarpeta con el nombre escrito.
- Lote y piquete: el bloque aclara que no son obligatorios y que el lote se completa solo cuando lo registrado corresponde a un lote específico de ControlPasto, entero y sin desbaste.
- Entrada y salida: hasta **3 fotos de precinto por camión** (cámara o galería, con quitar); en el JSON `adjuntos.fotos_precinto[i]` pasa a ser una lista por camión y `datos.camiones[i].fotos_precinto` trae la cantidad.
- Entrada, salida, entrada RIP y entrada confinamiento: dos archivos, **bastón** (solo IDE, opcional) y **báscula** (IDE y peso). El flujo previsto: cargar el bastón, guardar como borrador, y otro día cargar la báscula; el app concilia las dos listas con barras (bastón, báscula, en ambos) y el **% de IDE que coinciden**, listando las que están solo en el bastón (sin pesar) o solo en la báscula (no leídas). Para cerrar el registro hace falta al menos un archivo; la lista final (`datos.animales`) es la unión con el campo `fuente` ('ambos' / 'bascula' / 'baston'); además `datos.baston {nombre, cantidad, ids}`, `datos.conciliacion {baston, bascula, en_ambos, solo_baston[], solo_bascula[], porcentaje}` y en la planilla `cantidad_bascula`, `cantidad_baston`, `conciliacion_pct`, `solo_baston`, `solo_bascula` (y columna `fuente` en `ids_individuales`). El PDF separa la tabla de la báscula de las listas "solo en el bastón" / "solo en la báscula".
- Pesaje de auditoría: sección **"Animales no arreados o faltantes en corral"** según el Manual de Procedimiento Operativo: se cargan a mano (IDE obligatoria, peso estimado opcional), con retiro/lugar, motivo, fotos (hasta 6), nombre del capataz del retiro y del auditor, y la conformidad de ambos. Esos animales **no** entran en la lista de la báscula ni en `ids_individuales`; van en `datos.faltantes` y `adjuntos.fotos_faltantes`, en la hoja nueva `faltantes` de la planilla (una fila por animal) y en el PDF como "Acta de novedades". El app rechaza una IDE no arreada que también figure en la báscula.

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
