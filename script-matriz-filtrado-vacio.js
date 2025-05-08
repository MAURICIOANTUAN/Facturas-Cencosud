
let datosExcel = [];
let resultadosFiltrados = [];

const URL_MATRIZ = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTfBtHKkKtdElROUoH5dVkHvQpBIo4djRsOCogOCZyqJZMNJ0vYqfc2gQW1hdU-VQx8C4X0CHRIO_6c/pub?gid=0&single=true&output=csv";

const contrapartesLocales = [
  "CENCOSUD RETAIL S.A", "EASY RETAIL S.A", "CENCOSUD FIDELIDAD S.A",
  "CENCOSUD SHOPPING S.A", "ADMINISTRADORA Y PROCESOS S.A",
  "CAT ADMINISTRADORA DE TARJETAS S.A", "CAT CORREDORES DE SEGUROS S.A",
  "SERVICIOS INTEGRALES S.A"
];

const contrapartesCross = [
  "CENCOSUD COLOMBIA S.A", "CENCOSUD SHANGAI", "CENCOSUD S.A (Argentina)",
  "Aldany S.A (Uruguay)", "CENCOSUD PERU S.A", "CENCOSUD URUGUAY SERVICIOS S.A",
  "CENCOSUD BRASIL COMERCIAL S.A", "CENCOSUD RETAIL PERU S.A", "CENCOTECH SA"
];

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
  tabla.innerHTML = "";

  if (!data || data.length === 0) {
    tabla.innerHTML = "<tr><td colspan='100%' style='text-align:center; font-weight:bold; padding: 15px;'>No hay resultados que mostrar.</td></tr>";
    return;
  }

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
      if (col.trim() === "Monto (CLP)") {
        const num = parseFloat(valor.toString().replace(/\./g, "").replace(",", "."));
        valor = isNaN(num) ? valor : `CLP ${num.toLocaleString("es-CL")}`;
      } else if (col.trim() === "Monto (USD)") {
        const num = parseFloat(valor.toString().replace(/\./g, "").replace(",", "."));
        valor = isNaN(num) ? valor : `USD ${num.toLocaleString("es-CL")}`;
      }
      if (col.trim() === "Factura") {
        if (valor && valor.startsWith("http")) {
          const contraparte = fila["Contraparte"];
          valor = `<a href="${valor}" target="_blank" style="color:#003087;">Factura emitida por CENCOSUD MATRIZ a ${contraparte}</a>`;
        }
      } else if (col.trim() === "Contrato") {
        if (valor && valor.includes("file")) {
          const contraparte = fila["Contraparte"];
          valor = `<a href="${valor}" target="_blank" style="color:#003087;">Contrato firmado con ${contraparte}</a>`;
        }
      } else if (col.trim() === "Estudio de precios") {
        if (valor && valor.includes("Anexo")) {
          const contraparte = fila["Contraparte"];
          valor = `<a href="${valor}" target="_blank" style="color:#003087;">Estudio de precios para ${contraparte}</a>`;
        }
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
  const tipo = document.getElementById("tipo-transaccion").value;
  if (!select) return;

  const claves = Object.keys(data[0]);
  const claveContraparte = claves.find(k => normalizar(k).includes("contraparte"));
  if (!claveContraparte) return;

  let contras = [];
  if (tipo === "Local (Chile)") {
    contras = contrapartesLocales;
  } else if (tipo === "Crossborder") {
    contras = contrapartesCross;
  } else {
    contras = [...new Set(data.map(f => f[claveContraparte]).filter(c => c && c.trim() !== ""))];
  }

  select.innerHTML = '<option value="">-- Selecciona --</option>';
  contras.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

document.getElementById("tipo-transaccion").addEventListener("change", () => {
  poblarContrapartes(datosExcel);
});

function filtrar() {
  const tipo = normalizar(document.getElementById("tipo-transaccion").value);
  const contraparte = normalizar(document.getElementById("contraparte").value);
  const anio = normalizar(document.getElementById("filtro-anio").value);
  const operacion = normalizar(document.getElementById("operacion").value);
  const folio = normalizar(document.getElementById("folio").value);

  resultadosFiltrados = datosExcel.filter(f => {
    const matchTipo = buscarColumna(f, "tipo de transaccion (Cross-Border o Local)").includes(tipo);
    const matchContraparte = buscarColumna(f, "contraparte").includes(contraparte);
    const matchAnio = buscarColumna(f, "ejercicio").includes(anio);
    const matchOperacion = buscarColumna(f, "operacion").includes(operacion);
    const matchFolio = buscarColumna(f, "folio").includes(folio);
    return matchTipo && matchContraparte && matchAnio && matchOperacion && matchFolio;
  });

  mostrarTabla(resultadosFiltrados);
}

function buscarColumna(fila, nombreEsperado) {
  const clave = Object.keys(fila).find(k => normalizar(k) === normalizar(nombreEsperado));
  return normalizar(fila[clave] || "");
}

function normalizar(texto) {
  return (texto || "")
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
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
