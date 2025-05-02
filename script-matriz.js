
let datosExcel = [];
let resultadosFiltrados = [];

const URL_MATRIZ = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTfBtHKkKtdElROUoH5dVkHvQpBIo4djRsOCogOCZyqJZMNJ0vYqfc2gQW1hdU-VQx8C4X0CHRIO_6c/pub?gid=0&single=true&output=csv";

function iniciarApp() {
  const contenedor = document.getElementById("contenido-app");
  if (contenedor) contenedor.style.display = "block";
  cargarDatos();
}

function cargarDatos() {
  fetch(URL_MATRIZ)
    .then(res => res.text())
    .then(csv => {
      const parsed = Papa.parse(csv, { header: true });
      datosExcel = parsed.data.filter(row => Object.values(row).some(cell => cell !== ""));
      resultadosFiltrados = datosExcel;
      mostrarTabla(resultadosFiltrados);
      poblarContrapartes(resultadosFiltrados);
    })
    .catch(err => {
      console.error("Error al cargar la base:", err);
      document.getElementById("mensaje").textContent = "❌ No se pudo cargar la base de datos.";
    });
}

function mostrarTabla(data) {
  const tabla = document.getElementById("tabla-facturas");
  if (!tabla || !data.length) return;
  const columnas = Object.keys(data[0]);
  let html = "<thead><tr>";
  columnas.forEach(c => html += `<th>${c}</th>`);
  html += "</tr></thead><tbody>";

  data.forEach(fila => {
    html += "<tr>";
    columnas.forEach(col => {
      let valor = fila[col];
      if (col.toLowerCase().includes("fecha")) {
        const fecha = new Date(valor);
        valor = isNaN(fecha) ? valor : fecha.toLocaleDateString("es-CL");
      }
      if (col.toLowerCase().includes("monto")) {
        const num = parseFloat(valor.toString().replace(/[^0-9.,]/g, "").replace(",", ""));
        valor = isNaN(num) ? valor : `$${num.toLocaleString("es-CL")}`;
      }
      if (typeof valor === "string" && valor.endsWith(".pdf")) {
        valor = `<a href="${valor}" target="_blank">📎 Ver PDF</a>`;
      }
      html += `<td>${valor}</td>`;
    });
    html += "</tr>";
  });

  html += "</tbody>";
  tabla.innerHTML = html;
}

function poblarContrapartes(data) {
  const select = document.getElementById("contraparte");
  if (!select) return;
  const contrapartesUnicas = [...new Set(data.map(f => f["Contraparte"]).filter(c => c && c.trim() !== ""))];
  select.innerHTML = '<option value="">-- Selecciona --</option>';
  contrapartesUnicas.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

function filtrar() {
  const tipo = document.getElementById("tipo-transaccion").value.toLowerCase();
  const contraparte = document.getElementById("contraparte").value.toLowerCase();
  const anio = document.getElementById("filtro-anio").value.toLowerCase();
  const operacion = document.getElementById("operacion").value.toLowerCase();
  const folio = document.getElementById("folio").value.toLowerCase();

  resultadosFiltrados = datosExcel.filter(f => {
    const matchTipo = f["Tipo de transacción"]?.toLowerCase().includes(tipo);
    const matchContraparte = f["Contraparte"]?.toLowerCase().includes(contraparte);
    const matchAnio = f["Ejercicio"]?.toLowerCase().includes(anio);
    const matchOperacion = f["Operación"]?.toLowerCase().includes(operacion);
    const matchFolio = f["Folio"]?.toLowerCase().includes(folio);
    return matchTipo && matchContraparte && matchAnio && matchOperacion && matchFolio;
  });

  mostrarTabla(resultadosFiltrados);
}

function limpiarFiltro() {
  document.getElementById("tipo-transaccion").value = "";
  document.getElementById("contraparte").value = "";
  document.getElementById("filtro-anio").value = "";
  document.getElementById("operacion").value = "";
  document.getElementById("folio").value = "";
  mostrarTabla(datosExcel);
}

function descargarExcel() {
  const ws = XLSX.utils.json_to_sheet(resultadosFiltrados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Facturas");
  XLSX.writeFile(wb, "facturas-filtradas.xlsx");
}

function volverInicio() {
  window.location.href = "index.html";
}

function cerrarSesion() {
  sessionStorage.removeItem("logueado");
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", iniciarApp);
