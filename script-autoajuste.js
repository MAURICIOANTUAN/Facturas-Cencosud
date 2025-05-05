
let datosOriginales = [];

document.addEventListener('DOMContentLoaded', () => {
  Papa.parse('https://docs.google.com/spreadsheets/d/e/2PACX-1vS-urAZjllNC2T_Y5QK8SGwXHZ5KZwc1yxCOirfGqyaC0Tmyag92lKziYHHXoifB6Tibx6IfHC6QRVP/pub?gid=0&single=true&output=csv', {
    download: true,
    header: true,
    complete: function(results) {
      datosOriginales = results.data;
      cargarFiltrosFijos();
      mostrarTabla(datosOriginales);
    }
  });
});

function cargarFiltrosFijos() {
  const contrapartes = [
    "CENCOSUD RETAIL S.A",
    "EASY RETAIL S.A",
    "CENCOSUD RETAIL PERU S.A",
    "CENCOSUD COLOMBIA S.A",
    "CENCOSUD S.A (ARGENTINA)"
  ];

  const ejercicios = ["2022", "2023", "2024", "2025"];

  const conceptos = [
    "Know How/Marcas propias",
    "Experiencia clientes"
  ];

  llenarSelect('contraparte', contrapartes);
  llenarSelect('ejercicio', ejercicios);
  llenarSelect('concepto', conceptos);
}

function llenarSelect(id, valores) {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">-- Selecciona --</option>';
  valores.forEach(v => {
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
    tabla.innerHTML = '<tr><td>No hay resultados para mostrar.</td></tr>';
    return;
  }

  const encabezado = Object.keys(data[0]);
  const thead = '<thead><tr>' + encabezado.map(col => `<th>${col}</th>`).join('') + '</tr></thead>';
  let tbody = '<tbody>';

  data.forEach(row => {
    tbody += '<tr>';
    encabezado.forEach((col, idx) => {
      const celda = row[col] || '';
      if ([4,5,6].includes(idx) && celda.includes('http')) {
        tbody += `<td><a href="${celda}" target="_blank">Ver documento</a></td>`;
      } else {
        tbody += `<td>${celda}</td>`;
      }
    });
    tbody += '</tr>';
  });

  tbody += '</tbody>';
  tabla.innerHTML = thead + tbody;
}

function descargarExcel() {
  const tabla = document.getElementById('tabla-datos');
  const wb = XLSX.utils.table_to_book(tabla, {sheet: "Resultados"});
  XLSX.writeFile(wb, "contratos_estudios_autoajuste.xlsx");
}

function cerrarSesion() {
  window.location.href = "index.html";
}
