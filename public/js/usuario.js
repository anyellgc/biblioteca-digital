document.addEventListener("DOMContentLoaded", () => {

    const contenedorLibros = document.getElementById("contenedorLibros");
    const modal = document.getElementById("modalDetalleLibro");
    const btnCerrar =document.getElementById("btnCerrarDetalle");
    const modalPortada = document.getElementById("modalPortada");
    const modalCategoria = document.getElementById("modalCategoria");
    const modalTitulo = document.getElementById("modalTitulo");
    const modalAutor = document.getElementById("modalAutor");
    const modalIdioma = document.getElementById("modalIdioma");
    const modalDescripcion = document.getElementById("modalDescripcion");
    const btnLectorFinal = document.getElementById("btnLectorFinal");

    // BUSCADOR
    const inputBusqueda = document.getElementById("busqueda");

    // TAGS
    const tags = document.querySelectorAll(".tag");

    // ESTRELLAS
    const estrellas = document.querySelectorAll(".star-interactive");

    const ratingText = document.querySelector(".rating-text-status");

    // COMENTARIOS
    const inputComentario = document.getElementById("inputComentario");

    const btnComentario = document.getElementById("btnEnviarComentario");

    const contenedorComentarios = document.getElementById("contenedorComentarios");

    let todosLosLibros = [];
    let calificacionActual = 0;
    let libroActualId = null;
    // OBTENER LIBROS
    
    async function obtenerLibros(){

        try{

            const respuesta = await fetch("/api/libros/todos");
            todosLosLibros = await respuesta.json();
            renderizarLibros(todosLosLibros);

        }catch(error){

            console.error("Error cargando libros:",error);
        }
    }
    // RENDERIZAR LIBROS
    function renderizarLibros(libros){

        if(!contenedorLibros) return;

        if(libros.length === 0){

            contenedorLibros.innerHTML = `
                <p class="no-books">
                    No hay libros disponibles
                </p>
            `;

            return;
        }

        contenedorLibros.innerHTML =
            libros.map(libro => `

                <div class="book-card">

                    <div class="book-cover-wrapper">

                        <img
                            src="${libro.portada || 'https://via.placeholder.com/300x450'}"
                            alt="${libro.titulo}"
                        >

                    </div>

                    <div class="book-card-info">

                        <span class="book-card-tag">
                            ${libro.categoria}
                        </span>

                        <h3 class="book-card-title">
                            ${libro.titulo}
                        </h3>

                        <p class="book-card-author">
                            ${libro.autor}
                        </p>

                        <button
                            class="btn-view-details"
                            onclick="verDetalles('${libro._id}')"
                        >

                            Ver detalles →

                        </button>

                    </div>

                </div>

            `).join("");
    }
    
    window.verDetalles = async (id) => {
        const libro = todosLosLibros.find( l => l._id === id);

        if(!libro) return;

        libroActualId = id;

        modalPortada.src = libro.portada;

        modalCategoria.textContent = libro.categoria;

        modalTitulo.textContent = libro.titulo;

        modalAutor.textContent =libro.autor;

        modalIdioma.textContent = libro.idioma || "Español";

        modalDescripcion.textContent = libro.descripcion || "Sin reseña disponible.";

        btnLectorFinal.href = libro.pdf;

        // MOSTRAR MODAL
        modal.classList.add("active");

        document.body.classList.add("modal-open");

        // RESETEAR ELEMENTOS INTERACTIVOS
        inputComentario.value = "";

        calificacionActual = 0;

        estrellas.forEach(star => {
            star.classList.remove("active");
        });

        if(ratingText){
            ratingText.textContent =
                "Selecciona una puntuación";
        }

        // CARGAR RESEÑAS DESDE SU COLECION PROPIA
        cargarResenas(id);

    };

    async function cargarResenas(libroId){

        try{

            const respuesta =
                await fetch(`/api/resenas/${libroId}`);

            const resenas =
                await respuesta.json();

            if(!contenedorComentarios) return;

            if(resenas.length === 0){

                contenedorComentarios.innerHTML = `
                    <div class="no-comments-fallback">
                        No hay reseñas todavía
                    </div>
                `;

                return;
            }
            contenedorComentarios.innerHTML =
                resenas.map(resena => `

                    <div class="single-comment-item">

                        <strong>
                            ${resena.usuario || "Lector"}
                        </strong> 

                        <br>

                        ⭐ ${resena.calificacion}/5

                        <br><br>

                        ${resena.comentario}

                    </div>

                `).join("");

        }catch(error){

            console.error(
                "Error cargando reseñas:",
                error
            );
        }
    }
    // CERRAR MODAL
    if(btnCerrar){

        btnCerrar.addEventListener("click", () => {

            modal.classList.remove("active");

            document.body.classList.remove("modal-open");

        });

    }
    // CERRAR AL DAR CLICK AFUERA
    window.addEventListener("click", (e) => {
        if(e.target === modal){
            modal.classList.remove("active");
            document.body.classList.remove("modal-open");
        }
    });
    // SISTEMA DE ESTRELLAS
    estrellas.forEach(star => {
        star.addEventListener("click", () => {
            calificacionActual = parseInt(star.dataset.value);

            estrellas.forEach(s => {
                s.classList.remove("active");

                if(
                    parseInt(s.dataset.value)
                    <= calificacionActual
                ){

                    s.classList.add("active");

                }

            });

            if(ratingText){

                ratingText.textContent =
                    `Tu puntuación: ${calificacionActual}/5`;

            }

        });

    });
    // ENVIAR RESEÑA
    if(btnComentario){

        btnComentario.addEventListener("click", async () => {

            try{

                // VALIDAR LIBRO
                if(!libroActualId){
                    alert("No se encontró el libro");
                    return;
                }

                // VALIDAR INPUT
                if(!inputComentario){
                    alert("No existe el campo comentario");
                    return;
                }

                const comentario = inputComentario.value.trim();

                // VALIDAR COMENTARIO
                if(comentario === ""){
                    alert("Escribe una reseña");
                    return;
                }

                // VALIDAR ESTRELLAS
                if(calificacionActual === 0){
                    alert("Selecciona una calificación");
                    return;
                }

                // OBTENER USUARIO LOGUEADO DESDE LOCALSTORAGE
                const usuario =
                    localStorage.getItem("nombre") || 
                    localStorage.getItem("usuario") || 
                    "Lector";

                // ENVIAR PETICIÓN AL BACKEND
                const respuesta =
                    await fetch("/api/resenas", {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            libroId: libroActualId,
                            usuario: usuario,
                            comentario: comentario, // Nombre de propiedad alineado al backend
                            calificacion: calificacionActual
                        })

                    });

                // RESPUESTA
                const data =
                    await respuesta.json();

                // ERROR SERVIDOR
                if(!respuesta.ok){
                    alert(
                        data.mensaje ||
                        "Error al publicar"
                    );
                    return;
                }

                // LIMPIAR INPUT
                inputComentario.value = "";

                // RESETEAR ESTRELLAS
                calificacionActual = 0;

                estrellas.forEach(s => {
                    s.classList.remove("active");
                });

                // TEXTO
                if(ratingText){
                    ratingText.textContent =
                        "Selecciona una puntuación";
                }

                // RECARGAR LISTADO DE RESEÑAS EN EL ACTO
                await cargarResenas(libroActualId);

                // MENSAJE
                alert("Reseña publicada correctamente");

            }catch(error){

                console.error(
                    "Error enviando reseña:",
                    error
                );

                alert(
                    "No se pudo publicar la reseña"
                );
            }
        });
    }
    // FILTROS POR CATEGORÍA
    tags.forEach(tag => {
        tag.addEventListener("click", () => {
            // ACTIVAR ESTILO
            tags.forEach(t => {
                t.classList.remove("active");
            });
            tag.classList.add("active");

            const categoria = tag.textContent.toLowerCase().trim();

            if(categoria === "todos" || categoria === "todas"){
                renderizarLibros(todosLosLibros);
                return;
            }
            // FILTRAR COMPARANDO EN MINÚSCULAS
            const filtrados =
                todosLosLibros.filter(libro => {
                    return libro.categoria && 
                        libro.categoria.toLowerCase().includes(categoria);
                });

            renderizarLibros(filtrados);
        });
    });

    // BUSCADOR EN TIEMPO REAL
    if(inputBusqueda) {
        inputBusqueda.addEventListener("input", (e) => {
            const valor = e.target.value.toLowerCase().trim();
            const filtrados = todosLosLibros.filter(libro => 
                libro.titulo.toLowerCase().includes(valor) || 
                libro.autor.toLowerCase().includes(valor)
            );
            renderizarLibros(filtrados);
        });
    }
    obtenerLibros();

});