
const CLAVE_MAESTRA = "cencosud123";

function verificarClave() {
  const clave = document.getElementById("clave").value.trim();
  const mensaje = document.getElementById("mensaje-login");

  if (clave === CLAVE_MAESTRA) {
    sessionStorage.setItem("logueado", true);
    mostrarOpciones();
  } else {
    mensaje.textContent = "⚠️ Clave incorrecta. Inténtalo de nuevo.";
  }
}

function mostrarOpciones() {
  const login = document.getElementById("login");
  const inicioOpciones = document.getElementById("inicio-opciones");
  if (login) login.style.display = "none";
  if (inicioOpciones) inicioOpciones.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("logueado")) {
    mostrarOpciones();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && document.getElementById("clave") === document.activeElement) {
    verificarClave();
  }
});
