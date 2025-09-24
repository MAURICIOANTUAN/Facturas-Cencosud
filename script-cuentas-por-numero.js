// script-cuentas-por-numero.js
// Especializado para páginas que filtran SOLO por número de cuenta.
// Requiere PapaParse y SheetJS (XLSX) ya cargados en el HTML.

let DATASET = [];
let resultadosFiltrados = [];

export async function iniciarCuentasPorNumero(config) {
  const { csvUrl, map, tablaId, inputId, mensajeId } = config;
  try {
    const csv = await fetch(csvUrl, { cache: 'no-store' }).then(r => r.text());
    const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
    DATASET = (parsed.data || [])
      .map(row => mapRow(row, map))
      .filter(r => Object.keys(r).length > 0);

    resultadosFiltrados = DATASET.slice();
    renderTabla(tablaId, resultadosFiltrados);
    if (mensajeId) setMensaje(mensajeId, `Base cargada: ${DATASET.length} filas`, false);
    // Eventos enter en el input
    const $i = document.getElementById(inputId);
    if ($i) $i.addEventListener('keydown', (e) => { if (e.key === 'Enter') filtrarPorNumeroCuenta(config); });
  } catch (e) {
    console.error("Error al cargar CSV:", e);
    if (mensajeId) setMensaje(mensajeId, "❌ No se pudo cargar la base de datos.", true);
  }
}

export function filtrarPorNumeroCuenta(config) {
  const { inputId, tablaId, mensajeId } = config;
  const raw = document.getElementById(inputId)?.value ?? "";
  const clave = normalizeCuenta(raw);
  if (!clave) {
    resultadosFiltrados = DATASET.slice();
  } else {
    resultadosFiltrados = DATASET.filter(r => normalizeCuenta(r.numero_cuenta) === clave);
  }
  renderTabla(tablaId, resultadosFiltrados);
  if (mensajeId) {
    if (!resultadosFiltrados.length) setMensaje(mensajeId, "Sin resultados para ese número de cuenta.", true);
    else setMensaje(mensajeId, `Resultados: ${resultadosFiltrados.length}`, false);
  }
}

export function limpiarFiltro(config) {
  const { inputId, tablaId, mensajeId } = config;
  const $i = document.getElementById(inputId);
  if ($i) $i.value = "";
  resultadosFiltrados = DATASET.slice();
  renderTabla(tablaId, resultadosFiltrados);
  if (mensajeId) setMensaje(mensajeId, "");
}

export function descargarExcel(nombre = "cuentas-filtradas.xlsx") {
  const ws = XLSX.utils.json_to_sheet(resultadosFiltrados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Resultados");
  XLSX.writeFile(wb, nombre);
}

// ---------- helpers ----------
function mapRow(row, mapping) {
  const o = {};
  // mapea solo las columnas declaradas en "mapping"
  for (const [colCsv, canon] of Object.entries(mapping)) {
    if (row.hasOwnProperty(colCsv)) {
      o[canon] = row[colCsv];
    }
  }
  // normaliza número de cuenta
  if ("numero_cuenta" in o) {
    o.numero_cuenta = normalizeCuenta(o.numero_cuenta);
  }
  return o;
}

function renderTabla(tablaId, data) {
  const $t = document.getElementById(tablaId);
  if (!$t) return;

  if (!data || !data.length) {
    $t.innerHTML = "<thead><tr><th>—</th></tr></thead><tbody><tr><td style='text-align:center; font-weight:600; padding:12px;'>No hay resultados</td></tr></tbody>";
    return;
  }

  // columnas: todas las claves que aparezcan en el dataset (orden estable)
  const columnas = [...new Set(data.flatMap(f => Object.keys(f)))];

  let html = "<thead><tr>";
  columnas.forEach(c => { html += `<th>${escapeHtml(tituloBonito(c))}</th>`; });
  html += "</tr></thead><tbody>";

  for (const fila of data) {
    html += "<tr>";
    for (const c of columnas) {
      let v = fila[c];
      if (v == null) v = "";
      if (typeof v === "number") v = v.toLocaleString("es-CL");
      html += `<td>${escapeHtml(String(v))}</td>`;
    }
    html += "</tr>";
  }
  html += "</tbody>";
  $t.innerHTML = html;
}

function tituloBonito(k) {
  // opcional: mejora headers canónicos
  const map = {
    numero_cuenta: "N° Cuenta",
    descripcion: "Descripción",
    monto: "Monto CLP",
    es_marca_propia: "Es Marca Propia",
    linea_marca: "Línea Marca",
    categoria_marca: "Categoría",
    nps: "NPS",
    satisfaccion: "Satisfacción",
    reclamos: "Reclamos"
  };
  return map[k] || k;
}

function normalizeCuenta(x) {
  if (x == null) return "";
  // Estandariza a "solo dígitos", sin ceros a la izquierda para evitar desalineos.
  const digits = String(x).replace(/\D+/g, "");
  return digits.replace(/^0+/, ""); // quita ceros iniciales
}

function setMensaje(id, texto, esError = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = texto || "";
  el.style.color = esError ? "#c62828" : "#2e7d32";
  if (texto) {
    el.style.visibility = "visible";
  } else {
    el.style.visibility = "hidden";
  }
}

function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[s]));
}
