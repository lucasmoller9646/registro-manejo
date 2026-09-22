/**
 * Servidor de recepción para el app "Registro de manejo" (Google Apps Script) — versión 3.0
 *
 * Qué hace con cada registro que llega del teléfono:
 *   1. Verifica la contraseña de la estancia (o la maestra).
 *   2. Guarda el JSON y el PDF en una carpeta de Google Drive (una subcarpeta por estancia).
 *   3. Agrega (o actualiza, si es una versión editada del mismo registro) una fila en la hoja "registros",
 *      una fila por animal en "ids_individuales", una por camión en "camiones", una por COTA en "cotas"
 *      (una subida puede traer varios camiones y varias guías/COTAs) y el historial de cambios en "log".
 *   4. Envía un correo a trazabilidad@ypoti.com con el PDF y el JSON adjuntos.
 *
 * Registros editados: el app manda el mismo id con version 2, 3, …  El servidor reemplaza la fila del registro,
 * reemplaza sus animales, guarda los archivos nuevos con sufijo _vN (los anteriores quedan en Drive) y anota en "log"
 * qué cambió. Si llega otra vez la misma versión (reintento sin señal), no duplica nada.
 *
 * Instalación / actualización:
 *   a) Abra el proyecto en script.google.com, reemplace todo el contenido por este archivo y guarde (Ctrl+S).
 *   b) La primera vez: elija la función "probarConfiguracion", toque Ejecutar y acepte los permisos (Drive, Sheets, Gmail).
 *   c) Primera vez: Implementar > Nueva implementación > "Aplicación web" (Ejecutar como: Yo · Acceso: Cualquier persona).
 *      Actualización: Implementar > Administrar implementaciones > lápiz > Versión: "Nueva versión" > Implementar.
 *      (Así la URL /exec no cambia y los teléfonos no necesitan reconfigurarse.)
 */
const CONFIG = {
  FOLDER_ID: '1ceQacSijwWHwh0dkiZTAqtvwyXlD5WKR', // carpeta de Drive donde se guarda todo (PDF, JSON y la planilla)
  SHEET_ID: '',            // vacío = la planilla se crea sola dentro de la carpeta la primera vez (nombre abajo)
  SHEET_NAME: 'Registros de manejo (base de datos)',
  MAIL_DEFAULT: 'trazabilidad@ypoti.com',
  CLAVE_MAESTRA: 'boigordo', // válida para todas las estancias (administración). Borrar o cambiar si no se quiere.
  CLAVES: {
      "Ypoti": "potrero-25",
      "Ybypora": "sombra-85",
      "Cafetalera": "guampa-78",
      "La Esperanza": "rodeo-93",
      "Santa Clara": "marca-74",
      "Lusipar": "tropilla-72",
      "Oro Verde": "pastura-97",
      "Santa Maria": "molino-89",
      "Cielo Azul": "estribo-80",
      "Bella Vista": "bramadero-87"
  } // contraseña de publicación por estancia (el app la manda en body.clave)
};

// Columnas de la hoja "registros". Si la planilla ya existe con menos columnas, las nuevas se agregan al final automáticamente.
const CABECERA_REGISTROS = ['id', 'recibido_en', 'creado_en', 'tipo_evento', 'estancia', 'fecha_evento', 'respondente',
  'chapa_camion', 'cota_nro', 'cota_qr', 'cota_archivo', 'guia_archivo', 'origen', 'destino', 'raza', 'cantidad_animales', 'cantidad_ids', 'peso_promedio_kg', 'peso_total_kg', 'fecha_pesaje', 'ids_coinciden', 'cota_coincide',
  'nro_boton', 'causa_probable', 'madre', 'sexo_cria', 'nro_boton_cria', 'observaciones', 'lat', 'lon', 'url_pdf', 'url_json', 'url_csv', 'app_version',
  'lote_controlpasto', 'version', 'modificado_en', 'actualizado_en_servidor', 'nombre_archivo_balanza',
  'cantidad_camiones', 'cantidad_cotas', 'total_declarado_cotas', 'guia_coincide', 'declarado_coincide',
  'grupo', 'piquete', 'propiedad', 'propietario', 'origen_tipo', 'origen_sistema', 'origen_lote', 'origen_piquete', 'destino_lote', 'destino_piquete', 'ubic_lat', 'ubic_lon', 'ubic_precision_m', 'ubic_fuente', 'cantidad_sin_peso'];
