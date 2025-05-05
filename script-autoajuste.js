document.addEventListener('DOMContentLoaded', () => {
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vS-urAZjllNC2T_Y5QK8SGwXHZ5KZwc1yxCOirfGqyaC0Tmyag92lKziYHHXoifB6Tibx6IfHC6QRVP/pub?gid=0&single=true&output=csv')
        .then(res => res.text())
        .then(data => procesarCSV(data));
});

function procesarCSV(data) {
    const rows = data.split('\n').slice(1).filter(r => r.trim() !== '');
    const tabla = document.querySelector('#tabla-datos tbody');
    const contrapartes = new Set();
    const ejercicios = new Set();

    rows.forEach(row => {
        const celdas = row.split(',');
        const tr = document.createElement('tr');
        celdas.forEach((c, i) => {
            const td = document.createElement('td');
            if (i >= 4 && i <= 6 && c.includes('http')) {
                const link = document.createElement('a');
                link.href = c;
                link.textContent = c.split('/').pop();
                link.target = '_blank';
                td.appendChild(link);
            } else {
                td.textContent = c;
            }
            tr.appendChild(td);
        });
        tabla.appendChild(tr);

        if (celdas[1]) contrapartes.add(celdas[1]);
        if (celdas[3]) ejercicios.add(celdas[3]);
    });

    const selectContraparte = document.getElementById('contraparte');
    contrapartes.forEach(c => {
        const option = document.createElement('option');
        option.value = option.textContent = c;
        selectContraparte.appendChild(option);
    });

    const selectEjercicio = document.getElementById('ejercicio');
    ejercicios.forEach(e => {
        const option = document.createElement('option');
        option.value = option.textContent = e;
        selectEjercicio.appendChild(option);
    });
}

function filtrarDatos() {
    const contraparte = document.getElementById('contraparte').value;
    const ejercicio = document.getElementById('ejercicio').value;
    const filas = document.querySelectorAll('#tabla-datos tbody tr');
    filas.forEach(fila => {
        const c1 = fila.children[1].textContent;
        const c3 = fila.children[3].textContent;
        const visible = (!contraparte || c1 === contraparte) && (!ejercicio || c3 === ejercicio);
        fila.style.display = visible ? '' : 'none';
    });
}

function restablecerFiltro() {
    document.getElementById('contraparte').value = '';
    document.getElementById('ejercicio').value = '';
    filtrarDatos();
}
