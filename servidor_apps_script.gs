/**
 * Servidor de recepción para el app "Registro de manejo" (Google Apps Script) — versión 3.9
 *
 * Qué hace con cada registro que llega del teléfono:
 *   1. Verifica la contraseña de la estancia (o la maestra).
 *   2. Guarda el JSON y el PDF en una carpeta de Google Drive (una subcarpeta por estancia).
 *   3. Agrega (o actualiza, si es una versión editada del mismo registro) una fila en la hoja "registros",
 *      una fila por animal en "ids_individuales", una por camión en "camiones", una por COTA en "cotas"
 *      (una subida puede traer varios camiones y varias guías/COTAs) y el historial de cambios en "log".
 *   4. Envía un correo a lucasmoller@ypoti.com con el PDF y el JSON adjuntos.
 *   5. Responde consultas del app: tipo 'consulta' (informe de trazabilidad, con contraseña) y tipo 'pesos'
 *      (último peso de báscula de cada IDE en los últimos 60 días, para completar animales sin peso).
 *   6. Guarda copias de seguridad de los teléfonos (tipo 'respaldo': borradores, registros sin publicar y ediciones en curso,
 *      un archivo JSON por registro en la carpeta 'respaldos_telefonos' + hoja 'respaldos') y las devuelve con la contraseña
 *      de la estancia (tipos 'recuperar' y 'recuperar_items') junto con los registros ya publicados, para reinstalar el app
 *      o cambiar de teléfono sin perder nada. Al recibir un registro publicado, su copia de respaldo se borra.
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
  MAIL_DEFAULT: 'lucasmoller@ypoti.com',
  CLAVE_MAESTRA: '2803', // 4 números · válida para todas las estancias (administración). Borrar o cambiar si no se quiere.
  MAX_FALLOS: 8,           // intentos con clave incorrecta (por estancia) antes de bloquear 15 minutos
  // Solicitudes de transferencia de ganado: quién aprueba (recibe el correo con el enlace) y la contraseña que pide el enlace
  APROBADOR: { nombre: 'Ronei Barrios', mail: 'roneizoo@gmail.com', cargo: 'Representante Legal' },
  CLAVE_APROBACION: '7629', // 4 números
  EMPRESA: { razon_social: 'RURAL BIOENERGIA S.A.', ruc: '80050418-6', direccion: 'Av. Aviadores del Chaco 1410, Edificio The Top, sala 1404', tel: '(021) 338 5743' },
  CLAVES: {
      "Ypoti": "1051",
      "Ybypora": "6216",
      "Cafetalera": "4458",
      "La Esperanza": "4444",
      "Santa Clara": "7926",
      "Lusipar": "9171",
      "Oro Verde": "2842",
      "Santa Maria": "8295",
      "Cielo Azul": "5460",
      "Bella Vista": "6824",
      "Cerro Memby": "4998",
      "Otra": "5883"
  } // contraseña de publicación por estancia: 4 números (el app la manda en body.clave)
};

// Columnas de la hoja "registros". Si la planilla ya existe con menos columnas, las nuevas se agregan al final automáticamente.
const CABECERA_REGISTROS = ['id', 'recibido_en', 'creado_en', 'tipo_evento', 'estancia', 'fecha_evento', 'respondente',
  'chapa_camion', 'cota_nro', 'cota_qr', 'cota_archivo', 'guia_archivo', 'origen', 'destino', 'raza', 'cantidad_animales', 'cantidad_ids', 'peso_promedio_kg', 'peso_total_kg', 'fecha_pesaje', 'ids_coinciden', 'cota_coincide',
  'nro_boton', 'causa_probable', 'madre', 'sexo_cria', 'nro_boton_cria', 'observaciones', 'lat', 'lon', 'url_pdf', 'url_json', 'url_csv', 'app_version',
  'lote_controlpasto', 'version', 'modificado_en', 'actualizado_en_servidor', 'nombre_archivo_balanza',
  'cantidad_camiones', 'cantidad_cotas', 'total_declarado_cotas', 'guia_coincide', 'declarado_coincide',
  'grupo', 'piquete', 'propiedad', 'propietario', 'origen_tipo', 'origen_sistema', 'origen_lote', 'origen_piquete', 'destino_lote', 'destino_piquete', 'ubic_lat', 'ubic_lon', 'ubic_precision_m', 'ubic_fuente', 'cantidad_sin_peso',
  'cantidad_bascula', 'cantidad_baston', 'conciliacion_pct', 'solo_baston', 'solo_bascula', 'cantidad_faltantes', 'faltantes_lugar', 'faltantes_motivo', 'faltantes_capataz', 'faltantes_auditor', 'faltantes_conformidad',
  'faltantes_peso_medio_kg', 'url_fotos', 'url_ids', 'url_foto_boton', 'cantidad_fotos', 'hora_registro',
  'inconformidades', 'justificaciones', 'cantidad_sin_peso_bascula', 'pesos_historico', 'pesos_manual', 'pesos_promedio', 'declarado_vs_baston',
  'medic_modo', 'medic_aplicaciones', 'medicamentos', 'medic_fuera_de_lista', 'id_json'];
const CABECERA_IDS = ['registro_id', 'tipo_evento', 'estancia', 'fecha_evento', 'origen', 'destino', 'ide', 'peso_kg', 'fecha_pesaje', 'hora_pesaje', 'cota_nro', 'lote_controlpasto', 'version', 'piquete', 'grupo', 'fuente',
  'hora', 'nro_guia', 'propietario_origen', 'establecimiento_origen', 'propietario_destino', 'establecimiento_destino', 'raza', 'sexo', 'categoria', 'proveedor', 'nacimiento', 'causa', 'detalle', 'respondente', 'recibido_en', 'peso_fuente', 'peso_origen_fecha', 'peso_origen_registro'];
// Hoja 'animales': una fila por IDE, reconstruida a partir de 'ids_individuales' después de cada registro (estado actual de cada animal).
const CABECERA_ANIMALES = ['ide', 'estado', 'estancia_actual', 'lote_actual', 'piquete_actual', 'primer_evento', 'primer_tipo', 'primera_estancia', 'ultimo_evento', 'ultimo_tipo', 'ultima_estancia', 'eventos', 'pesajes', 'primer_peso_kg', 'fecha_primer_peso', 'ultimo_peso_kg', 'fecha_ultimo_peso', 'ganancia_total_kg', 'dias_entre_pesos', 'gmd_kg_dia', 'peso_entrada_kg', 'fecha_entrada', 'guia_entrada', 'cota_entrada', 'proveedor', 'propietario_origen', 'establecimiento_origen', 'raza', 'sexo', 'categoria', 'nacimiento', 'fecha_salida', 'destino_salida', 'guia_salida', 'peso_salida_kg', 'fecha_muerte', 'causa_muerte', 'registros', 'actualizado_en'];
const CABECERA_FALTANTES = ['registro_id', 'tipo_evento', 'estancia', 'fecha_evento', 'ide', 'peso_estimado_kg', 'lugar', 'motivo', 'capataz', 'auditor', 'conformidad', 'version', 'cantidad', 'peso_medio_estimado_kg'];
const CABECERA_FOTOS = ['registro_id', 'tipo_evento', 'estancia', 'fecha_evento', 'tipo_foto', 'nro', 'url', 'version'];
// Hoja 'medicamentos': una fila por aplicación (registro de 'Aplicación de medicamento', carga simple o masiva)
const CABECERA_MEDICAMENTOS = ['registro_id', 'tipo_evento', 'estancia', 'fecha_evento', 'nro', 'brinco', 'medicamento', 'codigo_articulo', 'en_lista', 'dosis', 'unidad', 'modo', 'lote_controlpasto', 'piquete', 'respondente', 'version', 'recibido_en'];
// Hoja 'respaldos': una fila por registro copiado desde un teléfono (borrador, sin publicar o con una edición en curso)
const CABECERA_RESPALDOS = ['id', 'estancia', 'tipo_evento', 'estado_local', 'edicion', 'respondente', 'version', 'actualizado_en', 'recibido_en', 'id_archivo', 'url', 'tamano_kb', 'dispositivo', 'app_version'];
// Hoja 'solicitudes': una fila por solicitud de transferencia de ganado, con su estado (pendiente / aprobada / rechazada) y la firma digital
const CABECERA_SOLICITUDES = ['registro_id', 'token', 'estado', 'creado_en', 'enviado_en', 'estancia_origen', 'codigo_origen', 'estancia_destino', 'codigo_destino', 'categoria', 'cantidad_guias', 'animales_por_guia', 'total_animales', 'total_letras', 'naturaleza', 'fecha', 'lugar', 'solicitante', 'observaciones', 'decidido_en', 'aprobador', 'comentario', 'hash_firma', 'url_pdf_firmado', 'id_pdf_firmado', 'version', 'url_pdf'];
const CABECERA_CAMIONES = ['registro_id', 'tipo_evento', 'estancia', 'fecha_evento', 'nro', 'chapa', 'foto_precinto', 'version'];
const CABECERA_COTAS = ['registro_id', 'tipo_evento', 'estancia', 'fecha_evento', 'nro', 'cota_nro', 'nro_guia', 'fecha_emision', 'propietario_origen', 'establecimiento_origen', 'lat_origen', 'lon_origen', 'propietario_destino', 'establecimiento_destino', 'lat_destino', 'lon_destino', 'finalidad', 'animales_declarados', 'total_declarado', 'texto_qr', 'version', 'foto_guia', 'modo', 'cantidad_animales', 'peso_promedio_kg', 'respondente'];
const CABECERA_LOG = ['registro_id', 'version', 'fecha', 'accion', 'detalle', 'app_version', 'recibido_en', 'estancia', 'tipo_evento'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.tipo === 'ping') return json_({ ok: true, mensaje: 'servidor listo (v3.9)' });
    if (body.tipo === 'consulta') return consulta_(body);
    if (body.tipo === 'pesos') return pesos_(body);
    if (body.tipo === 'estado_solicitud') return estadoSolicitud_(body);
    if (body.tipo === 'respaldo') return respaldo_(body, lock);
    if (body.tipo === 'borrar_respaldo') { lock.waitLock(30000); borrarRespaldo_(planilla_(), String(body.id || '')); return json_({ ok: true, mensaje: 'respaldo borrado' }); }
    if (body.tipo === 'recuperar') return recuperar_(body);
    if (body.tipo === 'brincos') return brincos_(body);
    if (body.tipo === 'verificar_clave') { const v = String(body.estancia || '') === '*' ? claveMaestra_(body.clave) : claveEstancia_(String(body.estancia || ''), body.clave); return json_(v.ok ? { ok: true } : { ok: false, error: v.error }); }
    if (body.tipo === 'recuperar_items') return recuperarItems_(body);
    if (body.tipo !== 'registro' || !body.registro) return json_({ ok: false, error: 'payload inválido' });
    const est = body.registro.estancia || '';
    const cv = claveEstancia_(est, body.clave); if (!cv.ok) return json_({ ok: false, error: cv.error }); // estancias escritas a mano usan la clave 'Otra'

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
    // Fotos como archivos sueltos (una carpeta por registro) y lista de IDE como CSV, para enlazar desde los informes
    const d0 = r.datos || {}; const a0 = r.adjuntos || {};
    const baseNombre = nombrePdf.replace(/\.pdf$/i, '');
    const fotosLista = []; // {tipo, nro, blob}
    const addFoto = (tipo, du, nro) => { if (!du || typeof du !== 'string' || du.indexOf('base64,') < 0) return; try { const mime = (du.match(/^data:([^;]+);/) || [])[1] || 'image/jpeg'; const ext = mime.indexOf('png') >= 0 ? 'png' : 'jpg'; fotosLista.push({ tipo: tipo, nro: nro, blob: Utilities.newBlob(Utilities.base64Decode(du.split('base64,')[1]), mime, baseNombre + '_' + tipo + (nro ? '_' + nro : '') + '.' + ext) }); } catch (e) {} };
    (a0.fotos_precinto || []).forEach((x, i) => { (Array.isArray(x) ? x : [x]).forEach((du, k) => addFoto('precinto_camion' + (i + 1), du, k + 1)); });
    (a0.fotos_guia || []).forEach((du, i) => addFoto('guia', du, i + 1));
    addFoto('animal', a0.foto_animal, 0); addFoto('boton', a0.foto_boton, 0); addFoto('nacimiento', a0.foto_nacimiento, 0); addFoto('ocurrido', a0.foto_ocurrido, 0); addFoto('medicamento', a0.foto_medicamento, 0); if (a0.foto_precinto) addFoto('precinto', a0.foto_precinto, 0);
    (a0.fotos_faltantes || []).forEach((du, i) => addFoto('no_arreados', du, i + 1));
    addFoto('satelite', a0.imagen_satelite, 0);
    let fFotos = null, urlFotos = '', urlFotoBoton = ''; const fotosUrls = [];
    if (fotosLista.length) { fFotos = sub.createFolder('fotos_' + baseNombre); urlFotos = fFotos.getUrl(); fotosLista.forEach(f => { const file = fFotos.createFile(f.blob); fotosUrls.push({ tipo: f.tipo, nro: f.nro, url: file.getUrl() }); if (f.tipo === 'boton') urlFotoBoton = file.getUrl(); }); }
    let fIds = null; if (d0.animales && d0.animales.length) { const csv = 'ide;peso_kg;fuente;raza;sexo;categoria;proveedor;nacimiento;peso_fuente;peso_origen_fecha\n' + d0.animales.map(a => [a.ide, a.peso_kg != null ? a.peso_kg : '', a.fuente || '', a.raza || '', a.sexo || '', a.categoria || '', a.proveedor || '', a.nacimiento || '', a.peso_fuente || (a.peso_kg != null ? 'bascula' : ''), a.peso_fecha || ''].join(';')).join('\n'); fIds = sub.createFile(Utilities.newBlob(csv, 'text/csv', baseNombre + '_ids.csv')); }

    // Fila en "registros" (nueva o reemplazo)
    const d = r.datos || {};
    const ahora = new Date();
    const valores = {
      id: r.id, recibido_en: ahora, creado_en: r.creado_en, tipo_evento: r.tipo_evento, estancia: r.estancia, fecha_evento: r.fecha_evento, respondente: r.respondente,
      chapa_camion: d.chapa_camion || '', cota_nro: d.cota_nro || '', cota_qr: d.cota_qr || '', cota_archivo: d.cota_archivo || '', guia_archivo: d.guia_archivo || '', origen: d.origen || '', destino: d.destino || '', raza: d.raza || '',
      cantidad_animales: d.cantidad_animales || '', cantidad_ids: (d.ids_individuales || []).length, peso_promedio_kg: d.peso_promedio_kg != null ? d.peso_promedio_kg : '', peso_total_kg: d.peso_total_kg != null ? d.peso_total_kg : '', fecha_pesaje: d.fecha_pesaje || '',
      ids_coinciden: r.control ? String(r.control.coincide) : '', cota_coincide: r.control && r.control.cota_coincide != null ? String(r.control.cota_coincide) : '',
      nro_boton: d.nro_boton || '', causa_probable: d.causa_probable || '', madre: d.madre || '', sexo_cria: d.sexo_cria || '', nro_boton_cria: d.nro_boton_cria || '',
      observaciones: r.observaciones || '', lat: r.geo ? r.geo.lat : '', lon: r.geo ? r.geo.lon : '', url_pdf: fPdf.getUrl(), url_json: fJson.getUrl(), id_json: fJson.getId(), url_csv: '', app_version: r.app_version || '',
      lote_controlpasto: r.lote_controlpasto || '', version: version, modificado_en: r.modificado_en || '', actualizado_en_servidor: filaExistente ? ahora : '', nombre_archivo_balanza: r.archivo_balanza ? (r.archivo_balanza.nombre || '') : '',
      cantidad_camiones: d.camiones ? d.camiones.length : (d.chapa_camion ? 1 : ''), cantidad_cotas: d.cotas ? d.cotas.length : (d.cota_nro ? 1 : ''), total_declarado_cotas: d.total_declarado_cotas != null ? d.total_declarado_cotas : (d.cota && d.cota.total_declarado != null ? d.cota.total_declarado : ''),
      guia_coincide: r.control && r.control.guia_coincide != null ? String(r.control.guia_coincide) : '', declarado_coincide: r.control && r.control.declarado_coincide != null ? String(r.control.declarado_coincide) : '',
      grupo: r.grupo || (ES_INTENSIVO_[r.tipo_evento] ? 'intensivo' : 'pasto'), piquete: r.piquete || '', propiedad: d.propiedad || '', propietario: d.propietario || '', origen_tipo: d.origen_tipo || '', origen_sistema: d.origen_sistema || '', origen_lote: d.origen_lote || '', origen_piquete: d.origen_piquete || '', destino_lote: d.destino_lote || '', destino_piquete: d.destino_piquete || '',
      ubic_lat: d.ubicacion ? d.ubicacion.lat : '', ubic_lon: d.ubicacion ? d.ubicacion.lon : '', ubic_precision_m: d.ubicacion && d.ubicacion.precision_m != null ? d.ubicacion.precision_m : '', ubic_fuente: d.ubicacion ? (d.ubicacion.fuente || '') : '', cantidad_sin_peso: d.cantidad_sin_peso != null ? d.cantidad_sin_peso : '',
      cantidad_bascula: d.cantidad_bascula != null ? d.cantidad_bascula : '', cantidad_baston: d.cantidad_baston != null ? d.cantidad_baston : '', conciliacion_pct: d.conciliacion ? d.conciliacion.porcentaje : '', solo_baston: d.conciliacion ? d.conciliacion.solo_baston.length : '', solo_bascula: d.conciliacion ? d.conciliacion.solo_bascula.length : '',
      cantidad_faltantes: d.faltantes ? d.faltantes.cantidad : '', faltantes_lugar: d.faltantes ? d.faltantes.lugar : '', faltantes_motivo: d.faltantes ? d.faltantes.motivo : '', faltantes_capataz: d.faltantes ? d.faltantes.capataz : '', faltantes_auditor: d.faltantes ? d.faltantes.auditor : '', faltantes_conformidad: d.faltantes ? String(!!d.faltantes.conformidad) : '',
      faltantes_peso_medio_kg: d.faltantes && d.faltantes.peso_medio_estimado_kg != null ? d.faltantes.peso_medio_estimado_kg : '', url_fotos: urlFotos, url_ids: fIds ? fIds.getUrl() : '', url_foto_boton: urlFotoBoton,
      inconformidades: (d.inconformidades || []).map(x => x.titulo).join(' | '), justificaciones: (d.inconformidades || []).map(x => (x.tipo || '') + ': ' + (x.justificacion || x.resolucion || '')).join(' | '), cantidad_sin_peso_bascula: d.cantidad_sin_peso_bascula != null ? d.cantidad_sin_peso_bascula : '',
      pesos_historico: d.pesos_completados ? (d.pesos_completados.historico || 0) : '', pesos_manual: d.pesos_completados ? (d.pesos_completados.manual || 0) : '', pesos_promedio: d.pesos_completados ? (d.pesos_completados.promedio || 0) : '', declarado_vs_baston: r.control && r.control.declarado_vs_baston != null ? String(r.control.declarado_vs_baston) : '',
      medic_modo: d.modo || '', medic_aplicaciones: d.aplicaciones ? d.aplicaciones.length : '', medicamentos: (d.medicamentos || []).join(' | '), medic_fuera_de_lista: d.fuera_de_lista != null ? d.fuera_de_lista : '', cantidad_fotos: fotosLista.length, hora_registro: r.creado_en ? hora_(r.creado_en) : ''
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
    { // Libro de eventos por animal (una fila por animal y por registro): movimientos, pesajes, mortalidad, nacimiento, pérdida de botón y acta de no arreados
      const cabIds = cabecera_(hIds, CABECERA_IDS);
      const cts0 = (d.cotas && d.cotas.length) ? d.cotas : [];
      const c1 = (cts0.length === 1 && cts0[0].cota) ? cts0[0].cota : {}; // si hay una sola COTA, sus datos se copian a cada animal
      const guias = cts0.map(x => x.nro_guia).filter(Boolean).join(' / ') || (d.guia_archivo || '');
      const base = { registro_id: r.id, tipo_evento: r.tipo_evento, estancia: r.estancia, fecha_evento: r.fecha_evento, origen: d.origen || '', destino: d.destino || '', cota_nro: d.cota_nro || '', lote_controlpasto: r.lote_controlpasto || '', version: version, piquete: r.piquete || '', grupo: r.grupo || '', hora: r.creado_en ? hora_(r.creado_en) : '', nro_guia: guias, propietario_origen: c1.propietario_origen || '', establecimiento_origen: c1.establecimiento_origen || '', propietario_destino: c1.propietario_destino || '', establecimiento_destino: c1.establecimiento_destino || '', respondente: r.respondente || '', recibido_en: ahora };
      const filasAn = [];
      (d.animales || []).forEach(a => { filasAn.push(Object.assign({}, base, { ide: a.ide, peso_kg: a.peso_kg != null ? a.peso_kg : '', fecha_pesaje: a.fecha_pesaje || d.fecha_pesaje || '', hora_pesaje: a.hora_pesaje || '', fuente: a.fuente || 'bascula', raza: a.raza || '', sexo: a.sexo || '', categoria: a.categoria || '', proveedor: a.proveedor || '', nacimiento: a.nacimiento || '', peso_fuente: a.peso_fuente || (a.peso_kg != null ? 'bascula' : ''), peso_origen_fecha: a.peso_fecha || '', peso_origen_registro: a.peso_registro_id || '' })); });
      if (r.tipo_evento === 'mortalidad' && d.nro_boton) filasAn.push(Object.assign({}, base, { ide: String(d.nro_boton).replace(/\s+/g, ''), fuente: 'manual', causa: d.causa_probable || '', detalle: d.ubicacion ? 'ubicación ' + d.ubicacion.lat + ',' + d.ubicacion.lon : '' }));
      if (r.tipo_evento === 'nacimiento') filasAn.push(Object.assign({}, base, { ide: d.nro_boton_cria ? String(d.nro_boton_cria).replace(/\s+/g, '') : '', fuente: 'manual', sexo: d.sexo_cria || '', categoria: 'ternero', nacimiento: r.fecha_evento, detalle: 'madre: ' + (d.madre || '') + (d.nro_boton_cria ? '' : ' · ternero todavía sin botón') }));
      if (r.tipo_evento === 'medicamento') (d.aplicaciones || []).forEach(p => filasAn.push(Object.assign({}, base, { ide: String(p.brinco || '').replace(/\s+/g, ''), fuente: 'manual', detalle: 'medicamento: ' + (p.medicamento || '') + ' · ' + p.dosis + ' ' + (p.unidad || '') + (p.en_lista ? ' (' + p.codigo_articulo + ')' : ' (fuera de la lista)') })));
      if (r.tipo_evento === 'perdida_boton' && d.nro_boton) filasAn.push(Object.assign({}, base, { ide: String(d.nro_boton).replace(/\s+/g, ''), fuente: 'manual', detalle: 'botón electrónico perdido (número escrito a mano)' }));
      if (d.faltantes && d.faltantes.cantidad) { const f = d.faltantes; (f.ids && f.ids.length ? f.ids : ['']).forEach(ide => filasAn.push(Object.assign({}, base, { ide: ide, fuente: 'acta', peso_kg: f.peso_medio_estimado_kg != null ? f.peso_medio_estimado_kg : '', detalle: 'no arreado: ' + (f.motivo || '') + ' · ' + (f.lugar || '') + (ide ? '' : ' · ' + f.cantidad + ' animales sin identificar') }))); }
      if (filasAn.length) { const filas = filasAn.map(v => cabIds.map(k => (k in v) ? v[k] : '')); hIds.getRange(hIds.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas); }
    }

    // Camiones y COTAs (una fila por camión / por COTA; compatible con registros viejos de una sola chapa)
    if (r.tipo_evento === 'entrada' || r.tipo_evento === 'salida' || (d.camiones && d.camiones.length)) {
      const hCam = hoja_(ss, 'camiones', CABECERA_CAMIONES); if (filaExistente) borrarFilasPorId_(hCam, r.id);
      const fp = (r.adjuntos && r.adjuntos.fotos_precinto) || [];
      const cams = (d.camiones && d.camiones.length) ? d.camiones : (d.chapa_camion ? [{ nro: 1, chapa: d.chapa_camion, foto_precinto: !!(r.adjuntos && r.adjuntos.foto_precinto) }] : []);
      if (cams.length) { const filas = cams.map((c, i) => [r.id, r.tipo_evento, r.estancia, r.fecha_evento, c.nro || (i + 1), c.chapa || '', (c.foto_precinto || fp[i]) ? 'sí' : 'no', version]); hCam.getRange(hCam.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas); }
      const hCot = hoja_(ss, 'cotas', CABECERA_COTAS); if (filaExistente) borrarFilasPorId_(hCot, r.id);
      const cts = (d.cotas && d.cotas.length) ? d.cotas : ((d.cota_nro || d.cota_qr) ? [{ nro: 1, cota_qr: d.cota_qr, cota_nro: d.cota_nro, cota: d.cota }] : []);
      if (cts.length) { const filas = cts.map((ct, i) => { const c = ct.cota || {}; return [r.id, r.tipo_evento, r.estancia, r.fecha_evento, ct.nro || (i + 1), ct.cota_nro || '', c.nro_guia || ct.nro_guia || '', c.fecha_emision || '', c.propietario_origen || '', c.establecimiento_origen || '', c.coord_origen ? c.coord_origen.lat : '', c.coord_origen ? c.coord_origen.lon : '', c.propietario_destino || '', c.establecimiento_destino || '', c.coord_destino ? c.coord_destino.lat : '', c.coord_destino ? c.coord_destino.lon : '', c.finalidad || '', (c.animales_declarados || []).map(x => x.categoria + ' ' + x.cantidad).join(', '), c.total_declarado != null ? c.total_declarado : '', ct.cota_qr || '', version, ct.foto_guia ? 'sí' : '', ct.modo || (ct.cota_qr ? 'qr' : 'manual'), d.cantidad_animales != null ? d.cantidad_animales : '', d.peso_promedio_kg != null ? d.peso_promedio_kg : '', r.respondente || '']; }); hCot.getRange(hCot.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas); }
    }

    // Animales no arreados / faltantes en corral (acta de novedades del pesaje de auditoría)
    if (r.tipo_evento === 'pesaje' || (d.faltantes && d.faltantes.cantidad)) {
      const hF = hoja_(ss, 'faltantes', CABECERA_FALTANTES); if (filaExistente) borrarFilasPorId_(hF, r.id);
      const f = d.faltantes; if (f && f.cantidad) { const an = (f.animales && f.animales.length) ? f.animales : [{ ide: '', peso_kg: null }]; const filas = an.map(a => [r.id, r.tipo_evento, r.estancia, r.fecha_evento, a.ide || '', a.peso_kg != null ? a.peso_kg : '', f.lugar || '', f.motivo || '', f.capataz || '', f.auditor || '', String(!!f.conformidad), version, f.cantidad, f.peso_medio_estimado_kg != null ? f.peso_medio_estimado_kg : '']); hF.getRange(hF.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas); }
    }

    // Aplicaciones de medicamento (una fila por animal y producto)
    if (r.tipo_evento === 'medicamento') {
      const hM = hoja_(ss, 'medicamentos', CABECERA_MEDICAMENTOS); if (filaExistente) borrarFilasPorId_(hM, r.id);
      const cabM = cabecera_(hM, CABECERA_MEDICAMENTOS); const filas = (d.aplicaciones || []).map((p, i) => { const v = { registro_id: r.id, tipo_evento: r.tipo_evento, estancia: r.estancia, fecha_evento: r.fecha_evento, nro: i + 1, brinco: p.brinco || '', medicamento: p.medicamento || '', codigo_articulo: p.codigo_articulo || '', en_lista: String(!!p.en_lista), dosis: p.dosis != null ? p.dosis : '', unidad: p.unidad || '', modo: d.modo || '', lote_controlpasto: r.lote_controlpasto || '', piquete: r.piquete || '', respondente: r.respondente || '', version: version, recibido_en: ahora }; return cabM.map(k => (k in v) ? v[k] : ''); });
      if (filas.length) hM.getRange(hM.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas);
    }

    // Solicitud de transferencia de ganado: fila propia (conserva la decisión si es una versión editada) + correo al aprobador con el enlace
    let aprobadorAvisado = '';
    if (r.tipo_evento === 'solicitud_transferencia') {
      const hS = hoja_(ss, 'solicitudes', CABECERA_SOLICITUDES); const cabS = cabecera_(hS, CABECERA_SOLICITUDES);
      const prev = buscarSolicitud_(hS, r.id); const dec = prev ? prev.fila : null;
      const v = { registro_id: r.id, token: d.token || Utilities.getUuid(), estado: dec && dec.estado ? dec.estado : 'pendiente', creado_en: r.creado_en || '', enviado_en: ahora, estancia_origen: d.origen_nombre || r.estancia || '', codigo_origen: d.origen_codigo || '', estancia_destino: d.destino_nombre || '', codigo_destino: d.destino_codigo || '', categoria: d.categoria || '', cantidad_guias: d.cantidad_guias != null ? d.cantidad_guias : '', animales_por_guia: d.animales_por_guia != null ? d.animales_por_guia : '', total_animales: d.total_animales != null ? d.total_animales : '', total_letras: d.total_letras || '', naturaleza: d.naturaleza || '', fecha: r.fecha_evento || '', lugar: d.lugar || '', solicitante: r.respondente || '', observaciones: r.observaciones || '', decidido_en: dec ? dec.decidido_en : '', aprobador: dec ? dec.aprobador : '', comentario: dec ? dec.comentario : '', hash_firma: dec ? dec.hash_firma : '', url_pdf_firmado: dec ? dec.url_pdf_firmado : '', id_pdf_firmado: dec ? dec.id_pdf_firmado : '', version: version, url_pdf: fPdf.getUrl() };
      if (prev) hS.deleteRow(prev.nro); hS.appendRow(cabS.map(k => (k in v) ? v[k] : ''));
      if (!dec || !dec.estado || dec.estado === 'pendiente') { try { enviarCorreoAprobador_(v, r); aprobadorAvisado = CONFIG.APROBADOR.nombre; } catch (em) { Logger.log('correo aprobador: ' + em); } }
    }

    // Fotos (una fila por archivo guardado en Drive)
    if (fotosUrls.length) { const hFo = hoja_(ss, 'fotos', CABECERA_FOTOS); if (filaExistente) borrarFilasPorId_(hFo, r.id); const filas = fotosUrls.map(f => [r.id, r.tipo_evento, r.estancia, r.fecha_evento, f.tipo, f.nro, f.url, version]); hFo.getRange(hFo.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas); }

    // Log de cambios (historial que manda el app + recepción en el servidor)
    const hLog = hoja_(ss, 'log', CABECERA_LOG);
    const hist = (r.historial || []).filter(h => { const hv = Number(h.version) || 1; return filaExistente ? hv >= version : hv <= version; });
    const filasLog = hist.map(h => [r.id, h.version || 1, h.fecha || '', h.accion || '', h.detalle || '', h.app_version || '', ahora, r.estancia, r.tipo_evento]);
    filasLog.push([r.id, version, ahora.toISOString(), filaExistente ? 'actualizado en el servidor (reemplaza versión ' + versionExistente + ')' : 'recibido en el servidor', nombrePdf, r.app_version || '', ahora, r.estancia, r.tipo_evento]);
    hLog.getRange(hLog.getLastRow() + 1, 1, filasLog.length, filasLog[0].length).setValues(filasLog);

    // Estado actual de cada animal (hoja 'animales'), reconstruido desde el libro de eventos
    try { reconstruirAnimales_(ss); } catch (errAn) { Logger.log('No se pudo reconstruir animales: ' + errAn); }

    // Correo con adjuntos
    const cambios = filaExistente ? ((r.historial || []).filter(h => h.accion === 'editado' && (Number(h.version) || 1) === version).map(h => h.detalle || '').join('; ')) : '';
    const asunto = '[' + etiqueta_(r.tipo_evento) + '] ' + r.estancia + ' ' + fecha_(r.fecha_evento) + ' · ' + r.respondente + (version > 1 ? ' · versión ' + version + ' (editado)' : '');
    MailApp.sendEmail({ to: to, subject: asunto, body: resumen_(r) + (cambios ? '\n\nEdición: ' + cambios : '') + '\n\nArchivos en Drive:\n' + fPdf.getUrl() + '\n' + fJson.getUrl(), attachments: [pdfBlob, jsonBlob], name: 'Registro de manejo' });

    try { borrarRespaldo_(ss, r.id); } catch (errR) { Logger.log('respaldo: ' + errR); } // ya está en la base: la copia del teléfono no hace falta
    return json_({ ok: true, mensaje: filaExistente ? 'actualizado (versión ' + version + ')' : 'recibido', id: r.id, version: version, aprobador: aprobadorAvisado || undefined });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.sol) return HtmlService.createHtmlOutput(paginaAprobacion_(String(p.sol))).setTitle('Solicitud de transferencia de ganado · Ypoti').addMetaTag('viewport', 'width=device-width, initial-scale=1');
  const ss = planilla_(); return json_({ ok: true, mensaje: 'servidor listo v3.7 (use POST)', planilla: ss.getUrl(), carpeta: DriveApp.getFolderById(CONFIG.FOLDER_ID).getUrl() });
}

/* ===================== Contraseñas (4 números) con límite de intentos ===================== */
// Con 4 números hay 10.000 combinaciones: por eso el servidor cuenta las claves incorrectas y, después de CONFIG.MAX_FALLOS
// en 15 minutos, bloquea esa estancia (o la clave maestra / de aprobación) por 15 minutos. El app no guarda las claves.
function cache_() { try { return CacheService.getScriptCache(); } catch (e) { return null; } }
function bloqueado_(k) { const c = cache_(); return !!c && Number(c.get('fallos_' + k) || 0) >= (CONFIG.MAX_FALLOS || 8); }
function registrarFallo_(k) { const c = cache_(); if (!c) return; const n = Number(c.get('fallos_' + k) || 0) + 1; c.put('fallos_' + k, String(n), 900); }
function claveMaestra_(clave) { const k = 'maestra'; if (bloqueado_(k)) return { ok: false, bloqueado: true, error: 'demasiados intentos con clave incorrecta: espere 15 minutos' }; const c = String(clave == null ? '' : clave).trim(); if (c && CONFIG.CLAVE_MAESTRA && c === String(CONFIG.CLAVE_MAESTRA)) return { ok: true, maestra: true }; registrarFallo_(k); return { ok: false, error: 'clave maestra incorrecta' }; }
function claveEstancia_(est, clave) { // {ok, maestra, error}
  const k = 'est_' + (CONFIG.CLAVES[est] ? est : 'Otra');
  if (bloqueado_(k)) return { ok: false, bloqueado: true, error: 'demasiados intentos con clave incorrecta para ' + est + ': espere 15 minutos' };
  const c = String(clave == null ? '' : clave).trim(); const esperada = String(CONFIG.CLAVES[est] || CONFIG.CLAVES['Otra']);
  if (c && c === esperada) return { ok: true, maestra: false };
  if (c && CONFIG.CLAVE_MAESTRA && c === String(CONFIG.CLAVE_MAESTRA)) return { ok: true, maestra: true };
  registrarFallo_(k); return { ok: false, error: 'clave incorrecta para la estancia ' + est };
}

