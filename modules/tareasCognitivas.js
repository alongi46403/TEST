const tareasCognitivas = {
    respuestasMemoria: {},
    respuestasStroop: {},
    audio: new Audio(),
    versionesOrdenadas: [],

    cargar: function (contenedor, callback) {
        // Generar un orden aleatorio de las versiones (1, 2, 3)
        this.versionesOrdenadas = [1, 2, 3].sort(() => Math.random() - 0.5);
        this.mostrarInstrucciones(contenedor, 0, callback);  // Iniciar con la primera versión en el orden aleatorio
    },

    mostrarInstrucciones: function (contenedor, indiceVersion, callback) {
        if (indiceVersion > 0) {
            this.audio.pause();
        }

        const version = this.versionesOrdenadas[indiceVersion];

        contenedor.innerHTML = `
            <h2>Instrucciones</h2>
            <p class="pregunta">Se realizará una tarea de memoria y luego un test de Stroop mientras se escucha un estímulo sonoro.</p>
            <button id="btn-iniciar">Comenzar</button>
        `;

        document.getElementById("btn-iniciar").addEventListener("click", () => {
            this.iniciarMusica(version);
            this.mostrarInstruccionesMemoria(contenedor, indiceVersion, callback);  // Pasar el índice de la versión en lugar de la versión directamente
        });
    },

    mostrarInstruccionesMemoria: function (contenedor, indiceVersion, callback) {
        const version = this.versionesOrdenadas[indiceVersion];

        contenedor.innerHTML = `
            <h2>Tarea de Memoria</h2>
            <p class="pregunta">Memoriza las palabras que verás. Luego escribe las que recuerdes, separadas por espacios. El orden no importa.</p>
            <button id="btn-comenzar-memoria">Comenzar Tarea de Memoria</button>
        `;

        document.getElementById("btn-comenzar-memoria").addEventListener("click", () => {
            this.iniciarTareaMemoria(contenedor, version, callback);
        });
    },

    iniciarMusica: function (version) {
        const estimulos = [
            { nombre: "Música instrumental", archivo: "assets/musica_instrumental.mp3" },
            { nombre: "Música con letra", archivo: "assets/musica_con_letra.mp3" },
            { nombre: "Ruido blanco", archivo: "assets/ruido_blanco.mp3" }
        ];

        this.audio.src = estimulos[version - 1].archivo;
        this.audio.play();
    },

    iniciarTareaMemoria: function (contenedor, version, callback) {
        tareaMemoria.iniciar(contenedor, version, (respuestasMemoria) => {
            this.respuestasMemoria[version] = respuestasMemoria;  // Guardar las respuestas de memoria
            this.mostrarInstruccionesStroop(contenedor, version, callback);
        });
    },

    mostrarInstruccionesStroop: function (contenedor, version, callback) {
        contenedor.innerHTML = `
            <h2>Tarea de Stroop</h2>
            <p class="pregunta">En esta tarea, indica el color de la fuente, no la palabra. Presiona Enter para enviar. Responde tantas veces como puedas dentro del tiempo. ¡Buena suerte!</p>
            <button id="btn-comenzar-stroop">Comenzar Tarea de Stroop</button>
        `;

        document.getElementById("btn-comenzar-stroop").addEventListener("click", () => {
            this.iniciarTareaStroop(contenedor, version, callback);
        });
    },

    iniciarTareaStroop: function (contenedor, version, callback) {
        tareaStroop.iniciar(contenedor, version, (respuestasStroop) => {
            this.respuestasStroop[version] = respuestasStroop;  // Guardar las respuestas de Stroop

            const siguienteIndiceVersion = this.versionesOrdenadas.indexOf(version) + 1;

            if (siguienteIndiceVersion < this.versionesOrdenadas.length) {
                this.mostrarInstrucciones(contenedor, siguienteIndiceVersion, callback);  // Pasar al siguiente índice en el orden aleatorio
            } else {
                this.audio.pause();
                this.guardarResultados();  // Guardar resultados al finalizar todas las tareas
                if (callback) callback('finalizar');  // Asegurar que el callback esté definido
            }
        });
    },

    guardarResultados: function () {
    window.resultadosFinales.memoria = this.respuestasMemoria;
    window.resultadosFinales.stroop = this.respuestasStroop;
}
    
};