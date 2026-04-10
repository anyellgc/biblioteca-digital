document.addEventListener('DOMContentLoaded', () => {
    const contenedorLibros = document.getElementById('contenedorLibros');
    const inputBusqueda = document.getElementById('busqueda');
    const filtroTags = document.querySelector('.filter-tags');
    
    // Variable global para guardar los libros y no pedir a la BD en cada búsqueda
    let librosBaseDeDatos = [];

    // --- 1. FUNCIÓN PARA OBTENER LIBROS DE MONGODB ---
    const obtenerLibros = async () => {
        try {
            const response = await fetch('/api/libros/todos');
            librosBaseDeDatos = await response.json();
            
            // Renderizar por primera vez
            renderizarLibros(librosBaseDeDatos);
        } catch (error) {
            console.error("Error al cargar la biblioteca:", error);
            contenedorLibros.innerHTML = `<p class="error">Error al conectar con el servidor.</p>`;
        }
    };

    const renderizarLibros = (listaAMostrar) => {
        // Borramos el Loader ("Sincronizando...") y el contenido previo
        contenedorLibros.innerHTML = "";

        if (listaAMostrar.length === 0) {
            contenedorLibros.innerHTML = `<p class="no-results">No se encontraron libros que coincidan.</p>`;
            return;
        }

        listaAMostrar.forEach(libro => {
            const card = document.createElement('div');
            card.className = 'book-card';
            
            // Estructura de la tarjeta que pediste
            card.innerHTML = `
                <div class="book-cover">
                    <img src="${libro.portada}" alt="${libro.titulo}" onerror="this.src='https://via.placeholder.com/150x220?text=Sin+Portada'">
                    <div class="book-badge">PDF</div>
                </div>
                <div class="book-info">
                    <h3>${libro.titulo}</h3>
                    <p class="author">${libro.autor}</p>
                    <p class="category">${libro.categoria || 'General'}</p>
                    <a href="${libro.pdf}" target="_blank" class="btn-read">
                        Leer ahora <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            `;
            contenedorLibros.appendChild(card);
        });
    };

    inputBusqueda.addEventListener('input', (e) => {
        const termino = e.target.value.toLowerCase();
        
        const filtrados = librosBaseDeDatos.filter(libro => 
            libro.titulo.toLowerCase().includes(termino) || 
            libro.autor.toLowerCase().includes(termino) ||
            libro.categoria.toLowerCase().includes(termino)
        );
        
        renderizarLibros(filtrados);
    });

    filtroTags.addEventListener('click', (e) => {
        // Verificamos si hizo clic en un span de tag
        if (e.target.classList.contains('tag')) {
            // Manejo visual de la clase 'active'
            document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');

            const categoriaSeleccionada = e.target.textContent;

            if (categoriaSeleccionada === "Todos") {
                renderizarLibros(librosBaseDeDatos);
            } else {
                const filtrados = librosBaseDeDatos.filter(libro => 
                    libro.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase()
                );
                renderizarLibros(filtrados);
            }
        }
    });

    // Ejecutar la carga inicial
    obtenerLibros();
});