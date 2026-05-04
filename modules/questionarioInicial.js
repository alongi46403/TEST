const questionarioInicial = {
    cargar: function (contenedor, callback) {
        const preguntas = [
            { texto: "¿Qué edad tienes?" },
            { texto: "¿En qué tipo de área vives?", opciones: ["Urbana", "Suburbana", "Rural", "Otro"] },
            { texto: "¿Cuál es tu nivel educativo?", opciones: ["Primaria incompleta", "Primaria completa", "Secundaria incompleta", "Secundaria completa", "Universitaria incompleta", "Universitaria completa", "Posgrado"] },
            { texto: "¿Cuál es tu ocupación?", opciones: ["Estudiante", "Profesional", "Trabajador autónomo", "Desempleado", "Jubilado", "Otro"] },
            { texto: "¿Con qué frecuencia escuchas música?", opciones: ["Nunca", "Ocasionalmente", "Frecuentemente", "Siempre"] },
            { texto: "¿Qué tipo de música sueles escuchar cuando necesitas concentrarte?", opcionesMultiples: ["Clásica", "Pop", "Rock", "Electrónica", "Instrumental", "Folclore", "Lo-Fi", "Otros"] },
            { texto: "¿Sueles utilizar otros tipos de sonidos, como sonidos de la naturaleza, radio, TV u otro para concentrarte o relajarte?", opciones: ["Si suelo utilizar", "No"] },
            { texto: "Si respondiste que sí sueles utilizar otros tipos de sonidos, escribe cuál/es o escribe 'No' y continúa." },
            { texto: "¿Por qué escuchas música?", opcionesMultiples: ["Relajarme", "Concentrarme", "Mejorar mi estado de ánimo", "Entretenimiento", "Estimular la creatividad", "Pasar el tiempo", "Otros"] },
            { texto: "¿Tocas algún instrumento musical o cantas?", opcionesMultiples: ["No", "Alguna vez toque", "Guitarra", "Piano", "Violín", "Batería", "Flauta", "Bajo", "Canto", "Otros"]},
            { texto: "¿Cuántos años de formación musical tienes?", opciones: ["Ninguno", "Menos de 1 año", "Entre 1 y 3 años", "Entre 3 y 5 años", "Más de 5 años"]},
            { texto: "¿Recibiste formación musical formal (en una institución) o autodidacta?", opciones: ["Formación en una escuela de música", "Formación autodidacta", "Ambos", "No recibí formación musical"]},
            { texto: "¿Con qué frecuencia practicas música (ensayos, clases, etc.)?", opciones: ["No practico", "Menos de una vez por semana", "1 o 2 veces por semana", "3 a 5 veces por semana", "Todos los días"]},
            { texto: "¿Has participado en grupos musicales, orquestas o coros?", opciones: ["Sí, regularmente", "Sí, ocasionalmente", "Si, hace mucho tiempo", "No, nunca"]}
        ];

        let index = 0;
        const respuestas = {};
        let enterEvent = null;

        function mostrarPregunta() {
            contenedor.innerHTML = ''; // Limpiar contenedor
            const pregunta = preguntas[index];
            const preguntaDiv = document.createElement('div');
            preguntaDiv.innerHTML = `<h3>${pregunta.texto}</h3>`;

            const mensajeError = document.createElement('p');
            mensajeError.style.color = 'red';
            mensajeError.style.display = 'none'; // Ocultar por defecto
            mensajeError.textContent = 'Por favor, responde la pregunta antes de continuar.';

            if (pregunta.opciones) {
                const select = document.createElement('select');
                select.innerHTML = `<option value="">Selecciona una opción</option>` + 
                    pregunta.opciones.map(opcion => `<option value="${opcion}">${opcion}</option>`).join('');

                if (respuestas[pregunta.texto]) {
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

                    // --- ACÁ ESTÁ LA MAGIA ---
                    const label = document.createElement('label');
                    label.style.cursor = 'pointer'; // Hace que el mouse se vea como una "manito" al pasar por arriba
                    label.style.display = 'block'; // Hace que cada opción ocupe su propio renglón prolijamente
                    label.style.marginBottom = '8px'; // Un poco de espacio entre opciones
                    
                    // Metemos el checkbox adentro del label, y después le sumamos el texto
                    label.appendChild(checkbox);
                    label.appendChild(document.createTextNode(" " + opcion));
                    
                    preguntaDiv.appendChild(label);
                });
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = respuestas[pregunta.texto] || '';
                input.addEventListener('input', () => {
                    respuestas[pregunta.texto] = input.value;
                });
                preguntaDiv.appendChild(input);
            }

            const botonesDiv = document.createElement('div');
            botonesDiv.style.marginTop = '20px';

            if (index > 0) {
                const btnAnterior = document.createElement('button');
                btnAnterior.textContent = 'Anterior';
                btnAnterior.addEventListener('click', () => {
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

                if (index < preguntas.length - 1) {
                    index++;
                    mostrarPregunta();
                } else {
                    // Remover el evento "Enter" antes de cambiar de módulo
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