/* ===================== Copias de seguridad de los teléfonos y recuperación ===================== */
function filaPor_(h, col, valor) { // {nro (1-based), fila (objeto)} o null
  if (!h || h.getLastRow() < 2) return null; const v = h.getRange(1, 1, h.getLastRow(), h.getLastColumn()).getValues(); const cab = v[0].map(String); const i = cab.indexOf(col); if (i < 0) return null;
  for (let r = 1; r < v.length; r++) { if (String(v[r][i]) === String(valor)) { const o = {}; cab.forEach((c, j) => { let x = v[r][j]; if (x instanceof Date) x = Utilities.formatDate(x, 'America/Asuncion', "yyyy-MM-dd'T'HH:mm:ss"); o[c] = x; }); return { nro: r + 1, fila: o }; } }
  return null;
}
function filasDe_(ss, nombre) { const h = ss.getSheetByName(nombre); if (!h || h.getLastRow() < 2) return []; const v = h.getRange(1, 1, h.getLastRow(), h.getLastColumn()).getValues(); const cab = v[0].map(String); return v.slice(1).map(row => { const o = {}; cab.forEach((k, i) => { let x = row[i]; if (x instanceof Date) x = Utilities.formatDate(x, 'America/Asuncion', "yyyy-MM-dd'T'HH:mm:ss"); o[k] = x; }); return o; }); }
function versionPublicada_(ss, id) { const q = filaPor_(ss.getSheetByName('registros'), 'id', id); return q ? (Number(q.fila.version) || 1) : 0; }
function respaldo_(body, lock) {
  const id = String(body.id || ''); if (!/^[A-Za-z0-9-]{8,64}$/.test(id) || !body.wrapper) return json_({ ok: false, error: 'respaldo inválido' });
  const contenido = JSON.stringify(body.wrapper); if (contenido.length > 45 * 1024 * 1024) return json_({ ok: false, error: 'respaldo demasiado grande' });
  lock.waitLock(30000);
  const ss = planilla_(); const version = Number(body.version) || 0;
  if (!body.edicion) { const pv = versionPublicada_(ss, id); if (pv && pv >= version) { borrarRespaldo_(ss, id); return json_({ ok: true, mensaje: 'ya está publicado en la base', ignorado: true }); } }
  const hR = hoja_(ss, 'respaldos', CABECERA_RESPALDOS); const cab = cabecera_(hR, CABECERA_RESPALDOS); const q = filaPor_(hR, 'id', id);
  let file = null;
  if (q && q.fila.id_archivo) { try { file = DriveApp.getFileById(String(q.fila.id_archivo)); file.setContent(contenido); } catch (e) { try { if (file) file.setTrashed(true); } catch (x) {} file = null; } }
  if (!file) file = subcarpeta_(DriveApp.getFolderById(CONFIG.FOLDER_ID), 'respaldos_telefonos').createFile(Utilities.newBlob(contenido, 'application/json', 'respaldo_' + id + '.json'));
  const v = { id: id, estancia: body.estancia || '', tipo_evento: body.tipo_evento || '', estado_local: body.estado_local || '', edicion: String(!!body.edicion), respondente: body.respondente || '', version: version, actualizado_en: body.actualizado_en || '', recibido_en: new Date(), id_archivo: file.getId(), url: file.getUrl(), tamano_kb: Math.round(contenido.length / 1024), dispositivo: body.dispositivo || '', app_version: body.app_version || '' };
  const fila = cab.map(k => (k in v) ? v[k] : '');
  if (q) hR.getRange(q.nro, 1, 1, fila.length).setValues([fila]); else hR.appendRow(fila);
  return json_({ ok: true, mensaje: 'copia guardada', id_archivo: file.getId() });
}
function borrarRespaldo_(ss, id) { const hR = ss.getSheetByName('respaldos'); const q = filaPor_(hR, 'id', id); if (!q) return false; if (q.fila.id_archivo) { try { DriveApp.getFileById(String(q.fila.id_archivo)).setTrashed(true); } catch (e) {} } hR.deleteRow(q.nro); return true; }
function claveRecuperar_(body) { // estancia normal (su clave, 'Otra' para las escritas a mano, o la maestra) o '*' = todas (solo maestra)
  const est = String(body.estancia || '');
  if (est === '*') { const m = claveMaestra_(body.clave); return m.ok ? { ok: true, todas: true } : { ok: false, error: 'para todas las estancias hace falta la clave maestra' + (m.bloqueado ? ' (' + m.error + ')' : '') }; }
  if (!est) return { ok: false, error: 'falta la estancia' };
  const cv = claveEstancia_(est, body.clave); return cv.ok ? { ok: true, todas: false, estancia: est } : { ok: false, error: cv.error };
}
function recuperar_(body) {
  const c = claveRecuperar_(body); if (!c.ok) return json_({ ok: false, error: c.error });
  const ss = planilla_(); const desde = String(body.desde || ''); const deEst = o => c.todas || String(o.estancia) === c.estancia;
  const registros = filasDe_(ss, 'registros').filter(o => o.id && deEst(o) && (!desde || String(o.fecha_evento).slice(0, 10) >= desde)).map(o => ({ id: o.id, version: Number(o.version) || 1, tipo_evento: o.tipo_evento, fecha_evento: String(o.fecha_evento).slice(0, 10), estancia: o.estancia, respondente: o.respondente, recibido_en: o.actualizado_en_servidor || o.recibido_en }));
  const respaldos = filasDe_(ss, 'respaldos').filter(o => o.id && deEst(o)).map(o => ({ id: o.id, version: Number(o.version) || 0, tipo_evento: o.tipo_evento, estado_local: o.estado_local, edicion: String(o.edicion) === 'true', estancia: o.estancia, respondente: o.respondente, actualizado_en: o.actualizado_en, tamano_kb: o.tamano_kb }));
  return json_({ ok: true, estancia: c.todas ? '*' : c.estancia, registros: registros, respaldos: respaldos });
}
function idArchivo_(o) { if (o.id_json) return String(o.id_json); const m = /\/d\/([A-Za-z0-9_-]+)/.exec(String(o.url_json || '')) || /[?&]id=([A-Za-z0-9_-]+)/.exec(String(o.url_json || '')); return m ? m[1] : ''; }
function recuperarItems_(body) {
  const c = claveRecuperar_(body); if (!c.ok) return json_({ ok: false, error: c.error });
  const ss = planilla_(); const items = (body.items || []).slice(0, 10); const out = [];
  items.forEach(it => {
    try {
      const fuente = it.fuente === 'respaldo' ? 'respaldo' : 'registro'; const q = filaPor_(ss.getSheetByName(fuente === 'respaldo' ? 'respaldos' : 'registros'), 'id', it.id); if (!q) return;
      const o = q.fila; if (!c.todas && String(o.estancia) !== c.estancia) return;
      const fid = fuente === 'respaldo' ? String(o.id_archivo || '') : idArchivo_(o); if (!fid) return;
      const contenido = JSON.parse(DriveApp.getFileById(fid).getBlob().getDataAsString('UTF-8'));
      out.push({ id: it.id, fuente: fuente, contenido: contenido, recibido_en: o.actualizado_en_servidor || o.recibido_en || '', actualizado_en: o.actualizado_en || '' });
    } catch (e) { Logger.log('recuperar ' + it.id + ': ' + e); }
  });
  return json_({ ok: true, items: out });
}

