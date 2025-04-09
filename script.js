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

  const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTfBtHKkKtdElROUoH5dVkHvQpBIo4djRsOCogOCZyqJZMNJ0vYqfc2gQW1hdU-VQx8C4X0CHRIO_6c/gviz/tq?tqx=out:json";

  fetch(url)
    .then(res => res.text())
    .then(data => {
      const json = JSON.parse(data.match(/{.*}/s)[0]); // ✅ Cambiado para evitar error de parseo
      console.log("COLUMNAS DETECTADAS:", cols);
      console.log("PRIMERA FILA:", datosExcel[0]);

      const cols = json.table.cols.map(col => col.label);
      datosExcel = json.table.rows.map(row => {
        const obj = {};
        cols.forEach((col, i) => {
          const celda = row.c[i];
          obj[col] = celda ? celda.v : "";
        });
        return obj;
      });
      mostrarTabla(datosExcel);
    })
    .catch(err => {
      console.error("❌ Error al cargar la base:", err);
      document.getElementById("mensaje").textContent = "❌ No se pudo cargar la base de datos.";
    });
};

function limpiarMonto(valor) {
  if (!valor || typeof valor !== "string") return 0;
  const limpio = valor.replace(/[^0-9\-]/g, "");
  return parseInt(limpio) || 0;
}

function mostrarTabla(data) {
  if (data.length === 0) return;

  const encabezado = Object.keys(data[0]);
  let html = "<tr>";
  encabezado.forEach(col => html += `<th>${col}</th>`);
  html += "</tr>";

  for (const fila of data) {
    html += "<tr>";
    encabezado.forEach(col => {
      let valor = fila[col];

      if (col.toLowerCase().includes("fecha")) {
        if (!isNaN(valor)) {
          const fechaBase = new Date(1899, 11, 30);
          const fecha = new Date(fechaBase.getTime() + valor * 86400000);
          valor = fecha.toLocaleDateString("es-CL");
        } else if (typeof valor === "string" && valor.toLowerCase().includes("no especifica")) {
          valor = "No especificada";
        }
      }

      if (col.toLowerCase().includes("monto")) {
        const monto = limpiarMonto(valor.toString());
        valor = `$${monto.toLocaleString("es-CL")}`;
      }

      html += `<td>${valor}</td>`;
    });
    html += "</tr>";
  }

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
    const tipoValor = String(fila["Tipo de transaccion (Cross-Border o Local)"] || "").trim().toLowerCase();
    const contraparteValor = String(fila["Contraparte"] || "").trim().toLowerCase();
    const ejercicioValor = String(fila["Ejercicio"] || "").trim();
    const operacionValor = String(fila["Operación"] || "").trim().toLowerCase();
    const folioValor = String(fila["Folio"] || "").trim();

    return (
      (tipo ? tipoValor === tipo : true) &&
      (contraparte ? contraparteValor === contraparte : true) &&
      (ejercicio ? ejercicioValor === ejercicio : true) &&
      (operacion ? operacionValor === operacion : true) &&
      (folio ? folioValor === folio : true)
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
