const CLAVE_MAESTRA = "cencosud123";
let datosExcel = [];
let resultadosFiltrados = [];
let baseSeleccionada = "";

const URLS = {
  matriz: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTfBtHKkKtdElROUoH5dVkHvQpBIo4djRsOCogOCZyqJZMNJ0vYqfc2gQW1hdU-VQx8C4X0CHRIO_6c/pub?gid=0&single=true&output=csv",
  uruguay: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_LA-TU-LINK-URUGUAY-EJEMPLO/pub?gid=0&single=true&output=csv"
};

function verificarClave() {
  const input = document.getElementById("clave").value.trim();
  const login = document.getElementById("login");
  const inicio = document.getElementById("inicio-opciones");
  const mensaje = document.getElementById("mensaje-login");

  if (input === CLAVE_MAESTRA) {
    login.style.display = "none";
    inicio.style.display = "block";
    sessionStorage.setItem("logueado", true);
  } else {
    mensaje.textContent = "⚠️ Clave incorrecta. Inténtalo de nuevo.";
  }
}

function iniciarApp(base) {
  baseSeleccionada = base;
  document.getElementById("inicio-opciones").style.display = "none";
  document.getElementById("contenido-app").style.display = "block";

  const titulo = document.getElementById("titulo-app");
  titulo.textContent = `Gestión de Facturas: ${base === "matriz" ? "CENCOSUD MATRIZ" : "CENCOSUD URUGUAY SERVICIOS"}`;

  cargarDatos();
}

function cerrarSesion() {
  sessionStorage.removeItem("logueado");
  location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  const claveInput = document.getElementById("clave");
  claveInput?.addEventListener("keydown", e => {
    if (e.key === "Enter") verificarClave();
  });

  if (sessionStorage.getItem("logueado")) {
    document.getElementById("login").style.display = "none";
    document.getElementById("inicio-opciones").style.display = "block";
  }
});

function cargarDatos() {
  const url = URLS[baseSeleccionada];
  if (!url) return;

  fetch(url)
    .then(res => res.text())
    .then(csv => {
      const parsed = Papa.parse(csv, { header: true });
      datosExcel = parsed.data.filter(row => Object.values(row).some(cell => cell !== ""));
      mostrarTabla(datosExcel);
    })
    .catch(err => {
      console.error("❌ Error al cargar la base:", err);
      document.getElementById("mensaje").textContent = "❌ No se pudo cargar la base de datos.";
    });
}

function mostrarTabla(data) {
  if (!data || data.length === 0) {
    document.getElementById("tabla-facturas").innerHTML = "<tr><td colspan='100%'>No hay datos para mostrar</td></tr>";
    return;
  }

  const encabezados = Object.keys(data[0]);
  let html = "<thead><tr>";
  encabezados.forEach(enc => html += `<th>${enc}</th>`);
  html += "</tr></thead><tbody>";

  data.forEach(fila => {
    html += "<tr>";
    encabezados.forEach(enc => {
      let valor = fila[enc];