// Brincos activos de una estancia, para sugerirlos en el app al escribir el Nº de botón (mortalidad, medicamento).
// Fuente: hoja 'animales' (estado activo y estancia actual) + hoja opcional 'brincos_activos' (ide, estancia, lote, categoria),
// que se puede llenar con una exportación del stock (ControlPasto / SIGOR) para cubrir animales que todavía no pasaron por el app.
function brincos_(body) {
  const est = String(body.estancia || ''); const ss = planilla_(); const out = {}; const fuera = {};
  filasDe_(ss, 'animales').forEach(o => { const ide = String(o.ide || '').replace(/\s+/g, ''); if (!ide) return; if (String(o.estado) !== 'activo') { fuera[ide] = true; return; } if (est && String(o.estancia_actual) !== est) return; out[ide] = [ide, String(o.lote_actual || ''), String(o.categoria || ''), 'base']; });
  filasDe_(ss, 'brincos_activos').forEach(o => { const ide = String(o.ide || o.brinco || '').replace(/\s+/g, ''); if (!ide || fuera[ide] || out[ide]) return; const e = String(o.estancia || ''); if (est && e && e !== est) return; out[ide] = [ide, String(o.lote || ''), String(o.categoria || ''), 'planilla']; });
  return json_({ ok: true, estancia: est, cantidad: Object.keys(out).length, brincos: Object.keys(out).sort().map(k => out[k]), generado_en: new Date().toISOString() });
}