const CABECERA_IDS = ['registro_id', 'tipo_evento', 'estancia', 'fecha_evento', 'origen', 'destino', 'ide', 'peso_kg', 'fecha_pesaje', 'hora_pesaje', 'cota_nro', 'lote_controlpasto', 'version', 'piquete', 'grupo'];
const CABECERA_CAMIONES = ['registro_id', 'tipo_evento', 'estancia', 'fecha_evento', 'nro', 'chapa', 'foto_precinto', 'version'];
const CABECERA_COTAS = ['registro_id', 'tipo_evento', 'estancia', 'fecha_evento', 'nro', 'cota_nro', 'nro_guia', 'fecha_emision', 'propietario_origen', 'establecimiento_origen', 'lat_origen', 'lon_origen', 'propietario_destino', 'establecimiento_destino', 'lat_destino', 'lon_destino', 'finalidad', 'animales_declarados', 'total_declarado', 'texto_qr', 'version', 'foto_guia'];
const CABECERA_LOG = ['registro_id', 'version', 'fecha', 'accion', 'detalle', 'app_version', 'recibido_en', 'estancia', 'tipo_evento'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.tipo === 'ping') return json_({ ok: true, mensaje: 'servidor listo (v2)' });
    if (body.tipo !== 'registro' || !body.registro) return json_({ ok: false, error: 'payload inválido' });
    const est = body.registro.estancia || '';
    const esperada = CONFIG.CLAVES[est];
    if (!(body.clave && (body.clave === esperada || (CONFIG.CLAVE_MAESTRA && body.clave === CONFIG.CLAVE_MAESTRA)))) return json_({ ok: false, error: 'clave incorrecta para la estancia ' + est });

    const r = body.registro;
    const version = Number(r.version) || 1;
    const to = body.destinatario || CONFIG.MAIL_DEFAULT;
    const nombrePdf = body.nombre_pdf || ('manejo_' + r.id + (version > 1 ? '_v' + version : '') + '.pdf');
    const nombreJson = body.nombre_json || ('manejo_' + r.id + (version > 1 ? '_v' + version : '') + '.json');

    lock.waitLock(30000); // evita que dos teléfonos escriban la misma fila al mismo tiempo
    const ss = planilla_();
    const hoja = hoja_(ss, 'registros', CABECERA_REGISTROS);
    const cab = cabecera_(hoja, CABECERA_REGISTROS);
    const colId = cab.indexOf('id') + 1, colVer = cab.indexOf('version') + 1;
    const n = hoja.getLastRow() - 1;
    let filaExistente = 0, versionExistente = 0;
    if (n > 0) {
      const ids = hoja.getRange(2, colId, n, 1).getValues();
      const vers = hoja.getRange(2, colVer, n, 1).getValues();
      for (let i = 0; i < n; i++) if (ids[i][0] === r.id) { filaExistente = i + 2; versionExistente = Number(vers[i][0]) || 1; }
    }
    if (filaExistente && version <= versionExistente) return json_({ ok: true, mensaje: 'ya recibido (versión ' + versionExistente + ')', duplicado: true });

    // Archivos en Drive
    const root = DriveApp.getFolderById(CONFIG.FOLDER_ID);
    const sub = subcarpeta_(root, r.estancia || 'sin_estancia');
    const pdfBlob = Utilities.newBlob(Utilities.base64Decode(body.pdf_base64), 'application/pdf', nombrePdf);
    const jsonBlob = Utilities.newBlob(JSON.stringify(r, null, 2), 'application/json', nombreJson);
    const fPdf = sub.createFile(pdfBlob);
    const fJson = sub.createFile(jsonBlob);

    // Fila en "registros" (nueva o reemplazo)
    const d = r.datos || {};
    const ahora = new Date();
    const valores = {
      id: r.id, recibido_en: ahora, creado_en: r.creado_en, tipo_evento: r.tipo_evento, estancia: r.estancia, fecha_evento: r.fecha_evento, respondente: r.respondente,
      chapa_camion: d.chapa_camion || '', cota_nro: d.cota_nro || '', cota_qr: d.cota_qr || '', cota_archivo: d.cota_archivo || '', guia_archivo: d.guia_archivo || '', origen: d.origen || '', destino: d.destino || '', raza: d.raza || '',
      cantidad_animales: d.cantidad_animales || '', cantidad_ids: (d.ids_individuales || []).length, peso_promedio_kg: d.peso_promedio_kg != null ? d.peso_promedio_kg : '', peso_total_kg: d.peso_total_kg != null ? d.peso_total_kg : '', fecha_pesaje: d.fecha_pesaje || '',
      ids_coinciden: r.control ? String(r.control.coincide) : '', cota_coincide: r.control && r.control.cota_coincide != null ? String(r.control.cota_coincide) : '',
      nro_boton: d.nro_boton || '', causa_probable: d.causa_probable || '', madre: d.madre || '', sexo_cria: d.sexo_cria || '', nro_boton_cria: d.nro_boton_cria || '',
      observaciones: r.observaciones || '', lat: r.geo ? r.geo.lat : '', lon: r.geo ? r.geo.lon : '', url_pdf: fPdf.getUrl(), url_json: fJson.getUrl(), url_csv: '', app_version: r.app_version || '',
      lote_controlpasto: r.lote_controlpasto || '', version: version, modificado_en: r.modificado_en || '', actualizado_en_servidor: filaExistente ? ahora : '', nombre_archivo_balanza: r.archivo_balanza ? (r.archivo_balanza.nombre || '') : '',
      cantidad_camiones: d.camiones ? d.camiones.length : (d.chapa_camion ? 1 : ''), cantidad_cotas: d.cotas ? d.cotas.length : (d.cota_nro ? 1 : ''), total_declarado_cotas: d.total_declarado_cotas != null ? d.total_declarado_cotas : (d.cota && d.cota.total_declarado != null ? d.cota.total_declarado : ''),
      guia_coincide: r.control && r.control.guia_coincide != null ? String(r.control.guia_coincide) : '', declarado_coincide: r.control && r.control.declarado_coincide != null ? String(r.control.declarado_coincide) : '',
      grupo: r.grupo || (ES_INTENSIVO_[r.tipo_evento] ? 'intensivo' : 'pasto'), piquete: r.piquete || '', propiedad: d.propiedad || '', propietario: d.propietario || '', origen_tipo: d.origen_tipo || '', origen_sistema: d.origen_sistema || '', origen_lote: d.origen_lote || '', origen_piquete: d.origen_piquete || '', destino_lote: d.destino_lote || '', destino_piquete: d.destino_piquete || '',
      ubic_lat: d.ubicacion ? d.ubicacion.lat : '', ubic_lon: d.ubicacion ? d.ubicacion.lon : '', ubic_precision_m: d.ubicacion && d.ubicacion.precision_m != null ? d.ubicacion.precision_m : '', ubic_fuente: d.ubicacion ? (d.ubicacion.fuente || '') : '', cantidad_sin_peso: d.cantidad_sin_peso != null ? d.cantidad_sin_peso : ''
    };
    const fila = cab.map(k => (k in valores) ? valores[k] : '');
    if (filaExistente) {
      const rec = hoja.getRange(filaExistente, 1, 1, cab.length).getValues()[0];
      const iRec = cab.indexOf('recibido_en'); if (iRec >= 0 && rec[iRec]) fila[iRec] = rec[iRec]; // conserva la fecha de la primera recepción
      hoja.getRange(filaExistente, 1, 1, cab.length).setValues([fila]);
    } else hoja.appendRow(fila);

    // Animales
    const hIds = hoja_(ss, 'ids_individuales', CABECERA_IDS);
    if (filaExistente) borrarFilasPorId_(hIds, r.id);
    if (d.animales && d.animales.length) {
      const cabIds = cabecera_(hIds, CABECERA_IDS);
      const filas = d.animales.map(a => { const v = { registro_id: r.id, tipo_evento: r.tipo_evento, estancia: r.estancia, fecha_evento: r.fecha_evento, origen: d.origen || '', destino: d.destino || '', ide: a.ide, peso_kg: a.peso_kg != null ? a.peso_kg : '', fecha_pesaje: a.fecha_pesaje || d.fecha_pesaje || '', hora_pesaje: a.hora_pesaje || '', cota_nro: d.cota_nro || '', lote_controlpasto: r.lote_controlpasto || '', version: version, piquete: r.piquete || '', grupo: r.grupo || '' }; return cabIds.map(k => (k in v) ? v[k] : ''); });
      hIds.getRange(hIds.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas);
    }

    // Camiones y COTAs (una fila por camión / por COTA; compatible con registros viejos de una sola chapa)
    if (r.tipo_evento === 'entrada' || r.tipo_evento === 'salida' || (d.camiones && d.camiones.length)) {
      const hCam = hoja_(ss, 'camiones', CABECERA_CAMIONES); if (filaExistente) borrarFilasPorId_(hCam, r.id);
      const fp = (r.adjuntos && r.adjuntos.fotos_precinto) || [];
      const cams = (d.camiones && d.camiones.length) ? d.camiones : (d.chapa_camion ? [{ nro: 1, chapa: d.chapa_camion, foto_precinto: !!(r.adjuntos && r.adjuntos.foto_precinto) }] : []);
      if (cams.length) { const filas = cams.map((c, i) => [r.id, r.tipo_evento, r.estancia, r.fecha_evento, c.nro || (i + 1), c.chapa || '', (c.foto_precinto || fp[i]) ? 'sí' : 'no', version]); hCam.getRange(hCam.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas); }
      const hCot = hoja_(ss, 'cotas', CABECERA_COTAS); if (filaExistente) borrarFilasPorId_(hCot, r.id);
      const cts = (d.cotas && d.cotas.length) ? d.cotas : ((d.cota_nro || d.cota_qr) ? [{ nro: 1, cota_qr: d.cota_qr, cota_nro: d.cota_nro, cota: d.cota }] : []);
      if (cts.length) { const filas = cts.map((ct, i) => { const c = ct.cota || {}; return [r.id, r.tipo_evento, r.estancia, r.fecha_evento, ct.nro || (i + 1), ct.cota_nro || '', c.nro_guia || ct.nro_guia || '', c.fecha_emision || '', c.propietario_origen || '', c.establecimiento_origen || '', c.coord_origen ? c.coord_origen.lat : '', c.coord_origen ? c.coord_origen.lon : '', c.propietario_destino || '', c.establecimiento_destino || '', c.coord_destino ? c.coord_destino.lat : '', c.coord_destino ? c.coord_destino.lon : '', c.finalidad || '', (c.animales_declarados || []).map(x => x.categoria + ' ' + x.cantidad).join(', '), c.total_declarado != null ? c.total_declarado : '', ct.cota_qr || '', version, ct.foto_guia ? 'sí' : '']; }); hCot.getRange(hCot.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas); }
    }

    // Log de cambios (historial que manda el app + recepción en el servidor)
    const hLog = hoja_(ss, 'log', CABECERA_LOG);
    const hist = (r.historial || []).filter(h => { const hv = Number(h.version) || 1; return filaExistente ? hv >= version : hv <= version; });
    const filasLog = hist.map(h => [r.id, h.version || 1, h.fecha || '', h.accion || '', h.detalle || '', h.app_version || '', ahora, r.estancia, r.tipo_evento]);
    filasLog.push([r.id, version, ahora.toISOString(), filaExistente ? 'actualizado en el servidor (reemplaza versión ' + versionExistente + ')' : 'recibido en el servidor', nombrePdf, r.app_version || '', ahora, r.estancia, r.tipo_evento]);
    hLog.getRange(hLog.getLastRow() + 1, 1, filasLog.length, filasLog[0].length).setValues(filasLog);

    // Correo con adjuntos
    const cambios = filaExistente ? ((r.historial || []).filter(h => h.accion === 'editado' && (Number(h.version) || 1) === version).map(h => h.detalle || '').join('; ')) : '';
    const asunto = '[' + etiqueta_(r.tipo_evento) + '] ' + r.estancia + ' ' + fecha_(r.fecha_evento) + ' · ' + r.respondente + (version > 1 ? ' · versión ' + version + ' (editado)' : '');
    MailApp.sendEmail({ to: to, subject: asunto, body: resumen_(r) + (cambios ? '\n\nEdición: ' + cambios : '') + '\n\nArchivos en Drive:\n' + fPdf.getUrl() + '\n' + fJson.getUrl(), attachments: [pdfBlob, jsonBlob], name: 'Registro de manejo' });

    return json_({ ok: true, mensaje: filaExistente ? 'actualizado (versión ' + version + ')' : 'recibido', id: r.id, version: version });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet() { const ss = planilla_(); return json_({ ok: true, mensaje: 'servidor listo v2 (use POST)', planilla: ss.getUrl(), carpeta: DriveApp.getFolderById(CONFIG.FOLDER_ID).getUrl() }); }

