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

// Esta función extrae cada respuesta y le pone un título para el Excel
function formatearDatosParaExcel() {
    let datosPlanos = {};

    // 1. Inicial
    for (let key in window.resultadosFinales.inicial) {
        datosPlanos["Inicial - " + key] = window.resultadosFinales.inicial[key];
    }

    // 2. Personalidad
    let pers = window.resultadosFinales.personalidad;
    if (pers && pers.factores) {
        datosPlanos["Personalidad - Deseabilidad"] = pers.deseabilidadSocial;
        datosPlanos["Personalidad - Válido"] = pers.valido ? "Sí" : "No";
        for (let f in pers.factores) {
            datosPlanos["Personalidad - " + f] = pers.factores[f];
        }
    }

    // 3. Estímulos
    let estimulos = window.resultadosFinales.evaluacion_estimulos;
    for (let est in estimulos) {
        estimulos[est].forEach(r => {
            datosPlanos[`Evaluación [${est}] - ${r[0]}`] = r[1];
        });
    }

    // 4. Memoria
    let memoria = window.resultadosFinales.memoria;
    const nombresEstimulos = ["Música instrumental", "Música con letra", "Ruido blanco"];
    for (let version in memoria) {
        let nombreEst = nombresEstimulos[version - 1] || version;
        datosPlanos[`Memoria [${nombreEst}]`] = memoria[version].join(", ");
    }

    // 5. Stroop
    let stroop = window.resultadosFinales.stroop;
    for (let version in stroop) {
        let nombreEst = nombresEstimulos[version - 1] || version;
        // Guarda el stroop así: "rojo(red)=amarillo | azul(blue)=azul"
        let respuestasStroop = stroop[version].map(r => `${r[0]}(${r[1]})=${r[2]}`).join(" | ");
        datosPlanos[`Stroop [${nombreEst}]`] = respuestasStroop;
    }

    return datosPlanos;
}

function enviarDatosAGoogleSheets() {
    const appContainer = document.getElementById("app-container");
    appContainer.innerHTML = `<h2>Guardando resultados...</h2><p>Por favor, no cierres esta pestaña.</p>`;

    const urlScript = 'https://script.google.com/macros/s/AKfycbxXKbb9xXR9TBxvLlsXruJZ9_9WOb7DRbigiEepnTRVfjHlCMHo7bTnr_EFCRmen4yF/execI'; 
    
    // Obtenemos los datos ordenados
    const datosAEnviar = formatearDatosParaExcel();

    fetch(urlScript, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosAEnviar)
    }).then(() => {
        appContainer.innerHTML = `<h2>Experimento finalizado</h2><p>Los datos se han guardado correctamente. ¡Muchas gracias por participar!</p>`;
    }).catch(error => {
        console.error('Error:', error);
        appContainer.innerHTML = `<h2>Error</h2><p>Hubo un problema guardando los datos.</p>`;
    });
}