/* ===================== Solicitudes de transferencia de ganado ===================== */
function buscarSolicitud_(hS, clave, porToken) { // devuelve {nro (fila 1-based), fila (objeto)} o null
  if (!hS || hS.getLastRow() < 2) return null; const v = hS.getRange(1, 1, hS.getLastRow(), hS.getLastColumn()).getValues(); const cab = v[0].map(String); const k = porToken ? 'token' : 'registro_id'; const i = cab.indexOf(k);
  for (let r = 1; r < v.length; r++) { if (String(v[r][i]) === String(clave)) { const o = {}; cab.forEach((c, j) => { let x = v[r][j]; if (x instanceof Date) x = Utilities.formatDate(x, 'America/Asuncion', "yyyy-MM-dd'T'HH:mm:ss"); o[c] = x; }); return { nro: r + 1, fila: o }; } }
  return null;
}
function actualizarSolicitud_(hS, nro, cambios) { const cab = hS.getRange(1, 1, 1, hS.getLastColumn()).getValues()[0].map(String); Object.keys(cambios).forEach(k => { const i = cab.indexOf(k); if (i >= 0) hS.getRange(nro, i + 1).setValue(cambios[k]); }); }
function urlSolicitud_(token) { return ScriptApp.getService().getUrl() + '?sol=' + encodeURIComponent(token); }
function esc_(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function filasSolicitud_(s) { return [['Categoría', s.categoria], ['Origen', s.estancia_origen + ' · cód. ' + s.codigo_origen], ['Destino', s.estancia_destino + ' · cód. ' + s.codigo_destino], ['Guías', s.cantidad_guias + ' guías de ' + s.animales_por_guia + ' animales'], ['Total', s.total_animales + ' animales (' + s.total_letras + ')'], ['Naturaleza', s.naturaleza], ['Fecha', fecha_(String(s.fecha).slice(0, 10)) + ' · ' + s.lugar], ['Solicita', s.solicitante]].concat(s.observaciones ? [['Observaciones', s.observaciones]] : []); }
function enviarCorreoAprobador_(s, r) {
  const link = urlSolicitud_(s.token); const filas = filasSolicitud_(s);
  const html = '<div style="font-family:Arial,Helvetica,sans-serif;max-width:620px;margin:0 auto;color:#1B1F1B">'
    + '<div style="background:#04522B;color:#fff;padding:14px 18px;border-radius:10px 10px 0 0"><div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.85">Rural Bioenergía S.A. · Ypoti</div><div style="font-size:20px;font-weight:700">📨 Solicitud de transferencia de ganado</div></div>'
    + '<div style="border:1px solid #D6D3C7;border-top:0;padding:16px 18px;border-radius:0 0 10px 10px;background:#fff">'
    + '<p style="margin:0 0 12px">Hola ' + esc_(CONFIG.APROBADOR.nombre) + ', <b>' + esc_(s.solicitante) + '</b> pide aprobar la siguiente declaración de traslado de stock:</p>'
    + '<table style="border-collapse:collapse;width:100%;font-size:14px">' + filas.map(f => '<tr><td style="padding:6px 8px;color:#777F72;border-bottom:1px solid #ECEAE2;white-space:nowrap">' + esc_(f[0]) + '</td><td style="padding:6px 8px;border-bottom:1px solid #ECEAE2"><b>' + esc_(f[1]) + '</b></td></tr>').join('') + '</table>'
    + '<p style="margin:18px 0"><a href="' + link + '" style="display:inline-block;background:#04522B;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px">✅ Revisar, aprobar o rechazar</a></p>'
    + '<p style="font-size:12px;color:#777F72">El enlace pide la contraseña de aprobación. Una vez decidido, el sistema genera el PDF firmado digitalmente y lo guarda en el Drive de trazabilidad. ID ' + esc_(String(s.registro_id).slice(0, 8)) + '.</p></div></div>';
  const texto = 'Solicitud de transferencia de ganado\n\n' + filas.map(f => f[0] + ': ' + f[1]).join('\n') + '\n\nAprobar o rechazar: ' + link;
  MailApp.sendEmail({ to: CONFIG.APROBADOR.mail, subject: '[Solicitud de transferencia] ' + s.categoria + ' · ' + s.estancia_origen + ' → ' + s.estancia_destino + ' · ' + s.total_animales + ' animales', body: texto, htmlBody: html, name: 'Registro de manejo · Ypoti' });
}
function claveAprobacionOk_(clave) { const k = 'aprobacion'; if (bloqueado_(k)) return false; const c = String(clave == null ? '' : clave).trim(); if (c && (c === String(CONFIG.CLAVE_APROBACION) || (CONFIG.CLAVE_MAESTRA && c === String(CONFIG.CLAVE_MAESTRA)))) return true; registrarFallo_(k); return false; }
// Llamadas desde la página de aprobación (google.script.run)
function verSolicitud(token, clave) {
  if (!claveAprobacionOk_(clave)) return { ok: false, error: bloqueado_('aprobacion') ? 'Demasiados intentos con contraseña incorrecta: espere 15 minutos.' : 'Contraseña incorrecta.' };
  const hS = hoja_(planilla_(), 'solicitudes', CABECERA_SOLICITUDES); const q = buscarSolicitud_(hS, token, true); if (!q) return { ok: false, error: 'No existe una solicitud con ese enlace.' };
  const s = q.fila; return { ok: true, solicitud: { registro_id: s.registro_id, estado: s.estado, filas: filasSolicitud_(s), decidido_en: s.decidido_en, aprobador: s.aprobador, comentario: s.comentario, hash_firma: s.hash_firma, url_pdf_firmado: s.url_pdf_firmado, aprobador_default: CONFIG.APROBADOR.nombre, pdf_base64: s.id_pdf_firmado ? pdfBase64_(s.id_pdf_firmado) : '' } };
}
function decidirSolicitud(token, clave, decision, comentario, aprobador) {
  if (!claveAprobacionOk_(clave)) return { ok: false, error: 'Contraseña incorrecta.' };
  if (decision !== 'aprobada' && decision !== 'rechazada') return { ok: false, error: 'Decisión inválida.' };
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const ss = planilla_(); const hS = hoja_(ss, 'solicitudes', CABECERA_SOLICITUDES); const q = buscarSolicitud_(hS, token, true); if (!q) return { ok: false, error: 'No existe una solicitud con ese enlace.' };
    const s = q.fila; if (s.estado && s.estado !== 'pendiente') return { ok: false, error: 'Esta solicitud ya fue ' + s.estado + (s.aprobador ? ' por ' + s.aprobador : '') + '.' };
    const ahora = new Date(); const nombre = String(aprobador || CONFIG.APROBADOR.nombre).trim(); const com = String(comentario || '').trim();
    const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token + '|' + decision + '|' + ahora.toISOString() + '|' + nombre + '|' + CONFIG.CLAVE_APROBACION).map(b => ('0' + (b & 255).toString(16)).slice(-2)).join('');
    s.estado = decision; s.decidido_en = Utilities.formatDate(ahora, 'America/Asuncion', "yyyy-MM-dd'T'HH:mm:ss"); s.aprobador = nombre; s.comentario = com; s.hash_firma = hash;
    const pdfBlob = pdfFirmado_(s); const root = DriveApp.getFolderById(CONFIG.FOLDER_ID); const sub = subcarpeta_(root, s.estancia_origen || 'sin_estancia'); const f = sub.createFile(pdfBlob);
    actualizarSolicitud_(hS, q.nro, { estado: decision, decidido_en: s.decidido_en, aprobador: nombre, comentario: com, hash_firma: hash, url_pdf_firmado: f.getUrl(), id_pdf_firmado: f.getId() });
    try { const hL = hoja_(ss, 'log', CABECERA_LOG); hL.appendRow([s.registro_id, s.version || 1, s.decidido_en, 'solicitud ' + decision, (nombre + (com ? ': ' + com : '')), 'servidor', s.decidido_en, s.estancia_origen, 'solicitud_transferencia']); } catch (x) {}
    try { MailApp.sendEmail({ to: CONFIG.MAIL_DEFAULT, subject: '[Solicitud ' + decision.toUpperCase() + '] ' + s.categoria + ' · ' + s.estancia_origen + ' → ' + s.estancia_destino + ' · ' + s.total_animales + ' animales', body: 'Solicitud ' + decision + ' por ' + nombre + ' el ' + s.decidido_en + (com ? '\nComentario: ' + com : '') + '\n\nPDF firmado: ' + f.getUrl(), attachments: [pdfBlob], name: 'Registro de manejo · Ypoti' }); } catch (x) {}
    return { ok: true, estado: decision, decidido_en: s.decidido_en, aprobador: nombre, comentario: com, hash_firma: hash, url_pdf_firmado: f.getUrl(), pdf_base64: Utilities.base64Encode(pdfBlob.getBytes()), nombre_pdf: pdfBlob.getName() };
  } finally { try { lock.releaseLock(); } catch (x) {} }
}
function pdfBase64_(fileId) { try { return Utilities.base64Encode(DriveApp.getFileById(fileId).getBlob().getBytes()); } catch (e) { return ''; } }
function pdfFirmado_(s) { // la declaración con el sello de aprobación / rechazo, convertida de HTML a PDF
  const em = CONFIG.EMPRESA; const ok = s.estado === 'aprobada'; const fecha = fecha_(String(s.fecha).slice(0, 10)); const dec = s.decidido_en ? String(s.decidido_en).replace('T', ' ').slice(0, 16) : '';
  const html = '<html><head><meta charset="utf-8"><style>body{font-family:Helvetica,Arial,sans-serif;color:#1B1F1B;font-size:12.5pt;margin:40px 48px}h1{color:#04522B;font-size:20pt;text-align:center;margin:0 0 4px}h2{font-size:14pt;text-align:center;margin:0 0 18px}p{line-height:1.5;margin:0 0 10px}.sello{border:2px solid ' + (ok ? '#04522B' : '#701E0C') + ';color:' + (ok ? '#04522B' : '#701E0C') + ';border-radius:8px;padding:10px 14px;margin:18px 0;font-size:11pt}.sello b{font-size:14pt;letter-spacing:.08em}.firma{margin-top:36px}.firma .linea{border-top:1px solid #1B1F1B;width:260px;padding-top:6px}.pie{margin-top:40px;font-size:9.5pt;color:#777F72}.mono{font-family:Courier,monospace;font-size:9.5pt}</style></head><body>'
    + '<h1>Informativo</h1><h2>DECLARACIÓN DE TRASLADO<br>DE STOCK DE ANIMALES</h2>'
    + '<p>La empresa <b>' + esc_(em.razon_social) + '</b>, RUC N° ' + esc_(em.ruc) + ', en adelante denominada <b>EMISORA</b>, por medio del presente instrumento declara que emite <b>Guías de traslado interno</b>, en concepto de movimiento de ' + esc_(String(s.categoria).toLowerCase()) + ' en la ' + esc_(s.estancia_origen) + ' a ' + esc_(s.estancia_destino) + ', conforme se detalla a continuación.</p>'
    + '<p><b>Objeto:</b> Emisión de ' + esc_(s.cantidad_guias) + ' Guías de ' + esc_(s.animales_por_guia) + ' correspondiente a ' + esc_(s.total_animales) + ' (' + esc_(s.total_letras) + ') perteneciente al stock de ' + esc_(em.razon_social) + '.<br>Establecimiento ORIGEN código <b>[' + esc_(s.codigo_origen) + '] – ' + esc_(s.estancia_origen) + '</b><br>Establecimiento DESTINO código <b>[' + esc_(s.codigo_destino) + '] – ' + esc_(s.estancia_destino) + '</b></p>'
    + '<p><b>Naturaleza de la operación:</b> ' + esc_(s.naturaleza) + '</p><p><b>Fecha:</b> ' + esc_(fecha) + '<br>En fe de lo cual, y para los fines que correspondan, se suscribe el presente documento.</p>'
    + (s.observaciones ? '<p><b>Observaciones del solicitante:</b> ' + esc_(s.observaciones) + '</p>' : '')
    + '<div class="sello"><b>' + (ok ? 'APROBADA' : 'RECHAZADA') + '</b><br>' + (ok ? 'Firmado digitalmente' : 'Decisión registrada digitalmente') + ' por <b>' + esc_(s.aprobador) + '</b> · ' + esc_(CONFIG.APROBADOR.cargo) + ' · ' + esc_(dec) + ' (hora de Paraguay)' + (s.comentario ? '<br>Comentario: ' + esc_(s.comentario) : '') + '<br><span class="mono">Verificación SHA-256: ' + esc_(s.hash_firma) + '</span><br><span class="mono">Solicitud ' + esc_(String(s.registro_id)) + ' · solicitada por ' + esc_(s.solicitante) + '</span></div>'
    + '<p style="text-align:right">' + esc_(s.lugar) + ', ' + esc_(fecha) + '</p>'
    + '<div class="firma"><div class="linea"><b>' + esc_(s.aprobador) + '</b><br>' + esc_(em.razon_social) + '<br>' + esc_(CONFIG.APROBADOR.cargo) + '</div></div>'
    + '<div class="pie">' + esc_(em.razon_social) + '<br>' + esc_(em.direccion) + '<br>Tel.: ' + esc_(em.tel) + '<br>Documento generado automáticamente por el sistema de trazabilidad; la firma digital se verifica con el código SHA-256 indicado.</div></body></html>';
  const nombre = 'solicitud_' + String(s.estancia_origen || '').replace(/[^A-Za-z0-9]+/g, '_') + '_' + String(s.fecha).slice(0, 10) + '_' + String(s.registro_id).slice(0, 8) + '_' + s.estado + '.pdf';
  return Utilities.newBlob(html, 'text/html', 'firmado.html').getAs('application/pdf').setName(nombre);
}
function estadoSolicitud_(body) { // el app pregunta por sus solicitudes enviadas; devuelve estado, decisión y (si falta en el teléfono) el PDF firmado
  const lista = body.solicitudes || []; if (!lista.length) return json_({ ok: true, solicitudes: {} });
  const hS = planilla_().getSheetByName('solicitudes'); const out = {};
  lista.slice(0, 50).forEach(x => { const q = hS ? buscarSolicitud_(hS, x.id) : null; if (!q) return; const s = q.fila; if (x.token && String(s.token) !== String(x.token)) return; const o = { estado: s.estado || 'pendiente', decidido_en: s.decidido_en || null, aprobador: s.aprobador || null, comentario: s.comentario || null, hash: s.hash_firma || null, url_pdf_firmado: s.url_pdf_firmado || null }; if (s.id_pdf_firmado && !x.con_pdf) o.pdf_base64 = pdfBase64_(s.id_pdf_firmado); out[x.id] = o; });
  return json_({ ok: true, solicitudes: out });
}
function paginaAprobacion_(token) {
  return '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Solicitud de transferencia de ganado</title><style>'
    + ':root{--brand:#04522B;--accent:#701E0C;--bg:#F4F3EE;--ink:#1B1F1B;--muted:#777F72;--line:#D6D3C7}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.45}.wrap{max-width:560px;margin:0 auto;padding:18px 16px 40px}.top{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid var(--brand);padding-bottom:10px;margin-bottom:16px}.top b{font-size:22px;color:var(--brand);letter-spacing:.02em}.top small{color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-size:11px}.card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:14px;box-shadow:0 6px 18px rgba(0,0,0,.06)}h1{font-size:20px;margin:0 0 6px}p{margin:0 0 10px}label{display:block;font-weight:600;margin:10px 0 6px}input,textarea{width:100%;font:inherit;padding:12px;border:1px solid #A8A597;border-radius:8px;background:#fff}textarea{min-height:90px}.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;font:inherit;font-weight:700;padding:14px;border-radius:10px;border:1px solid var(--line);background:#fff;color:var(--ink);cursor:pointer;margin-top:8px}.btn.ok{background:var(--brand);border-color:var(--brand);color:#fff}.btn.no{background:#fff;border-color:var(--accent);color:var(--accent)}.btn:disabled{opacity:.5}.dots{display:flex;justify-content:center;gap:16px;margin:16px 0 10px}.dots i{width:16px;height:16px;border-radius:50%;border:2px solid var(--brand)}.dots i.on{background:var(--brand)}.pad{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:300px;margin:8px auto 0}.pad button{font:600 26px -apple-system,"Segoe UI",Roboto,Arial,sans-serif;height:64px;border-radius:14px;border:1px solid var(--line);background:#fff;color:var(--ink);cursor:pointer}.pad button:active{background:#DCEAE0}.pad button.sec{font-size:20px;color:var(--muted)}.pad button.okk{background:var(--brand);color:#fff;border-color:var(--brand)}.sacude{animation:sacude .35s}@keyframes sacude{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}table{width:100%;border-collapse:collapse;font-size:15px}td{padding:7px 6px;border-bottom:1px solid #ECEAE2;vertical-align:top}td:first-child{color:var(--muted);white-space:nowrap;width:34%}.msg{padding:12px 14px;border-radius:8px;margin-top:10px;background:#ECEAE2}.msg.bad{background:#F6E0DA;color:#8A2A12}.msg.ok{background:#DCEAE0;color:var(--brand)}.sello{border:2px solid var(--brand);border-radius:10px;padding:12px 14px;color:var(--brand);margin-top:12px}.sello.no{border-color:var(--accent);color:var(--accent)}.mono{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;word-break:break-all}.hidden{display:none}'
    + '</style></head><body><div class="wrap"><div class="top"><div><small>Rural Bioenergía S.A.</small><br><b>YPOTI</b></div><div style="text-align:right;color:var(--muted);font-size:13px">Solicitud de transferencia<br>de ganado</div></div>'
    + '<div class="card" id="paso-clave"><h1>Aprobación de traslado</h1><p>Este enlace es para aprobar o rechazar una declaración de traslado de stock. Toque la contraseña de aprobación (4 números) para ver los datos.</p><input type="hidden" id="clave"><div class="dots" id="dots"><i></i><i></i><i></i><i></i></div><div class="msg bad hidden" id="err-clave"></div><div class="pad" id="pad"><button data-k="1">1</button><button data-k="2">2</button><button data-k="3">3</button><button data-k="4">4</button><button data-k="5">5</button><button data-k="6">6</button><button data-k="7">7</button><button data-k="8">8</button><button data-k="9">9</button><button data-k="del" class="sec">⌫</button><button data-k="0">0</button><button data-k="ok" class="okk" id="b-ver">✓</button></div></div>'
    + '<div class="card hidden" id="paso-datos"><h1>Datos de la solicitud</h1><table id="tabla"></table><div id="ya" class="hidden"></div><div id="decidir"><label for="aprobador">Quien decide</label><input type="text" id="aprobador"><label for="comentario">Comentario (opcional, va al solicitante y al PDF)</label><textarea id="comentario" placeholder="Observaciones, condiciones, motivo del rechazo…"></textarea><button class="btn ok" id="b-ok">✅ Aprobar y firmar</button><button class="btn no" id="b-no">✖ Rechazar</button><div class="msg bad hidden" id="err-dec"></div></div></div>'
    + '<div class="card hidden" id="paso-fin"><h1 id="fin-titulo"></h1><div class="sello" id="sello"></div><a class="btn ok" id="b-pdf" download>📄 Descargar PDF firmado</a><p style="color:var(--muted);font-size:13px;margin-top:10px">El PDF también quedó guardado en el Drive de trazabilidad y el solicitante lo ve en su teléfono. Puede reenviarlo a quien corresponda.</p></div>'
    + '<script>var TOKEN=' + JSON.stringify(token) + ';var CLAVE="";function $(i){return document.getElementById(i)}function pinSet(v){$("clave").value=v;var d=$("dots").children;for(var i=0;i<d.length;i++)d[i].className=i<v.length?"on":""}function pinTecla(k){var v=$("clave").value;if(k==="del")v=v.slice(0,-1);else if(k==="ok"){if(v.length===4)$("b-ver").onclick();return}else if(/^\\d$/.test(k)&&v.length<4)v+=k;pinSet(v);if(v.length===4)setTimeout(function(){$("b-ver").onclick()},120)}function run(fn){var a=Array.prototype.slice.call(arguments,1);return new Promise(function(res,rej){var r=google.script.run.withSuccessHandler(res).withFailureHandler(function(e){rej(e)});r[fn].apply(r,a)})}'
    + 'function tabla(f){$("tabla").innerHTML=f.map(function(x){return "<tr><td>"+esc(x[0])+"</td><td><b>"+esc(x[1])+"</b></td></tr>"}).join("")}function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;")}'
    + 'function b64link(b64,nombre){var a=$("b-pdf");if(!b64){a.classList.add("hidden");return}a.href="data:application/pdf;base64,"+b64;a.download=nombre||"solicitud_firmada.pdf";a.classList.remove("hidden")}'
    + 'function fin(s){$("paso-datos").classList.add("hidden");$("paso-fin").classList.remove("hidden");var ok=s.estado==="aprobada";$("fin-titulo").textContent=ok?"Solicitud aprobada":"Solicitud rechazada";var se=$("sello");se.className="sello"+(ok?"":" no");se.innerHTML="<b>"+(ok?"APROBADA":"RECHAZADA")+"</b> por "+esc(s.aprobador)+" · "+esc(String(s.decidido_en||"").replace("T"," ").slice(0,16))+(s.comentario?"<br>Comentario: "+esc(s.comentario):"")+"<br><span class=mono>SHA-256 "+esc(s.hash_firma)+"</span>";b64link(s.pdf_base64,s.nombre_pdf)}'
    + '$("b-ver").onclick=function(){var c=$("clave").value;if(c.length!==4||$("b-ver").disabled)return;$("b-ver").disabled=true;$("err-clave").classList.add("hidden");run("verSolicitud",TOKEN,c).then(function(r){$("b-ver").disabled=false;if(!r.ok){$("err-clave").textContent=r.error;$("err-clave").classList.remove("hidden");pinSet("");var p=$("pad");p.classList.remove("sacude");void p.offsetWidth;p.classList.add("sacude");return}CLAVE=c;var s=r.solicitud;$("paso-clave").classList.add("hidden");if(s.estado&&s.estado!=="pendiente"){tabla(s.filas);$("paso-datos").classList.remove("hidden");$("decidir").classList.add("hidden");var y=$("ya");y.classList.remove("hidden");y.className="sello"+(s.estado==="aprobada"?"":" no");y.innerHTML="Esta solicitud ya fue <b>"+esc(s.estado.toUpperCase())+"</b> por "+esc(s.aprobador)+" · "+esc(String(s.decidido_en||"").replace("T"," ").slice(0,16))+(s.comentario?"<br>Comentario: "+esc(s.comentario):"")+"<br><span class=mono>SHA-256 "+esc(s.hash_firma)+"</span>";if(s.pdf_base64){var a=document.createElement("a");a.className="btn ok";a.textContent="📄 Descargar PDF firmado";a.href="data:application/pdf;base64,"+s.pdf_base64;a.download="solicitud_firmada.pdf";y.appendChild(a)}return}tabla(s.filas);$("aprobador").value=s.aprobador_default||"";$("paso-datos").classList.remove("hidden")}).catch(function(e){$("b-ver").disabled=false;$("err-clave").textContent="Error: "+(e&&e.message||e);$("err-clave").classList.remove("hidden")})};'
    + 'function decidir(d){var txt=d==="aprobada"?"¿Aprobar y firmar digitalmente esta solicitud?":"¿Rechazar esta solicitud?";if(!window.confirm(txt))return;$("b-ok").disabled=true;$("b-no").disabled=true;$("err-dec").classList.add("hidden");run("decidirSolicitud",TOKEN,CLAVE,d,$("comentario").value,$("aprobador").value).then(function(r){if(!r.ok){$("err-dec").textContent=r.error;$("err-dec").classList.remove("hidden");$("b-ok").disabled=false;$("b-no").disabled=false;return}fin(r)}).catch(function(e){$("err-dec").textContent="Error: "+(e&&e.message||e);$("err-dec").classList.remove("hidden");$("b-ok").disabled=false;$("b-no").disabled=false})}'
    + '$("b-ok").onclick=function(){decidir("aprobada")};$("b-no").onclick=function(){decidir("rechazada")};$("pad").addEventListener("click",function(e){var b=e.target.closest("button");if(b)pinTecla(b.getAttribute("data-k"))});document.addEventListener("keydown",function(e){if($("paso-clave").classList.contains("hidden"))return;if(/^\\d$/.test(e.key))pinTecla(e.key);else if(e.key==="Backspace")pinTecla("del");else if(e.key==="Enter")pinTecla("ok")});</script></div></body></html>';
}

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
  hoja_(ss, 'log', CABECERA_LOG); hoja_(ss, 'camiones', CABECERA_CAMIONES); hoja_(ss, 'cotas', CABECERA_COTAS); hoja_(ss, 'faltantes', CABECERA_FALTANTES); hoja_(ss, 'medicamentos', CABECERA_MEDICAMENTOS); hoja_(ss, 'solicitudes', CABECERA_SOLICITUDES); hoja_(ss, 'respaldos', CABECERA_RESPALDOS); hoja_(ss, 'fotos', CABECERA_FOTOS); hoja_(ss, 'animales', CABECERA_ANIMALES);
  Logger.log('Planilla: ' + ss.getName() + ' -> ' + ss.getUrl());
  return ss.getUrl();
}