// Devuelve la planilla de la base de datos: la indicada en CONFIG.SHEET_ID, o la que existe / se crea dentro de la carpeta.
function planilla_() {
  if (CONFIG.SHEET_ID) return SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SHEET_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) { id = null; } }
  const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  const it = folder.getFilesByType(MimeType.GOOGLE_SHEETS);
  while (it.hasNext()) { const f = it.next(); if (f.getName() === CONFIG.SHEET_NAME) { props.setProperty('SHEET_ID', f.getId()); return SpreadsheetApp.openById(f.getId()); } }
  const ss = SpreadsheetApp.create(CONFIG.SHEET_NAME);
  try { DriveApp.getFileById(ss.getId()).moveTo(folder); }
  catch (e) { Logger.log('AVISO: no se pudo mover la planilla a la carpeta (' + e + '). Queda en "Mi unidad" de ' + Session.getEffectiveUser().getEmail() + '. Revise que esta cuenta tenga permiso de EDITOR sobre la carpeta.'); }
  hoja_(ss, 'registros', CABECERA_REGISTROS);
  const def = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1'); if (def && ss.getSheets().length > 1) ss.deleteSheet(def);
  props.setProperty('SHEET_ID', ss.getId());
  return ss;
}

// Ejecutar una vez a mano desde el editor (Ejecutar > probarConfiguracion) para autorizar permisos y verificar carpeta + planilla.
function probarConfiguracion() {
  const cuenta = Session.getEffectiveUser().getEmail();
  Logger.log('Cuenta que ejecuta el script: ' + cuenta);
  const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  Logger.log('Carpeta: ' + folder.getName() + ' -> ' + folder.getUrl());
  try { const t = folder.createFile('prueba_permisos.txt', 'ok'); t.setTrashed(true); Logger.log('Permiso de escritura en la carpeta: OK'); }
  catch (e) { Logger.log('ERROR: la cuenta ' + cuenta + ' NO puede escribir en la carpeta (' + e + '). Comparta la carpeta con esa cuenta como EDITOR, o ponga en CONFIG.FOLDER_ID una carpeta propia.'); throw e; }
  const ss = planilla_();
  cabecera_(hoja_(ss, 'registros', CABECERA_REGISTROS), CABECERA_REGISTROS);
  cabecera_(hoja_(ss, 'ids_individuales', CABECERA_IDS), CABECERA_IDS);
  hoja_(ss, 'log', CABECERA_LOG); hoja_(ss, 'camiones', CABECERA_CAMIONES); hoja_(ss, 'cotas', CABECERA_COTAS);
  Logger.log('Planilla: ' + ss.getName() + ' -> ' + ss.getUrl());
  return ss.getUrl();
}

