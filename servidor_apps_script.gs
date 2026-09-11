/**
 * Servidor de recepción para el app "Registro de manejo" (Google Apps Script).
 *
 * Qué hace con cada registro que llega del teléfono:
 *   1. Guarda el JSON y el PDF en una carpeta de Google Drive (una subcarpeta por estancia).
 *   2. Envía un correo a trazabilidad@ypoti.com con los archivos adjuntos (PDF, JSON y el CSV de la balanza).
 *   3. Agrega una fila a una planilla de Google Sheets (una fila por registro, una fila por ID individual en otra hoja).
 *
 * Instalación (una sola vez, ~10 minutos):
 *   a) Cree una planilla nueva en Google Sheets y copie su ID (la parte larga de la URL).
 *   b) Cree una carpeta en Google Drive para los archivos y copie su ID.
 *   c) Abra script.google.com > Nuevo proyecto, pegue este archivo y complete CONFIG.
 *   d) Implementar > Nueva implementación > tipo "Aplicación web":
 *        - Ejecutar como: Yo
 *        - Quién tiene acceso: Cualquier persona
 *      Copie la URL que termina en /exec y péguela en el app (Configuración > URL de envío automático).
 *   e) En el app, toque "Probar conexión". Debe responder "Conexión correcta".
 */
const CONFIG = {
  SHEET_ID: 'PEGAR_ID_DE_LA_PLANILLA',
  FOLDER_ID: 'PEGAR_ID_DE_LA_CARPETA_DRIVE',
  MAIL_DEFAULT: 'trazabilidad@ypoti.com',
  CLAVE: 'boigordo' // contraseña de publicación: el app la manda en cada registro (body.clave)
};

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.tipo === 'ping') return json_({ ok: true, mensaje: 'servidor listo' });
    if (body.tipo !== 'registro' || !body.registro) return json_({ ok: false, error: 'payload inválido' });
    if (CONFIG.CLAVE && body.clave !== CONFIG.CLAVE) return json_({ ok: false, error: 'clave incorrecta' });

    const r = body.registro;
    const to = body.destinatario || CONFIG.MAIL_DEFAULT;
    const nombrePdf = body.nombre_pdf || ('manejo_' + r.id + '.pdf');
    const nombreJson = body.nombre_json || ('manejo_' + r.id + '.json');

    // Idempotencia: si ya llegó este id, no duplicar.
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const hoja = hoja_(ss, 'registros', CABECERA_REGISTROS);
    const ids = hoja.getLastRow() > 1 ? hoja.getRange(2, 1, hoja.getLastRow() - 1, 1).getValues().flat() : [];
    if (ids.indexOf(r.id) >= 0) return json_({ ok: true, mensaje: 'ya recibido', duplicado: true });

    // Archivos en Drive
    const root = DriveApp.getFolderById(CONFIG.FOLDER_ID);
    const sub = subcarpeta_(root, r.estancia || 'sin_estancia');
    const pdfBlob = Utilities.newBlob(Utilities.base64Decode(body.pdf_base64), 'application/pdf', nombrePdf);
    const jsonBlob = Utilities.newBlob(JSON.stringify(r, null, 2), 'application/json', nombreJson);
    const fPdf = sub.createFile(pdfBlob);
    const fJson = sub.createFile(jsonBlob);
    let fCsv = null;
    if (r.archivo_balanza && r.archivo_balanza.contenido) fCsv = sub.createFile(Utilities.newBlob(r.archivo_balanza.contenido, 'text/csv', r.archivo_balanza.nombre || ('balanza_' + r.id + '.csv')));

    // Filas en la planilla
    const d = r.datos || {};
    hoja.appendRow([
      r.id, new Date(), r.creado_en, r.tipo_evento, r.estancia, r.fecha_evento, r.respondente,
      d.chapa_camion || '', d.cota_nro || '', d.cota_qr || '', d.cota_archivo || '', d.guia_archivo || '', d.origen || '', d.destino || '', d.raza || '',
      d.cantidad_animales || '', (d.ids_individuales || []).length, d.peso_promedio_kg != null ? d.peso_promedio_kg : '', d.peso_total_kg != null ? d.peso_total_kg : '', d.fecha_pesaje || '',
      r.control ? String(r.control.coincide) : '', r.control && r.control.cota_coincide != null ? String(r.control.cota_coincide) : '',
      d.nro_boton || '', d.causa_probable || '', d.madre || '', d.sexo_cria || '', d.nro_boton_cria || '',
      r.observaciones || '', r.geo ? r.geo.lat : '', r.geo ? r.geo.lon : '', fPdf.getUrl(), fJson.getUrl(), fCsv ? fCsv.getUrl() : '', r.app_version || ''
    ]);
    if (d.animales && d.animales.length) {
      const hIds = hoja_(ss, 'ids_individuales', ['registro_id', 'tipo_evento', 'estancia', 'fecha_evento', 'origen', 'destino', 'ide', 'peso_kg', 'fecha_pesaje', 'hora_pesaje', 'cota_nro']);
      const filas = d.animales.map(a => [r.id, r.tipo_evento, r.estancia, r.fecha_evento, d.origen || '', d.destino || '', a.ide, a.peso_kg != null ? a.peso_kg : '', a.fecha_pesaje || '', a.hora_pesaje || '', d.cota_nro || '']);
      hIds.getRange(hIds.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas);
    }

    // Correo con adjuntos
    const asunto = '[' + etiqueta_(r.tipo_evento) + '] ' + r.estancia + ' ' + fecha_(r.fecha_evento) + ' · ' + r.respondente;
    MailApp.sendEmail({ to: to, subject: asunto, body: resumen_(r) + '\n\nArchivos en Drive:\n' + fPdf.getUrl() + '\n' + fJson.getUrl(), attachments: fCsv ? [pdfBlob, jsonBlob, fCsv.getBlob()] : [pdfBlob, jsonBlob], name: 'Registro de manejo' });

    return json_({ ok: true, mensaje: 'recibido', id: r.id });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() { return json_({ ok: true, mensaje: 'servidor listo (use POST)' }); }

