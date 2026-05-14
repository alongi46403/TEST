window.resultadosFinales = {
    inicial: {},
    personalidad: {},
    evaluacion_estimulos: {},
    memoria: {},
    stroop: {}
    comentariosFinales: ""
    dispositivo: {}
};

document.addEventListener("DOMContentLoaded", function () {
    const appContainer = document.getElementById("app-container");
    const modalIntroduccion = document.getElementById("modal-introduccion");
    const btnAceptar = document.getElementById("btn-aceptar");

    // Esperar al clic en el modal para arrancar
    if(btnAceptar) {
        btnAceptar.addEventListener("click", function() {
            window.resultadosFinales.dispositivo = obtenerInfoDispositivo();
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
        switch (moduloSiguiente) {
            case 'personalidad':
                cargarModulo(questionarioCBP);
                break;
            case 'preguntasEstimulo':
                cargarModulo(preguntasEstimulo);
                break;
            case 'tareasCognitivas':
                cargarModulo(tareasCognitivas);
                break;
            case 'finalizar':
                mostrarPantallaFinal();
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

    // 6. Comentarios finales
    datosPlanos["Comentarios Finales"] = window.resultadosFinales.comentariosFinales || "";
    
    // 7. Información del dispositivo
    let disp = window.resultadosFinales.dispositivo;
    for (let key in disp) {
        datosPlanos["Dispositivo - " + key] = disp[key];
    }

    return datosPlanos;
}

function enviarDatosAGoogleSheets() {
    const appContainer = document.getElementById("app-container");
    appContainer.innerHTML = `<h2>Guardando resultados...</h2><p>Por favor, no cierres esta pestaña.</p>`;

    // ¡ACÁ PONÉ TU URL DEL SCRIPT DE GOOGLE!
    const urlScript = 'https://script.google.com/macros/s/AKfycbzr15X2sfandMf3B8zGv9Tbx2psp2tUzV69tgg0hznAIr3Qma9OmnL4XnLYKWnwS8Uf/exec'; 
    
    window.resultadosFinales.dispositivo.timestampFin = new Date().toISOString();

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

function mostrarPantallaFinal() {

    const appContainer = document.getElementById("app-container");

    appContainer.innerHTML = `
        <h2>Finalización del test</h2>

        <p class="pregunta">
            Si lo deseas, puedes dejar comentarios sobre la experiencia,
            dificultades técnicas, observaciones o cualquier aspecto
            relacionado con el test.
        </p>

        <textarea 
            id="comentarios-finales"
            rows="6"
            placeholder="Escribe aquí tus comentarios (opcional)..."
        ></textarea>

        <br><br>

        <button id="btn-enviar-final">
            Enviar resultados
        </button>
    `;

    document
        .getElementById("btn-enviar-final")
        .addEventListener("click", () => {

            const comentarios = document.getElementById("comentarios-finales").value;

            window.resultadosFinales.comentariosFinales = comentarios;

            enviarDatosAGoogleSheets();
        });
}

function obtenerInfoDispositivo() {
    return {
        userAgent: navigator.userAgent,
        plataforma: navigator.platform,
        idioma: navigator.language,
        resolucionPantalla: `${screen.width}x${screen.height}`,
        tamañoVentana: `${window.innerWidth}x${window.innerHeight}`,
        dispositivoMovil: /Mobi|Android/i.test(navigator.userAgent),
        navegador: obtenerNavegador(),
        sistemaOperativo: obtenerSistemaOperativo(),
        nucleosCPU: navigator.hardwareConcurrency || "No disponible",
        memoriaRAM: navigator.deviceMemory || "No disponible",
        timestampInicio: new Date().toISOString()
    };
}

function obtenerNavegador() {
    const ua = navigator.userAgent;

    if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
    if (ua.includes("Edg")) return "Edge";

    return "Desconocido";
}

function obtenerSistemaOperativo() {
    const ua = navigator.userAgent;

    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac")) return "MacOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";

    return "Desconocido";
}