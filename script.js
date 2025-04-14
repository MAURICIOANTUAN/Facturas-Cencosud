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

      if (enc.toLowerCase().includes("fecha")) {
        const fecha = new Date(valor);
        valor = isNaN(fecha) ? valor : fecha.toLocaleDateString("es-CL");
      }

      if (enc.toLowerCase().includes("monto")) {
        const numero = parseInt(valor.toString().replace(/[^0-9]/g, ""));
        valor = isNaN(numero) ? valor : `$${numero.toLocaleString("es-CL")}`;
      }

      if (typeof valor === "string" && valor.startsWith("http")) {
        valor = `<a href="${valor}" target="_blank">📎 Ver enlace</a>`;
      }

      html += `<td>${valor}</td>`;
    });
    html += "</tr>";
  });

  html += "</tbody>";
  document.getElementById("tabla-facturas").innerHTML = html;
}

function normalizar(texto) {
  return String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

function buscarColumna(fila, nombreEsperado) {
  const clave = Object.keys(fila).find(k => normalizar(k) === normalizar(nombreEsperado));
  return normalizar(fila[clave]);
}

function filtrar() {
  const tipo = normalizar(document.getElementById("tipo-transaccion").value);
  const contraparte = normalizar(document.getElementById("contraparte").value);
  const ejercicio = document.getElementById("filtro-anio").value.trim();
  const operacion = normalizar(document.getElementById("operacion").value);
  const folio = document.getElementById("folio").value.trim();
  const mensaje = document.getElementById("mensaje");

  const filtrados = datosExcel.filter(fila => {
    const tipoValor = buscarColumna(fila, "Tipo de transaccion (Cross-Border o Local)");
    const contraparteValor = buscarColumna(fila, "Contraparte");
    const ejercicioValor = buscarColumna(fila, "Ejercicio");
    const operacionValor = buscarColumna(fila, "Operación");
    const folioValor = buscarColumna(fila, "Folio");

    return (
      (!tipo || tipoValor === tipo) &&
      (!contraparte || contraparteValor === contraparte) &&
      (!ejercicio || ejercicioValor === ejercicio) &&
      (!operacion || operacionValor === operacion) &&
      (!folio || folioValor === folio)
    );
  });

  resultadosFiltrados = filtrados;

  if (filtrados.length > 0) {
    mostrarTabla(filtrados);
    mensaje.textContent = "✅ Búsqueda realizada con éxito.";
  } else {
    document.getElementById("tabla-facturas").innerHTML = "";
    mensaje.textContent = "⚠️ No se encontraron resultados con esos filtros.";
  }
}

function limpiarFiltro() {
  mostrarTabla(datosExcel);
  document.getElementById("tipo-transaccion").value = "";
  document.getElementById("contraparte").value = "";
  document.getElementById("filtro-anio").value = "";
  document.getElementById("operacion").value = "";
  document.getElementById("folio").value = "";
  document.getElementById("mensaje").textContent = "🔄 Base de datos restablecida.";
}

function descargarExcel() {
  if (resultadosFiltrados.length === 0) {
    alert("No hay resultados para exportar.");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(resultadosFiltrados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Filtrados");
  XLSX.writeFile(wb, "Resultados_Filtrados.xlsx");
}



