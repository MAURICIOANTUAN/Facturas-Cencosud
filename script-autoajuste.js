const urlCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-urAZjllNC2T_Y5QK8SGwXHZ5KZwc1yxCOirfGqyaC0Tmyag92lKziYHHXoifB6Tibx6IfHC6QRVP/pub?gid=0&single=true&output=csv";

let datos = [];

fetch(urlCSV)
  .then(response => response.text())
  .then(csv => {
    const rows = csv.split("\n").slice(1);
    datos = rows.map(row => row.split(","));
    cargarFiltros();
    mostrarTabla(datos);
  });

function cargarFiltros() {
  const contraparteSet = new Set();
  const ejercicioSet = new Set();
  datos.forEach(fila => {
    contraparteSet.add(fila[1]);
    ejercicioSet.add(fila[3]);
  });

  const filtroContraparte = document.getElementById("filtro-contraparte");
  const filtroEjercicio = document.getElementById("filtro-ejercicio");

  contraparteSet.forEach(item => {
    if (item) filtroContraparte.innerHTML += `<option value="${item}">${item}</option>`;
  });
  ejercicioSet.forEach(item => {
    if (item) filtroEjercicio.innerHTML += `<option value="${item}">${item}</option>`;
  });
}

function filtrarDatos() {
  const contraparte = document.getElementById("filtro-contraparte").value;
  const ejercicio = document.getElementById("filtro-ejercicio").value;

  const filtrados = datos.filter(fila => {
    const cumpleContraparte = !contraparte || fila[1] === contraparte;
    const cumpleEjercicio = !ejercicio || fila[3] === ejercicio;
    return cumpleContraparte && cumpleEjercicio;
  });

  mostrarTabla(filtrados);
}

function restablecerFiltros() {
  document.getElementById("filtro-contraparte").value = "";
  document.getElementById("filtro-ejercicio").value = "";
  mostrarTabla(datos);
}

function mostrarTabla(filas) {
  const cuerpo = document.querySelector("#tabla-datos tbody");
  cuerpo.innerHTML = "";
  filas.forEach(fila => {
    const tr = document.createElement("tr");
    for (let i = 0; i < fila.length; i++) {
      const td = document.createElement("td");
      if (fila[i].includes("http")) {
        td.innerHTML = `<a href="${fila[i]}" target="_blank">${fila[i].split("/").pop()}</a>`;
      } else {
        td.textContent = fila[i];
      }
      tr.appendChild(td);
    }
    cuerpo.appendChild(tr);
  });
}
