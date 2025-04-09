const CLAVE_MAESTRA = "cencosud123";

function verificarClave() {
  const input = document.getElementById("clave").value.trim();
  const login = document.getElementById("login");
  const contenido = document.querySelector(".contenedor");
  const mensaje = document.getElementById("mensaje-login");

  if (input === CLAVE_MAESTRA) {
    login.style.display = "none";
    contenido.style.display = "block";
    sessionStorage.setItem("logueado", true);
  } else {
    mensaje.textContent = "⚠️ Clave incorrecta. Inténtalo de nuevo.";
  }
}

let datosExcel = [];
let resultadosFiltrados = [];

window.onload = () => {
  const loginVisible = sessionStorage.getItem("logueado");
  if (!loginVisible) {
    document.querySelector(".contenedor").style.display = "none";
  }

  const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTfBtHKkKtdElROUoH5dVkHvQpBIo4djRsOCogOCZyqJZMNJ0vYqfc2gQW1hdU-VQx8C4X0CHRIO_6c/pub?gid=0&single=true&output=csv";

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
};

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

      html += `<td>${valor}</td>`;
    });
    html += "</tr>";
  });

  html += "</tbody>";
  document.getElementById("tabla-facturas").innerHTML = html;
}

function filtrar() {
  const tipo = document.getElementById("tipo-transaccion").value.trim().toLowerCase();
  const contraparte = document.getElementById("contraparte").value.trim().toLowerCase();
  const ejercicio = document.getElementById("filtro-anio").value.trim();
  const operacion = document.getElementById("operacion").value.trim().toLowerCase();
  const folio = document.getElementById("folio").value.trim();
  const mensaje = document.getElementById("mensaje");

  const filtrados = datosExcel.filter(fila => {
    const tipoValor = (fila["Tipo de transaccion (Cross-Border o Local)"] || "").trim().toLowerCase();
    const contraparteValor = (fila["Contraparte"] || "").trim().toLowerCase();
    const ejercicioValor = (fila["Ejercicio"] || "").trim();
    const operacionValor = (fila["Operación"] || "").trim().toLowerCase();
    const folioValor = (fila["Folio"] || "").trim();

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

