
const CLAVE_MAESTRA = "cencosud123";
let datosExcel = [];
let resultadosFiltrados = [];
let baseSeleccionada = "";

const URLS = {
  matriz: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTfBtHKkKtdElROUoH5dVkHvQpBIo4djRsOCogOCZyqJZMNJ0vYqfc2gQW1hdU-VQx8C4X0CHRIO_6c/pub?gid=0&single=true&output=csv",
  uruguay: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTfBtHKkKtdElROUoH5dVkHvQpBIo4djRsOCogOCZyqJZMNJ0vYqfc2gQW1hdU-VQx8C4X0CHRIO_6c/pub?gid=428418421&single=true&output=csv"
};

function verificarClave() {
  const input = document.getElementById("clave").value.trim();
  const mensaje = document.getElementById("mensaje-login");

  if (input === CLAVE_MAESTRA) {
    sessionStorage.setItem("logueado", true);
    window.location.href = "inicio.html";
  } else {
    mensaje.textContent = "⚠️ Clave incorrecta. Inténtalo de nuevo.";
  }
}

function iniciarApp(base) {
  baseSeleccionada = base;
  const contenido = document.getElementById("contenido-app");
  if (contenido) contenido.style.display = "block";
  const titulo = document.getElementById("titulo-app");
  if (titulo) {
    titulo.textContent = `Gestión de Facturas: ${base === "matriz" ? "CENCOSUD MATRIZ" : "CENCOSUD URUGUAY SERVICIOS"}`;
  }
  cargarDatos();
}

function cargarDatos() {
  const url = URLS[baseSeleccionada];
  if (!url) return;

  fetch(url)
    .then(res => res.text())
    .then(csv => {
      const parsed = Papa.parse(csv, { header: true });
      datosExcel = parsed.data.filter(row => Object.values(row).some(cell => cell !== ""));
      mostrarTabla(datosExcel);
      poblarContrapartes(datosExcel);
    })
    .catch(err => {
      console.error("❌ Error al cargar datos:", err);
      document.getElementById("mensaje").textContent = "No se pudo cargar la base de datos.";
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

function volverInicio() {
  window.location.href = "facturas.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const base = params.get("base");

  if (sessionStorage.getItem("logueado")) {
    const loginBox = document.getElementById("login");
    if (loginBox) loginBox.style.display = "none";

    if (base) {
      iniciarApp(base);
    }
  }
});