function hoja_(ss, nombre, cabecera) { let h = ss.getSheetByName(nombre); if (!h) { h = ss.insertSheet(nombre); h.appendRow(cabecera); h.setFrozenRows(1); } return h; }
// Lee la fila 1 y agrega al final las columnas que falten (así una planilla vieja sigue sirviendo).
function cabecera_(h, esperada) {
  let cab = h.getLastColumn() > 0 ? h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0].map(String) : [];
  const faltan = esperada.filter(k => cab.indexOf(k) < 0);
  if (faltan.length) { h.getRange(1, cab.length + 1, 1, faltan.length).setValues([faltan]); cab = cab.concat(faltan); }
  return cab;
}
function borrarFilasPorId_(h, id) {
  const n = h.getLastRow() - 1; if (n < 1) return;
  const ids = h.getRange(2, 1, n, 1).getValues();
  for (let i = n - 1; i >= 0; i--) if (ids[i][0] === id) h.deleteRow(i + 2);
}
function subcarpeta_(root, nombre) { const it = root.getFoldersByName(nombre); return it.hasNext() ? it.next() : root.createFolder(nombre); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
const ES_INTENSIVO_ = { entrada_rip: true, entrada_confinamiento: true };
function etiqueta_(t) { return { entrada: 'Entrada pasto', salida: 'Salida de animales', mortalidad: 'Mortalidad', nacimiento: 'Nacimiento', pesaje: 'Pesaje de auditoría', perdida_boton: 'Pérdida de botón electrónico', entrada_rip: 'Entrada RIP', entrada_confinamiento: 'Entrada confinamiento' }[t] || t; }
function fecha_(iso) { return iso ? iso.split('-').reverse().join('/') : ''; }
function resumen_(r) {
  const d = r.datos || {}; let s = etiqueta_(r.tipo_evento) + ' · ' + r.estancia + ' · ' + fecha_(r.fecha_evento) + '\nRegistra: ' + r.respondente + (r.lote_controlpasto ? ' · Lote ' + r.lote_controlpasto : '') + (r.piquete ? ' · Piquete ' + r.piquete : '') + '\n';
  if (ES_INTENSIVO_[r.tipo_evento]) s += 'Origen: ' + (d.origen || '—') + '\nDestino: ' + (d.destino || '—') + '\n';
  if (d.chapa_camion) s += ((d.cantidad_camiones || 1) > 1 ? 'Chapas ' : 'Chapa ') + d.chapa_camion + ((d.cantidad_cotas || 1) > 1 ? ' · COTAs ' : ' · COTA ') + (d.cota_nro || d.cota_qr || '—') + (d.raza ? ' · Raza: ' + d.raza : '') + (!ES_INTENSIVO_[r.tipo_evento] && d.origen ? ' · Origen: ' + d.origen : '') + (!ES_INTENSIVO_[r.tipo_evento] && d.destino ? ' · Destino: ' + d.destino : '') + '\n';
  if (d.animales) s += (d.cantidad_animales != null ? d.cantidad_animales + ' animales contados · ' : '') + (d.ids_individuales || []).length + ' en archivo balanza' + (d.peso_promedio_kg != null ? ' · ' + d.peso_promedio_kg + ' kg prom.' : '') + '\n';
  if (r.tipo_evento === 'mortalidad') s += 'Botón ' + d.nro_boton + (d.causa_probable ? ' · ' + d.causa_probable : '') + (d.ubicacion ? '\nUbicación: https://maps.google.com/?q=' + d.ubicacion.lat + ',' + d.ubicacion.lon : '') + '\n';
  if (r.tipo_evento === 'nacimiento') s += 'Madre: ' + d.madre + (d.sexo_cria ? ' · ' + d.sexo_cria : '') + '\n';
  if (r.tipo_evento === 'perdida_boton') s += 'Botón perdido: ' + d.nro_boton + '\n';
  if (r.observaciones) s += 'Obs.: ' + r.observaciones + '\n';
  return s + 'ID ' + r.id + (r.version > 1 ? ' · versión ' + r.version : '');
}