// Consulta para el informe de trazabilidad: devuelve los registros de una estancia en un período (sin fotos), con camiones, COTAs, faltantes y enlaces a Drive.
function consulta_(body) {
  const est = body.estancia || ''; const cv = claveEstancia_(est, body.clave); if (!cv.ok) return json_({ ok: false, error: cv.error });
  const desde = String(body.desde || '0000-00-00'), hasta = String(body.hasta || '9999-99-99');
  const ss = planilla_();
  const leer = (nombre) => { const h = ss.getSheetByName(nombre); if (!h || h.getLastRow() < 2) return []; const v = h.getRange(1, 1, h.getLastRow(), h.getLastColumn()).getValues(); const cab = v[0].map(String); return v.slice(1).map(row => { const o = {}; cab.forEach((k, i) => { let x = row[i]; if (x instanceof Date) x = Utilities.formatDate(x, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss"); o[k] = x; }); return o; }); };
  const regs = leer('registros').filter(o => String(o.estancia) === est && String(o.fecha_evento) >= desde && String(o.fecha_evento) <= hasta);
  const ids = {}; regs.forEach(o => ids[o.id] = true);
  const porId = (filas) => { const m = {}; filas.forEach(f => { if (ids[f.registro_id]) (m[f.registro_id] = m[f.registro_id] || []).push(f); }); return m; };
  const camiones = porId(leer('camiones')), cotas = porId(leer('cotas')), faltantes = porId(leer('faltantes')), fotos = porId(leer('fotos'));
  const out = regs.map(o => { o.camiones = camiones[o.id] || []; o.cotas = cotas[o.id] || []; o.faltantes_filas = faltantes[o.id] || []; o.fotos = fotos[o.id] || []; return o; });
  out.sort((a, b) => (String(a.fecha_evento) + String(a.creado_en)).localeCompare(String(b.fecha_evento) + String(b.creado_en)));
  return json_({ ok: true, estancia: est, desde: desde, hasta: hasta, cantidad: out.length, registros: out, planilla: ss.getUrl(), generado_en: new Date().toISOString() });
}
// Último peso de báscula de cada IDE (hoja 'ids_individuales') dentro de los 'dias' anteriores a 'fecha' (por defecto 60).
// El app lo usa en el paso de inconformidades para completar animales del bastón que no pasaron por la báscula.
function pesos_(body) {
  const ides = (body.ides || []).map(x => String(x).replace(/\s+/g, '')).filter(Boolean).slice(0, 5000);
  if (!ides.length) return json_({ ok: false, error: 'sin identificaciones' });
  const hasta = String(body.fecha || '').slice(0, 10) || Utilities.formatDate(new Date(), 'America/Asuncion', 'yyyy-MM-dd');
  const dias = Math.min(Math.max(Number(body.dias) || 60, 1), 365);
  const d1 = new Date(hasta + 'T12:00:00'); const desde = Utilities.formatDate(new Date(d1.getTime() - dias * 86400000), 'America/Asuncion', 'yyyy-MM-dd');
  const excluir = String(body.excluir || '');
  const out = {}; const ss = planilla_(); const h = ss.getSheetByName('ids_individuales');
  if (!h || h.getLastRow() < 2) return json_({ ok: true, pesos: out, desde: desde, hasta: hasta, encontrados: 0, buscados: ides.length });
  const v = h.getRange(1, 1, h.getLastRow(), h.getLastColumn()).getValues(); const cab = v[0].map(String); const ix = {}; cab.forEach((k, i) => ix[k] = i);
  const g = (row, k) => { const i = ix[k]; return i === undefined ? '' : row[i]; };
  const fechaTxt = x => (x instanceof Date) ? Utilities.formatDate(x, 'America/Asuncion', 'yyyy-MM-dd') : String(x || '').slice(0, 10);
  const set = {}; ides.forEach(i => set[i] = true);
  for (let i = 1; i < v.length; i++) {
    const row = v[i]; const ide = String(g(row, 'ide') || '').replace(/\s+/g, ''); if (!set[ide]) continue;
    const p = g(row, 'peso_kg'); if (p === '' || p == null || isNaN(Number(p)) || Number(p) <= 0) continue;
    if (String(g(row, 'fuente') || '') === 'acta') continue; const pf = String(g(row, 'peso_fuente') || ''); if (pf && pf !== 'bascula') continue; // solo pesos reales de báscula
    if (excluir && String(g(row, 'registro_id')) === excluir) continue;
    const f = fechaTxt(g(row, 'fecha_evento')); if (f < desde || f > hasta) continue;
    const clave = f + ' ' + String(g(row, 'hora') || ''); const prev = out[ide];
    if (!prev || clave > prev._k) out[ide] = { peso_kg: Number(p), fecha: f, tipo_evento: String(g(row, 'tipo_evento') || ''), registro_id: String(g(row, 'registro_id') || ''), estancia: String(g(row, 'estancia') || ''), _k: clave };
  }
  Object.keys(out).forEach(k => delete out[k]._k);
  return json_({ ok: true, pesos: out, desde: desde, hasta: hasta, dias: dias, encontrados: Object.keys(out).length, buscados: ides.length });
}
// Reconstruye la hoja 'animales' (una fila por IDE) a partir de 'ids_individuales'. Se puede ejecutar a mano desde el editor: reconstruirAnimales.
function reconstruirAnimales() { reconstruirAnimales_(planilla_()); }
function reconstruirAnimales_(ss) {
  const h = ss.getSheetByName('ids_individuales'); const hA = hoja_(ss, 'animales', CABECERA_ANIMALES);
  if (!h || h.getLastRow() < 2) return;
  const v = h.getRange(1, 1, h.getLastRow(), h.getLastColumn()).getValues(); const cab = v[0].map(String); const ix = {}; cab.forEach((k, i) => ix[k] = i);
  const g = (row, k) => { const i = ix[k]; return i === undefined ? '' : row[i]; };
  const fechaTxt = x => (x instanceof Date) ? Utilities.formatDate(x, 'America/Asuncion', 'yyyy-MM-dd') : String(x || '').slice(0, 10);
  const porIde = {};
  for (let i = 1; i < v.length; i++) { const row = v[i]; const ide = String(g(row, 'ide') || '').trim(); if (!ide) continue; (porIde[ide] = porIde[ide] || []).push(row); }
  const salida = ['salida']; const entrada = ['entrada', 'entrada_rip', 'entrada_confinamiento'];
  const filas = Object.keys(porIde).sort().map(ide => {
    const evs = porIde[ide].slice().sort((a, b) => (fechaTxt(g(a, 'fecha_evento')) + String(g(a, 'hora') || '')).localeCompare(fechaTxt(g(b, 'fecha_evento')) + String(g(b, 'hora') || '')));
    const first = evs[0], last = evs[evs.length - 1];
    const pes = evs.filter(e => g(e, 'peso_kg') !== '' && g(e, 'peso_kg') != null && !isNaN(Number(g(e, 'peso_kg'))) && g(e, 'fuente') !== 'acta' && ['', 'bascula'].includes(String(g(e, 'peso_fuente') || ''))); // para la GMD valen solo pesos reales de báscula (no históricos, a mano ni promedios)
    const p0 = pes[0], p1 = pes[pes.length - 1];
    const d0 = p0 ? new Date(fechaTxt(g(p0, 'fecha_evento'))) : null, d1 = p1 ? new Date(fechaTxt(g(p1, 'fecha_evento'))) : null;
    const dias = (d0 && d1) ? Math.round((d1 - d0) / 86400000) : '';
    const gan = (p0 && p1 && p0 !== p1) ? +(Number(g(p1, 'peso_kg')) - Number(g(p0, 'peso_kg'))).toFixed(1) : '';
    const muerte = evs.find(e => g(e, 'tipo_evento') === 'mortalidad'); const sal = evs.filter(e => salida.includes(g(e, 'tipo_evento'))); const ultSal = sal[sal.length - 1];
    const ent = evs.find(e => entrada.includes(g(e, 'tipo_evento')));
    let estado = 'activo'; if (muerte) estado = 'muerto'; else if (ultSal && fechaTxt(g(ultSal, 'fecha_evento')) >= fechaTxt(g(last, 'fecha_evento')) && !entrada.includes(g(last, 'tipo_evento'))) estado = 'salido';
    const prov = evs.map(e => g(e, 'proveedor')).find(Boolean) || '';
    const pick = k => evs.map(e => g(e, k)).find(Boolean) || '';
    return [ide, estado, estado === 'activo' ? g(last, 'estancia') : '', estado === 'activo' ? g(last, 'lote_controlpasto') : '', estado === 'activo' ? g(last, 'piquete') : '',
      fechaTxt(g(first, 'fecha_evento')), g(first, 'tipo_evento'), g(first, 'estancia'), fechaTxt(g(last, 'fecha_evento')), g(last, 'tipo_evento'), g(last, 'estancia'), evs.length, pes.length,
      p0 ? Number(g(p0, 'peso_kg')) : '', p0 ? fechaTxt(g(p0, 'fecha_evento')) : '', p1 ? Number(g(p1, 'peso_kg')) : '', p1 ? fechaTxt(g(p1, 'fecha_evento')) : '', gan, dias, (gan !== '' && dias > 0) ? +(gan / dias).toFixed(3) : '',
      ent && g(ent, 'peso_kg') !== '' ? Number(g(ent, 'peso_kg')) : '', ent ? fechaTxt(g(ent, 'fecha_evento')) : '', ent ? g(ent, 'nro_guia') : '', ent ? g(ent, 'cota_nro') : '', prov, ent ? g(ent, 'propietario_origen') : pick('propietario_origen'), ent ? g(ent, 'establecimiento_origen') : pick('establecimiento_origen'), pick('raza'), pick('sexo'), pick('categoria'), pick('nacimiento'),
      ultSal ? fechaTxt(g(ultSal, 'fecha_evento')) : '', ultSal ? (g(ultSal, 'establecimiento_destino') || g(ultSal, 'destino')) : '', ultSal ? g(ultSal, 'nro_guia') : '', ultSal && g(ultSal, 'peso_kg') !== '' ? Number(g(ultSal, 'peso_kg')) : '', muerte ? fechaTxt(g(muerte, 'fecha_evento')) : '', muerte ? g(muerte, 'causa') : '',
      [...new Set(evs.map(e => g(e, 'registro_id')))].join(' '), new Date()];
  });
  const cabA = cabecera_(hA, CABECERA_ANIMALES);
  if (hA.getLastRow() > 1) hA.getRange(2, 1, hA.getLastRow() - 1, Math.max(hA.getLastColumn(), cabA.length)).clearContent();
  if (filas.length) hA.getRange(2, 1, filas.length, filas[0].length).setValues(filas);
}
function hora_(iso) { try { const dt = new Date(iso); return Utilities.formatDate(dt, 'America/Asuncion', 'HH:mm'); } catch (e) { return ''; } }
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
function etiqueta_(t) { return { entrada: 'Entrada pasto', salida: 'Salida de animales', mortalidad: 'Mortalidad', nacimiento: 'Nacimiento', pesaje: 'Pesaje de auditoría', pesaje_simple: 'Pesaje simple', medicamento: 'Aplicación de medicamento', solicitud_transferencia: 'Solicitud de transferencia de ganado', perdida_boton: 'Pérdida de botón electrónico', entrada_rip: 'Entrada RIP', entrada_confinamiento: 'Entrada confinamiento' }[t] || t; }
function fecha_(iso) { return iso ? iso.split('-').reverse().join('/') : ''; }
function resumen_(r) {
  const d = r.datos || {}; let s = etiqueta_(r.tipo_evento) + ' · ' + r.estancia + ' · ' + fecha_(r.fecha_evento) + '\nRegistra: ' + r.respondente + (r.lote_controlpasto ? ' · Lote ' + r.lote_controlpasto : '') + (r.piquete ? ' · Piquete ' + r.piquete : '') + '\n';
  if (ES_INTENSIVO_[r.tipo_evento]) s += 'Origen: ' + (d.origen || '—') + '\nDestino: ' + (d.destino || '—') + '\n';
  if (d.chapa_camion) s += ((d.cantidad_camiones || 1) > 1 ? 'Chapas ' : 'Chapa ') + d.chapa_camion + ((d.cantidad_cotas || 1) > 1 ? ' · COTAs ' : ' · COTA ') + (d.cota_nro || d.cota_qr || '—') + (d.raza ? ' · Raza: ' + d.raza : '') + (!ES_INTENSIVO_[r.tipo_evento] && d.origen ? ' · Origen: ' + d.origen : '') + (!ES_INTENSIVO_[r.tipo_evento] && d.destino ? ' · Destino: ' + d.destino : '') + '\n';
  if (d.animales) s += (d.cantidad_animales != null ? d.cantidad_animales + ' animales contados · ' : '') + (d.ids_individuales || []).length + ' en archivo balanza' + (d.peso_promedio_kg != null ? ' · ' + d.peso_promedio_kg + ' kg prom.' : '') + (d.conciliacion ? ' · bastón/báscula ' + d.conciliacion.porcentaje + '%' : '') + '\n';
  if (d.faltantes && d.faltantes.cantidad) s += 'ACTA: ' + d.faltantes.cantidad + ' animal(es) no arreado(s) · ' + d.faltantes.motivo + ' · capataz ' + d.faltantes.capataz + ' · auditor ' + d.faltantes.auditor + '\n';
  if (r.tipo_evento === 'mortalidad') s += 'Botón ' + d.nro_boton + (d.causa_probable ? ' · ' + d.causa_probable : '') + (d.ubicacion ? '\nUbicación: https://maps.google.com/?q=' + d.ubicacion.lat + ',' + d.ubicacion.lon : '') + '\n';
  if (r.tipo_evento === 'nacimiento') s += 'Madre: ' + d.madre + (d.sexo_cria ? ' · ' + d.sexo_cria : '') + '\n';
  if (r.tipo_evento === 'perdida_boton') s += 'Botón perdido: ' + d.nro_boton + '\n';
  if (r.tipo_evento === 'solicitud_transferencia') s += (d.categoria || '') + ' · ' + (d.origen_nombre || '') + ' → ' + (d.destino_nombre || '') + ' · ' + d.cantidad_guias + ' guías · ' + d.total_animales + ' animales\n';
  if (r.tipo_evento === 'medicamento') s += (d.aplicaciones || []).length + ' aplicaciones (' + (d.modo || '') + ') · ' + (d.medicamentos || []).join(', ') + '\n';
  if (r.observaciones) s += 'Obs.: ' + r.observaciones + '\n';
  return s + 'ID ' + r.id + (r.version > 1 ? ' · versión ' + r.version : '');
}
