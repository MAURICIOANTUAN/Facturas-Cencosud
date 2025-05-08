
const contrapartesLocales = [
  "CENCOSUD RETAIL S.A",
  "EASY RETAIL S.A",
  "CENCOSUD FIDELIDAD S.A",
  "CENCOSUD SHOPPING S.A",
  "ADMINISTRADORA Y PROCESOS S.A",
  "CAT ADMINISTRADORA DE TARJETAS S.A",
  "CAT CORREDORES DE SEGUROS S.A",
  "SERVICIOS INTEGRALES S.A"
];

const contrapartesCrossborder = [
  "CENCOSUD COLOMBIA S.A",
  "CENCOSUD SHANGAI",
  "CENCOSUD S.A (Argentina)",
  "Aldany S.A (Uruguay)",
  "CENCOSUD PERU S.A",
  "CENCOSUD URUGUAY SERVICIOS S.A",
  "CENCOSUD BRASIL COMERCIAL S.A",
  "CENCOSUD RETAIL PERU S.A",
  "CENCOTECH SA"
];

// Suponemos que datosExcel ya está cargado al momento de poblar
function poblarContrapartes(data) {
  const select = document.getElementById("contraparte");
  if (!select) return;

  const tipoSeleccionado = document.getElementById("tipo-transaccion").value.trim().toLowerCase();

  select.innerHTML = '<option value="">-- Selecciona --</option>';

  const claves = Object.keys(data[0]);
  const claveContraparte = claves.find(k => k.trim().toLowerCase().includes("contraparte"));
  if (!claveContraparte) return;

  const todas = [...new Set(data.map(f => f[claveContraparte]).filter(c => c && c.trim() !== ""))];

  let contrapartesFiltradas;

  if (tipoSeleccionado === "local (chile)") {
    contrapartesFiltradas = todas.filter(c => contrapartesLocales.includes(c));
  } else if (tipoSeleccionado === "crossborder") {
    contrapartesFiltradas = todas.filter(c => contrapartesCrossborder.includes(c));
  } else {
    contrapartesFiltradas = todas;
  }

  contrapartesFiltradas.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

// Evento para actualizar contrapartes cuando cambia tipo de transacción
document.getElementById("tipo-transaccion").addEventListener("change", () => {
  poblarContrapartes(datosExcel);
});
