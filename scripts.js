document.addEventListener('DOMContentLoaded', function() {
    // Elementos de la interfaz de usuario
    const menuIcon = document.getElementById('menu-icon');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('#nav-menu a');
    const formulario = document.getElementById('formulario-datos');
    const resultadoDiv = document.getElementById('resultado');
    const barraProgreso = document.getElementById('barraProgreso');
    const progreso = document.getElementById('progreso');
    const tablaAhorro = document.getElementById('tablaAhorro');
    const resetearBtn = document.getElementById('resetear');

    // Cargar resultados previos si existen en localStorage
    cargarResultadosAnteriores();

    // Maneja la apertura y cierre del menú en dispositivos mobiles
    menuIcon.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    // Cerrar el menú al hacer clic en un enlace de navegación
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });

    // Cerrar el menú si se hace clic fuera de él
    document.addEventListener('click', function(event) {
        if (!navMenu.contains(event.target) && !menuIcon.contains(event.target)) {
            navMenu.classList.remove('active');
        }
    });

    // Manejar el evento de envío del formulario
    formulario.addEventListener('submit', function(event) {
        event.preventDefault();  // Prevenir el envío del formulario
        calcularAhorro();  // Realizar el cálculo de ahorro
    });

    // Manejar el evento de reseteo del formulario
    resetearBtn.addEventListener('click', function() {
        formulario.reset();  // Resetear los campos del formulario
        resultadoDiv.innerHTML = 'Formulario reseteado. Los datos anteriores han sido eliminados.';
        resultadoDiv.classList.add('visible', 'error');
        barraProgreso.style.display = 'none';
        progreso.style.width = '0%';
        tablaAhorro.style.display = 'none';
        tablaAhorro.querySelector('tbody').innerHTML = '';
        localStorage.removeItem('resultadoSimulacion');  // Eliminar datos guardados
    });

    // Función para calcular el ahorro necesario
    function calcularAhorro() {
        // Obtener los valores ingresados por el usuario
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

    // Mostrar un mensaje de error en la interfaz
    function mostrarMensajeError(mensaje) {
        resultadoDiv.innerHTML = mensaje;
        resultadoDiv.classList.add('visible', 'error');
        resultadoDiv.classList.remove('success');
    }

    // Mostrar los resultados del cálculo en la interfaz
    function mostrarResultado(ahorroMensual, mesesNecesarios, costo) {
        resultadoDiv.innerHTML = `Con un ahorro mensual de ${ahorroMensual.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} podrás ahorrar para tu viaje en aproximadamente ${mesesNecesarios} meses.`;
        resultadoDiv.classList.remove('error');
        resultadoDiv.classList.add('visible', 'success');
        
        // Mostrar barra de progreso y tabla de ahorro
        barraProgreso.style.display = 'block';
        progreso.style.width = '0%';
        setTimeout(() => {
            progreso.style.width = '100%';
        }, 100);

        tablaAhorro.style.display = 'table';
        const tbody = tablaAhorro.querySelector('tbody');
        tbody.innerHTML = '';
        for (let mes = 1; mes <= mesesNecesarios; mes++) {
            const ahorroAcumulado = Math.min(ahorroMensual * mes, costo);
            const row = `<tr><td>${mes}</td><td>${ahorroAcumulado.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>`;
            tbody.innerHTML += row;
        }
    }

    // Guardar los resultados en localStorage
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

    // Cargar resultados previos desde localStorage (si existen)
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

    // Mejorar la interactividad visual de los campos de entrada
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            input.style.backgroundColor = '#eafaf1';
        });
        input.addEventListener('blur', function() {
            input.style.backgroundColor = '#f9fbfd';
        });
    });
});


















