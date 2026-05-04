// modules/questionarioCBP.js


const questionarioCBP = {
    cargar: function (contenedor, callback) {
        let indicePregunta = 0;
        let respuestas = [];

        const preguntas = [
            "1. Me enojo fácilmente.",
            "2. Soy una persona creativa.",
            "3. Me preocupo mucho por los demás.",
            "4. Me gusta resolver problemas complicados.",
            "5. No me preocupo por lo que los demás piensan de mí.",
            "6. Me siento cómodo(a) en situaciones sociales.",
            "7. Soy una persona extrovertida.",
            "8. Me gusta estar rodeado(a) de gente.",
            "9. Prefiero hacer las cosas solo(a).",
            "10. Suelo mantener la calma en situaciones difíciles.",
            "11. Ayudo a los demás sin esperar nada a cambio.",
            "12. Suelo decir la verdad, incluso si es difícil.",
            "13. Disfruto ayudar a otros.",
            "14. Me gusta tener todo en orden.",
            "15. Soy una persona detallista.",
            "16. Me gusta mantenerme activo(a) y ocupado(a).",
            "17. Me esfuerzo por ser amable con los demás.",
            "18. Me resulta fácil mantener el control emocional.",
            "19. Me adapto fácilmente a los cambios.",
            "20. Me gusta que mi entorno sea tranquilo y predecible.",
            "21. Disfruto aprender cosas nuevas.",
            "22. Me considero una persona organizada.",
            "23. Me siento culpable cuando no cumplo con mis obligaciones.",
            "24. Suelo evitar los conflictos.",
            "25. Me gusta tomar decisiones rápidas.",
            "26. Prefiero no correr riesgos."
        ];

        const itemsInvertidos = [3, 6, 11, 15, 18];
        const factoresPersonalidad = {
            "Extraversión": [6, 7, 8, 9],
            "Amabilidad": [11, 13, 17, 20],
            "Responsabilidad": [14, 18, 22, 23],
            "Inestabilidad Emocional": [1, 10, 15, 24],
            "Apertura a la Experiencia": [2, 4, 12, 19]
        };
        const itemsDeseabilidadSocial = [5, 10, 12, 19, 25, 26];

        function calcularDeseabilidadSocial(respuestas) {
            return itemsDeseabilidadSocial.reduce((acc, item) => {
                return acc + (respuestas[item - 1] === 1 || respuestas[item - 1] === 5 ? 1 : 0);
            }, 0);
        }

        function invertirRespuestas(respuestas) {
            return respuestas.map((respuesta, index) => {
                return itemsInvertidos.includes(index + 1) ? 6 - respuesta : respuesta;
            });
        }

        function calcularPuntuaciones(respuestasInvertidas) {
            const resultados = {};
            for (const [factor, items] of Object.entries(factoresPersonalidad)) {
                resultados[factor] = items.reduce((acc, item) => acc + respuestasInvertidas[item - 1], 0);
            }
            return resultados;
        }

        function guardarRespuestasYResultados() {
            const respuestasTexto = preguntas.map((pregunta, index) => {
                return `${pregunta}: ${respuestas[index] || 'No respondido'}`;
            }).join('\n');

            const respuestasInvertidas = invertirRespuestas(respuestas);
            const puntuacionDeseabilidadSocial = calcularDeseabilidadSocial(respuestas);
            const resultadosPersonalidad = calcularPuntuaciones(respuestasInvertidas);

            window.resultadosFinales.personalidad = {
                respuestasCrudas: respuestas,
                deseabilidadSocial: puntuacionDeseabilidadSocial,
                valido: puntuacionDeseabilidadSocial <= 3,
                factores: resultadosPersonalidad
            };
        }

        function calcularResultados() {
            guardarRespuestasYResultados();
            document.removeEventListener("keydown", manejarEnter); // Eliminar evento Enter
            callback('preguntasEstimulo');
        }

        function manejarEnter(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                document.getElementById("btn-siguiente").click();
            }
        }

        function mostrarInstruccionInicial() {
            contenedor.innerHTML = `
                <h2>Test de Personalidad</h2>
                <p class="pregunta">Lea atentamente cada una de las oraciones que describen eventos, intereses y actitudes de la vida cotidiana, 
                responda seleccionando solo una de las opciones, lo más espontáneo posible de acuerdo a la siguiente escala:</p>
                <ul>
                    <li>Nunca</li>
                    <li>Casi nunca</li>
                    <li>A veces</li>
                    <li>Casi siempre</li>
                    <li>Siempre</li>
                </ul>
                <button id="btn-iniciar">Comenzar</button>
            `;

            document.getElementById("btn-iniciar").addEventListener("click", mostrarPregunta);
        }

        function mostrarPregunta() {
            const respuestaAnterior = respuestas[indicePregunta];
            contenedor.innerHTML = `
                <h2>Test de Personalidad</h2>
                <p class="pregunta">${preguntas[indicePregunta]}</p>
                <form id="form-respuesta">
                    <label><input type="radio" name="respuesta" value="1" ${respuestaAnterior === 1 ? 'checked' : ''}> Nunca</label><br>
                    <label><input type="radio" name="respuesta" value="2" ${respuestaAnterior === 2 ? 'checked' : ''}> Casi nunca</label><br>
                    <label><input type="radio" name="respuesta" value="3" ${respuestaAnterior === 3 ? 'checked' : ''}> A veces</label><br>
                    <label><input type="radio" name="respuesta" value="4" ${respuestaAnterior === 4 ? 'checked' : ''}> Casi siempre</label><br>
                    <label><input type="radio" name="respuesta" value="5" ${respuestaAnterior === 5 ? 'checked' : ''}> Siempre</label><br>
                </form>
                <p id="error-message" style="color: red; display: none;">Por favor, selecciona una respuesta.</p>
                <div class="botones-navegacion">
                    <button id="btn-anterior" ${indicePregunta === 0 ? 'disabled' : ''}>Atrás</button>
                    <button id="btn-siguiente">Siguiente</button>
                </div>
            `;

            const btnSiguiente = document.getElementById("btn-siguiente");
            const btnAnterior = document.getElementById("btn-anterior");
            const mensajeError = document.getElementById("error-message");

            document.addEventListener("keydown", manejarEnter); // Añadir evento Enter al mostrar cada pregunta

            btnSiguiente.addEventListener("click", () => {
                const form = document.getElementById("form-respuesta");
                const respuesta = parseInt(form.respuesta.value, 10);
                if (!respuesta) {
                    mensajeError.style.display = 'block';
                    return;
                }
                mensajeError.style.display = 'none';

                respuestas[indicePregunta] = respuesta;

                if (indicePregunta < preguntas.length - 1) {
                    indicePregunta++;
                    mostrarPregunta();
                } else {
                    calcularResultados();
                }
            });

            btnAnterior.addEventListener("click", () => {
                if (indicePregunta > 0) {
                    indicePregunta--;
                    mostrarPregunta();
                }
            });
        }

        mostrarInstruccionInicial();
    }
};