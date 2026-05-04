// app.js

window.resultadosFinales = {
    inicial: {},
    personalidad: {},
    evaluacion_estimulos: {},
    memoria: {},
    stroop: {}
};

document.addEventListener("DOMContentLoaded", function () {
    const appContainer = document.getElementById("app-container");
    const modalIntroduccion = document.getElementById("modal-introduccion");
    const btnAceptar = document.getElementById("btn-aceptar");

    // Esperar al clic en el modal para arrancar
    if(btnAceptar) {
        btnAceptar.addEventListener("click", function() {
            modalIntroduccion.style.display = "none";
            cargarModulo(questionarioInicial);
        });
    }

    function cargarModulo(modulo) {
        appContainer.innerHTML = ""; 
        if (typeof modulo.cargar === 'function') {
            modulo.cargar(appContainer, siguienteModulo);
        } else {
            console.error("El módulo no tiene una función cargar definida.");
        }
    }

    function siguienteModulo(moduloSiguiente) {
        console.log("Navegando a: ", moduloSiguiente); // Para rastrear la navegación
        switch (moduloSiguiente) {
            case 'personalidad':
                cargarModulo(questionarioCBP);
                break;
            case 'preguntasEstimulo':
                cargarModulo(preguntasEstimulo);
                break;
            case 'tareasCognitivas':
                console.log("Cargando tareasCognitivas...");
                cargarModulo(tareasCognitivas);
                break;
            case 'finalizar':
                enviarDatosAGoogleSheets();
                break;
        }
    }
});

function enviarDatosAGoogleSheets() {
    const appContainer = document.getElementById("app-container");
    appContainer.innerHTML = `<h2>Guardando resultados...</h2><p>Por favor, no cierres esta pestaña.</p>`;

    // ACÁ VAS A PEGAR LA URL DE TU GOOGLE APPS SCRIPT (Paso 7)
    const urlScript = 'https://script.google.com/macros/s/AKfycbzdAyOi_EZQLMVhJ-tB2C477U8p4twRSDljk6qc4kfXXPzHRQuObou2E1CQlXsPkswA/exec'; 
    
    // Preparamos los datos convirtiendo los objetos a JSON
    const datosAEnviar = {
        inicial: JSON.stringify(window.resultadosFinales.inicial),
        personalidad: JSON.stringify(window.resultadosFinales.personalidad),
        evaluacion_estimulos: JSON.stringify(window.resultadosFinales.evaluacion_estimulos),
        memoria: JSON.stringify(window.resultadosFinales.memoria),
        stroop: JSON.stringify(window.resultadosFinales.stroop)
    };

    fetch(urlScript, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosAEnviar)
    }).then(() => {
        appContainer.innerHTML = `
            <h2>Experimento finalizado</h2>
            <p class="pregunta">Los datos se han guardado correctamente. ¡Muchas gracias por participar!</p>`;
    }).catch(error => {
        console.error('Error:', error);
        appContainer.innerHTML = `<h2>Error</h2><p>Hubo un problema guardando los datos.</p>`;
    });
}