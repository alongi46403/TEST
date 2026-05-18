const questionarioInicial = {
    cargar: function (contenedor, callback) {
        const preguntas = [
            { texto: "¿Qué edad tienes?" },
            { texto: "¿En qué tipo de área vives?", opciones: ["Urbana", "Suburbana", "Rural", "Otro"] },
            { texto: "¿Cuál es tu nivel educativo?", opciones: ["Primaria incompleta", "Primaria completa", "Secundaria incompleta", "Secundaria completa", "Universitaria incompleta", "Universitaria completa", "Posgrado"] },
            
            // 1. CONDICIONAL: Área de estudio (Solo si tiene estudios superiores)
            { 
                texto: "¿Cuál es/fue tu área de estudio o carrera?", 
                condicion: {
                    dependeDe: "¿Cuál es tu nivel educativo?",
                    valoresValidos: ["Universitaria incompleta", "Universitaria completa", "Posgrado"]
                }
            },

            { texto: "¿Cuál es tu ocupación?", opciones: ["Estudiante", "Profesional", "Trabajador autónomo", "Desempleado", "Jubilado", "Otro"] },
            { texto: "¿Con qué frecuencia escuchas música?", opciones: ["Nunca", "Ocasionalmente", "Frecuentemente", "Siempre"] },
            { texto: "¿Qué tipo de música sueles escuchar cuando necesitas concentrarte?", opcionesMultiples: ["Clásica", "Pop", "Rock", "Electrónica", "Instrumental", "Folclore", "Lo-Fi", "Otros"] },
            
            { texto: "¿Sueles utilizar otros tipos de sonidos, como sonidos de la naturaleza, radio, TV u otro para concentrarte o relajarte?", opciones: ["Si suelo utilizar", "No"] },
            
            // 2. CONDICIONAL: Especificar sonidos (Solo si respondió "Si suelo utilizar")
            { 
                texto: "¿Qué tipo de sonidos sueles utilizar para concentrarte o relajarte? (ej. ruido blanco, lluvia, olas, etc.)", 
                condicion: {
                    dependeDe: "¿Sueles utilizar otros tipos de sonidos, como sonidos de la naturaleza, radio, TV u otro para concentrarte o relajarte?",
                    valoresValidos: ["Si suelo utilizar"]
                }
            },

            { texto: "¿Por qué escuchas música?", opcionesMultiples: ["Relajarme", "Concentrarme", "Mejorar mi estado de ánimo", "Entretenimiento", "Estimular la creatividad", "Pasar el tiempo", "Otros"] },
            { texto: "¿Tocas algún instrumento musical o cantas?", opcionesMultiples: ["No", "Guitarra", "Piano", "Violín", "Batería", "Flauta", "Bajo", "Canto", "Otros"]},
            { texto: "¿Cuántos años de formación musical tienes?", opciones: ["Ninguno", "Menos de 1 año", "Entre 1 y 3 años", "Entre 3 y 5 años", "Más de 5 años"]},
            { texto: "¿Recibiste formación musical formal (en una institución) o autodidacta?", opciones: ["Formación en una escuela de música", "Formación autodidacta", "Ambos", "No recibí formación musical"]},
            { texto: "¿Has participado en grupos musicales, orquestas o coros?", opciones: ["Sí, regularmente", "Sí, ocasionalmente", "No, nunca"]},
            
            // 3. CONDICIONAL: Discapacidad auditiva
            { texto: "¿Tienes alguna dificultad o discapacidad auditiva?", opciones: ["Sí", "No"] },
            { 
                texto: "Por favor, especifica cuál es tu dificultad o discapacidad auditiva:", 
                condicion: {
                    dependeDe: "¿Tienes alguna dificultad o discapacidad auditiva?",
                    valoresValidos: ["Sí"]
                }
            },

            // SECCIÓN DE ENTORNO Y EQUIPAMIENTO
            { texto: "¿En qué tipo de entorno te encuentras realizando este test?", opciones: ["Habitación muy silenciosa", "Habitación con ruido leve (ej. ventilador, ruido de calle a lo lejos)", "Entorno ruidoso (ej. oficina compartida, gente hablando)", "Exterior"] },
            { texto: "¿Qué tipo de auriculares estás utilizando?", opciones: ["In-ear (dentro del oído, ej. earbuds o tapones)", "On-ear (apoyados sobre la oreja)", "Over-ear (cubren toda la oreja cerrándola por completo)", "No estoy usando auriculares (estoy usando parlantes)"] },
            { texto: "¿Cuál es la marca y modelo de tus auriculares? (Si no lo sabes con exactitud, escribe la marca o 'No sé')" },
            
            { texto: "¿Tus auriculares cuentan con tecnología de Cancelación Activa de Ruido (ANC)?", opciones: ["Sí", "No", "No lo sé"] },
            
            // 4. CONDICIONAL: Cancelación de ruido activada (Solo si los auriculares tienen ANC y respondió "Sí")
            { 
                texto: "¿Tienes la cancelación de ruido (ANC) activada en este momento para realizar el test?", 
                opciones: ["Sí, está activada", "No, está desactivada"],
                condicion: {
                    dependeDe: "¿Tus auriculares cuentan con tecnología de Cancelación Activa de Ruido (ANC)?",
                    valoresValidos: ["Sí"]
                }
            }
        ];

        let index = 0;
        const respuestas = {};
        let enterEvent = null;
        let direccion = 1; 

        function mostrarPregunta() {
            contenedor.innerHTML = ''; 
            const pregunta = preguntas[index];

            // Verificación de la condición de la pregunta
            if (pregunta.condicion) {
                const respPrevia = respuestas[pregunta.condicion.dependeDe];
                if (!pregunta.condicion.valoresValidos.includes(respPrevia)) {
                    respuestas[pregunta.texto] = "No aplica";
                    index += direccion;
                    
                    if (index >= preguntas.length) {
                        if (enterEvent) document.removeEventListener('keydown', enterEvent);
                        guardarRespuestas();
                        callback('personalidad');
                        return;
                    }
                    mostrarPregunta();
                    return; 
                }
            }

            const preguntaDiv = document.createElement('div');
            preguntaDiv.innerHTML = `<h3>${pregunta.texto}</h3>`;

            const mensajeError = document.createElement('p');
            mensajeError.style.color = 'red';
            mensajeError.style.display = 'none'; 
            mensajeError.textContent = 'Por favor, responde la pregunta antes de continuar.';

            if (pregunta.opciones) {
                const select = document.createElement('select');
                select.innerHTML = `<option value="">Selecciona una opción</option>` + 
                    pregunta.opciones.map(opcion => `<option value="${opcion}">${opcion}</option>`).join('');

                if (respuestas[pregunta.texto] && respuestas[pregunta.texto] !== "No aplica") {
                    select.value = respuestas[pregunta.texto];
                }

                select.addEventListener('change', () => {
                    respuestas[pregunta.texto] = select.value;
                    if (select.value === "Otro") {
                        mostrarCampoOtro(preguntaDiv, pregunta.texto);
                    } else {
                        eliminarCampoOtro(preguntaDiv);
                    }
                });
                preguntaDiv.appendChild(select);
            } else if (pregunta.opcionesMultiples) {
                respuestas[pregunta.texto] = respuestas[pregunta.texto] || [];
                if (!Array.isArray(respuestas[pregunta.texto])) respuestas[pregunta.texto] = []; 
                
                pregunta.opcionesMultiples.forEach(opcion => {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = opcion;
                    checkbox.checked = respuestas[pregunta.texto].includes(opcion);
                    checkbox.addEventListener('change', () => {
                        if (checkbox.checked) {
                            if (!respuestas[pregunta.texto].includes(opcion)) {
                                respuestas[pregunta.texto].push(opcion);
                            }
                        } else {
                            respuestas[pregunta.texto] = respuestas[pregunta.texto].filter(item => item !== opcion);
                        }
                        if (opcion === "Otros") {
                            if (checkbox.checked) {
                                mostrarCampoOtro(preguntaDiv, pregunta.texto);
                            } else {
                                eliminarCampoOtro(preguntaDiv);
                            }
                        }
                    });
                    
                    const label = document.createElement('label');
                    label.style.cursor = 'pointer'; 
                    label.style.display = 'block'; 
                    label.style.marginBottom = '8px'; 
                    
                    label.appendChild(checkbox);
                    label.appendChild(document.createTextNode(" " + opcion));
                    
                    preguntaDiv.appendChild(label);
                });
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = (respuestas[pregunta.texto] !== "No aplica") ? (respuestas[pregunta.texto] || '') : '';
                input.addEventListener('input', () => {
                    respuestas[pregunta.texto] = input.value;
                });
                preguntaDiv.appendChild(input);
            }

            const botonesDiv = document.createElement('div');
            botonesDiv.className = 'botones-navegacion';

            if (index > 0) {
                const btnAnterior = document.createElement('button');
                btnAnterior.textContent = 'Anterior';
                btnAnterior.addEventListener('click', () => {
                    direccion = -1; 
                    index--;
                    mostrarPregunta();
                });
                botonesDiv.appendChild(btnAnterior);
            }

            const btnSiguiente = document.createElement('button');
            btnSiguiente.textContent = index === preguntas.length - 1 ? 'Finalizar' : 'Siguiente';
            btnSiguiente.addEventListener('click', () => {
                if (!validarRespuesta(pregunta.texto)) {
                    mensajeError.style.display = 'block';
                    return;
                }
                mensajeError.style.display = 'none';

                direccion = 1; 

                if (index < preguntas.length - 1) {
                    index++;
                    mostrarPregunta();
                } else {
                    if (enterEvent) {
                        document.removeEventListener('keydown', enterEvent);
                    }
                    guardarRespuestas();
                    callback('personalidad');
                }
            });
            botonesDiv.appendChild(btnSiguiente);

            preguntaDiv.appendChild(mensajeError);
            preguntaDiv.appendChild(botonesDiv);
            contenedor.appendChild(preguntaDiv);

            if (enterEvent) {
                document.removeEventListener('keydown', enterEvent);
            }

            enterEvent = function(event) {
                if (event.key === 'Enter') {
                    btnSiguiente.click();
                }
            };
            document.addEventListener('keydown', enterEvent);
        }

        function mostrarCampoOtro(contenedor, preguntaTexto) {
            if (!contenedor.querySelector('textarea')) {
                const inputOtro = document.createElement('textarea');
                inputOtro.placeholder = "Especifica...";
                inputOtro.addEventListener('input', () => {
                    respuestas[preguntaTexto + '_otro'] = inputOtro.value;
                });
                contenedor.appendChild(inputOtro);
            }
        }

        function eliminarCampoOtro(contenedor) {
            const campoOtro = contenedor.querySelector('textarea');
            if (campoOtro) {
                contenedor.removeChild(campoOtro);
            }
        }

        function validarRespuesta(preguntaTexto) {
            const respuesta = respuestas[preguntaTexto];
            if (preguntas[index].opcionesMultiples) {
                if (!respuesta || respuesta.length === 0) {
                    return false;
                }
                if (respuesta.includes("Otros") && !respuestas[preguntaTexto + '_otro']) {
                    return false;
                }
                return true;
            }
            if (!respuesta || (Array.isArray(respuesta) && respuesta.length === 0)) {
                return false;
            }
            if (respuesta === "Otro" && !respuestas[preguntaTexto + '_otro']) {
                return false;
            }
            return true;
        }

        function guardarRespuestas() {
            window.resultadosFinales.inicial = respuestas;
        }

        mostrarPregunta();
    }
};