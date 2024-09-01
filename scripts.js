document.addEventListener('DOMContentLoaded', function() {
    cargarDestinosDesdeJSON(); // Cargar los destinos desde el archivo JSON
    cargarResultadosAnteriores(); // Cargar resultados anteriores desde localStorage si existen

    const formulario = document.getElementById('formulario-datos');
    const resetearBtn = document.getElementById('resetear');
    
    formulario.addEventListener('submit', function(event) {
        event.preventDefault();  // Prevenir el envío del formulario
        calcularAhorro();  // Realizar el cálculo de ahorro
    });

    resetearBtn.addEventListener('click', function() {
        formulario.reset();  // Resetear los campos del formulario
        document.getElementById('resultado').innerHTML = 'Formulario reseteado. Los datos anteriores han sido eliminados.';
        document.getElementById('resultado').classList.add('visible', 'error');
        document.getElementById('barraProgreso').style.display = 'none';
        document.getElementById('progreso').style.width = '0%';
        document.getElementById('tablaAhorro').style.display = 'none';
        document.getElementById('tablaAhorro').querySelector('tbody').innerHTML = '';
        localStorage.removeItem('resultadoSimulacion');  // Eliminar datos guardados

        // Resetear el gráfico
        const ctx = document.getElementById('graficoAhorro').getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);  // Limpiar el gráfico
        document.getElementById('graficoAhorro').style.display = 'none';  // Ocultar el gráfico
    });
});

function cargarDestinosDesdeJSON() {
    fetch('config.json')
        .then(response => response.json())
        .then(data => {
            let destinos = data.viajes;
            let destinoSelect = document.getElementById('destino');
            
            destinos.forEach(destino => {
                let option = document.createElement('option');
                option.value = destino.costoPromedio;
                option.textContent = destino.destino;
                destinoSelect.appendChild(option);
            });

            // Manejar la selección del destino
            destinoSelect.addEventListener('change', function() {
                let selectedOption = destinoSelect.options[destinoSelect.selectedIndex];

                if (selectedOption.value === "personalizado") {
                    // Permitir al usuario ingresar su propio costo
                    document.getElementById('costo').value = '';
                    document.getElementById('costo').disabled = false; // Hacer el campo editable
                    document.getElementById('descripcionDestino').textContent = "Ingrese el costo del viaje personalizado.";
                } else {
                    // Usar el costo predefinido del destino seleccionado
                    document.getElementById('costo').value = selectedOption.value;
                    document.getElementById('costo').disabled = true; // Deshabilitar el campo para evitar modificaciones
                    let descripcion = destinos[destinoSelect.selectedIndex - 1].descripcion;
                    document.getElementById('descripcionDestino').textContent = descripcion;
                }
            });
        })
        .catch(error => console.error('Error al cargar el JSON:', error));
}

function calcularAhorro() {
    const ingresos = parseFloat(document.getElementById('ingresos').value.replace(/\./g, '').replace(',', '.'));
    const gastos = parseFloat(document.getElementById('gastos').value.replace(/\./g, '').replace(',', '.'));
    const costo = parseFloat(document.getElementById('costo').value.replace(/\./g, '').replace(',', '.'));

    // Validar que los valores sean numéricos y positivos
    if (isNaN(ingresos) || isNaN(gastos) || isNaN(costo)) {
        mostrarMensajeError('Por favor, ingrese valores numéricos válidos.');
        return;
    }

    if (ingresos <= 0 || gastos < 0 || costo <= 0) {
        mostrarMensajeError('Por favor, ingrese valores mayores a cero.');
        return;
    }

    const ahorroMensual = ingresos - gastos;  // Calcular el ahorro mensual
    if (ahorroMensual <= 0) {
        mostrarMensajeError('No es posible ahorrar con los ingresos y gastos actuales.');
        return;
    }

    const mesesNecesarios = Math.ceil(costo / ahorroMensual);  // Calcular los meses necesarios para ahorrar el costo del viaje
    mostrarResultado(ahorroMensual, mesesNecesarios, costo);  // Mostrar el resultado al usuario
    guardarResultado(ingresos, gastos, costo, ahorroMensual, mesesNecesarios);  // Guardar los resultados en localStorage
}

function mostrarMensajeError(mensaje) {
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = mensaje;
    resultadoDiv.classList.add('visible', 'error');
    resultadoDiv.classList.remove('success');
}

function mostrarResultado(ahorroMensual, mesesNecesarios, costo) {
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = `Con un ahorro mensual de ${ahorroMensual.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} podrás ahorrar para tu viaje en aproximadamente ${mesesNecesarios} meses.`;
    resultadoDiv.classList.remove('error');
    resultadoDiv.classList.add('visible', 'success');
    
    const barraProgreso = document.getElementById('barraProgreso');
    const progreso = document.getElementById('progreso');
    barraProgreso.style.display = 'block';
    progreso.style.width = '0%';
    setTimeout(() => {
        progreso.style.width = '100%';
    }, 100);

    const tablaAhorro = document.getElementById('tablaAhorro');
    const tbody = tablaAhorro.querySelector('tbody');
    tablaAhorro.style.display = 'table';
    tbody.innerHTML = '';
    for (let mes = 1; mes <= mesesNecesarios; mes++) {
        const ahorroAcumulado = Math.min(ahorroMensual * mes, costo);
        const row = `<tr><td>${mes}</td><td>${ahorroAcumulado.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>`;
        tbody.innerHTML += row;
    }

    mostrarGrafico(ahorroMensual, mesesNecesarios, costo); // Llamar a la función para mostrar el gráfico
}

function guardarResultado(ingresos, gastos, costo, ahorroMensual, mesesNecesarios) {
    const resultado = {
        ingresos: ingresos,
        gastos: gastos,
        costo: costo,
        ahorroMensual: ahorroMensual,
        mesesNecesarios: mesesNecesarios
    };
    localStorage.setItem('resultadoSimulacion', JSON.stringify(resultado));  // Convertir el objeto en una cadena JSON y guardarlo
}

function cargarResultadosAnteriores() {
    const resultadoGuardado = localStorage.getItem('resultadoSimulacion');
    if (resultadoGuardado) {
        const resultado = JSON.parse(resultadoGuardado);  // Convertir la cadena JSON en un objeto

        // Rellenar los campos del formulario con los datos guardados
        document.getElementById('ingresos').value = resultado.ingresos;
        document.getElementById('gastos').value = resultado.gastos;
        document.getElementById('costo').value = resultado.costo;

        // Mostrar los resultados previos en la interfaz
        mostrarResultado(resultado.ahorroMensual, resultado.mesesNecesarios, resultado.costo);
    }
}

function mostrarGrafico(ahorroMensual, mesesNecesarios, costo) {
    const ctx = document.getElementById('graficoAhorro').getContext('2d');
    document.getElementById('graficoAhorro').style.display = 'block';

    const labels = Array.from({ length: mesesNecesarios }, (_, i) => `Mes ${i + 1}`);
    const datosAhorro = labels.map((_, i) => Math.min(ahorroMensual * (i + 1), costo));

    const data = {
        labels: labels,
        datasets: [{
            label: 'Ahorro Acumulado',
            data: datosAhorro,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

























