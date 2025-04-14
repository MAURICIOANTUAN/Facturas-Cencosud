const URL_URUGUAY = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTfBtHKkKtdElROUoH5dVkHvQpBIo4djRsOCogOCZyqJZMNJ0vYqfc2gQW1hdU-VQx8C4X0CHRIO_6c/pub?gid=428418421&single=true&output=csv";

let datosUruguay = [];
let resultadosUruguay = [];

document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("logueado")) {
    cargarDatosUruguay();
  } else {
    window.location.href = "index.html";
  }
});

function cargarDatosUruguay() {
  fetch(URL_URUGUAY)
    .then(res => res.text())
    .then(csv => {
      const parsed = Papa.parse(csv, { header: true });
      datosUruguay = parsed.data.filter(row => Object.values(row).some(cell => cell !== ""));
      mostrarTablaUruguay(datosUruguay);
    })
    .catch(err => {
      console.error("❌ Error al cargar datos Uruguay:", err);
      document.getElementById("mensaje").textContent = "No se pudo cargar la base de datos.";
    });
}

function mostrarTablaUruguay(data) {
  const tabla = document.getElementById("tabla-facturas");
  if (!data.length) {
    tabla.innerHTML = "<tr><td colspan='100%'>No hay datos para mostrar.</td></tr>";
    return;
  }

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

function filtrarUruguay() {
  const tipo = document.getElementById("tipo-transaccion").value.trim().toLowerCase();
  const contraparte = document.getElementById("contraparte").value.trim().toLowerCase();
  const operacion = document.getElementById("operacion").value.trim().toLowerCase();
  const ejercicio = document.getElementById("filtro-anio").value.trim();
  const eticket = document.getElementById("folio").value.trim().toLowerCase();

  const filtrados = datosUruguay.filter(row => {
    const matchTipo = !tipo || (row["Tipo"] || "").toLowerCase() === tipo;
    const matchContra = !contraparte || (row["Contraparte"] || "").toLowerCase() === contraparte;
    const matchOperacion = !operacion || (row["Operación"] || "").toLowerCase() === operacion;
    const matchEjercicio = !ejercicio || (row["Ejercicio"] || "").toString() === ejercicio;
    const matchFolio = !eticket || (row["E ticket"] || "").toLowerCase().includes(eticket);

    return matchTipo && matchContra && matchOperacion && matchEjercicio && matchFolio;
  });

  resultadosUruguay = filtrados;
  mostrarTablaUruguay(filtrados);
}

function limpiarFiltroUruguay() {
  document.getElementById("tipo-transaccion").value = "";
  document.getElementById("contraparte").value = "";
  document.getElementById("operacion").value = "";
  document.getElementById("filtro-anio").value = "";
  document.getElementById("folio").value = "";
  mostrarTablaUruguay(datosUruguay);
}

function descargarExcelUruguay() {
  if (resultadosUruguay.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(resultadosUruguay);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Uruguay");
  XLSX.writeFile(wb, "Facturas_Uruguay.xlsx");
}