const CABECERA_REGISTROS = ['id', 'recibido_en', 'creado_en', 'tipo_evento', 'estancia', 'fecha_evento', 'respondente',
  'chapa_camion', 'cota_nro', 'cota_qr', 'cota_archivo', 'guia_archivo', 'origen', 'destino', 'raza', 'cantidad_animales', 'cantidad_ids', 'peso_promedio_kg', 'peso_total_kg', 'fecha_pesaje', 'ids_coinciden', 'cota_coincide',
  'nro_boton', 'causa_probable', 'madre', 'sexo_cria', 'nro_boton_cria', 'observaciones', 'lat', 'lon', 'url_pdf', 'url_json', 'url_csv', 'app_version'];

function hoja_(ss, nombre, cabecera) { let h = ss.getSheetByName(nombre); if (!h) { h = ss.insertSheet(nombre); h.appendRow(cabecera); h.setFrozenRows(1); } return h; }
function subcarpeta_(root, nombre) { const it = root.getFoldersByName(nombre); return it.hasNext() ? it.next() : root.createFolder(nombre); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function etiqueta_(t) { return { entrada: 'Entrada de animales', salida: 'Salida de animales', mortalidad: 'Mortalidad', nacimiento: 'Nacimiento' }[t] || t; }
function fecha_(iso) { return iso ? iso.split('-').reverse().join('/') : ''; }
function resumen_(r) {
  const d = r.datos || {}; let s = etiqueta_(r.tipo_evento) + ' · ' + r.estancia + ' · ' + fecha_(r.fecha_evento) + '\nRegistra: ' + r.respondente + '\n';
  if (r.tipo_evento === 'entrada' || r.tipo_evento === 'salida') s += 'Chapa ' + d.chapa_camion + ' · COTA ' + (d.cota_nro || d.cota_qr || '—') + '\n' + (r.tipo_evento === 'entrada' ? 'Origen: ' + d.origen + ' · Raza: ' + d.raza : 'Destino: ' + d.destino) + '\n' + d.cantidad_animales + ' animales contados · ' + (d.ids_individuales || []).length + ' en archivo balanza' + (d.peso_promedio_kg != null ? ' · ' + d.peso_promedio_kg + ' kg prom.' : '') + '\n';
  if (r.tipo_evento === 'mortalidad') s += 'Botón ' + d.nro_boton + (d.causa_probable ? ' · ' + d.causa_probable : '') + '\n';
  if (r.tipo_evento === 'nacimiento') s += 'Madre: ' + d.madre + (d.sexo_cria ? ' · ' + d.sexo_cria : '') + '\n';
  if (r.observaciones) s += 'Obs.: ' + r.observaciones + '\n';
  return s + 'ID ' + r.id;
}
