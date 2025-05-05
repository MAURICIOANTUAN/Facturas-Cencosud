let datosOriginales = [];

document.addEventListener("DOMContentLoaded", iniciarApp);

function iniciarApp() {
  Papa.parse('https://docs.google.com/spreadsheets/d/e/2PACX-1vS-urAZjllNC2T_Y5QK8SGwXHZ5KZwc1yxCOirfGqyaC0Tmyag92lKziYHHXoifB6Tibx6IfHC6QRVP/pub?gid=0&single=true&output=csv', {
    download: true,
    header: true,
    complete: function (results) {
      datosOriginales = results.data;
      cargarFiltros();
      mostrarTabla(datosOriginales);
    }
  });

  document.getElementById('btn-filtrar').addEventListener('click', filtrar);
  document.getElementById('btn-restablecer').addEventListener('click', restablecer);
  document.getElementById('btn-descargar').addEventListener('click', descargarExcel);
}

function cargarFiltros() {
  const contraparteSet = new Set();
  const ejercicioSet = new Set();
  const conceptoSet = new Set();

  datosOriginales.forEach(row => {
    if (row['Contraparte']) contraparteSet.add(row['Contraparte']);
    if (row['Ejercicio']) ejercicioSet.add(row['Ejercicio']);
    if (row['Concepto']) conceptoSet.add(row['Concepto']);
  });

  llenarSelect('contraparte', contraparteSet);
  llenarSelect('ejercicio', ejercicioSet);
  llenarSelect('concepto', conceptoSet);
}

function llenarSelect(id, valores) {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">-- Selecciona --</option>';
  Array.from(valores).sort().forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

function filtrar() {
  const contraparte = document.getElementById('contraparte').value;
  const ejercicio = document.getElementById('ejercicio').value;
  const concepto = document.getElementById('concepto').value;

  const filtrados = datosOriginales.filter(row => {
    return (!contraparte || row['Contraparte'] === contraparte) &&
           (!ejercicio || row['Ejercicio'] === ejercicio) &&
           (!concepto || row['Concepto'] === concepto);
  });

  mostrarTabla(filtrados);
}

function restablecer() {
  document.getElementById('contraparte').value = '';
  document.getElementById('ejercicio').value = '';
  document.getElementById('concepto').value = '';
  mostrarTabla(datosOriginales);
}

function mostrarTabla(data) {
  const tabla = document.getElementById('tabla-datos');
  tabla.innerHTML = '';

  if (data.length === 0) {
    tabla.innerHTML = '<tr><td colspan="7">No hay resultados para mostrar.</td></tr>';
    return;
  }

  const encabezado = Object.keys(data[0]);
  const thead = '<thead><tr>' + encabezado.map(col => `<th>${col}</th>`).join('') + '</tr></thead>';
  let tbody = '<tbody>';

  data.forEach(row => {
    tbody += '<tr>';
    encabezado.forEach(col => {
      const celda = row[col] || '';
      const isLink = typeof celda === 'string' && celda.startsWith('http');
      tbody += `<td>${isLink ? `<a href="${celda}" target="_blank">Ver documento</a>` : celda}</td>`;
    });
    tbody += '</tr>';
  });

  tbody += '</tbody>';
  tabla.innerHTML = thead + tbody;
}

function descargarExcel() {
  const tabla = document.getElementById('tabla-datos');
  const wb = XLSX.utils.table_to_book(tabla, { sheet: "Resultados" });
  XLSX.writeFile(wb, "contratos_estudios_autoajuste.xlsx");
}

function cerrarSesion() {
  window.location.href = "index.html";
}

