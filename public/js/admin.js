document.addEventListener('DOMContentLoaded', () => { 
    const formSubir = document.getElementById('formSubirLibro');
    const tablaCuerpo = document.getElementById('tablaInventarioCuerpo');
    const totalLibrosLabel = document.getElementById('totalLibrosContador');

    const cargarInventario = async () => {
        try {
            const response = await fetch('/api/libros/todos');
            const libros = await response.json();
            
            while (tablaCuerpo.firstChild) {
                tablaCuerpo.removeChild(tablaCuerpo.firstChild);
            }

            libros.forEach((libro) => {
                const fila = document.createElement('tr');

                // Celda 1: Título del libro
                const celdaTitulo = document.createElement('td');
                celdaTitulo.textContent = libro.titulo;
                fila.appendChild(celdaTitulo);

                // Celda 2: Categoría con su estructura de Badge nativa segura
                const celdaCategoria = document.createElement('td');
                const badge = document.createElement('span');
                badge.classList.add('badge');
                
                // Normalizamos el nombre de la clase para evitar fallos por espacios o mayúsculas
                let categoriaTexto = libro.categoria || 'General';
                let claseLimpia = categoriaTexto.toLowerCase().replace(/\s+/g, '-');
                
                badge.classList.add(claseLimpia);
                badge.textContent = categoriaTexto;
                celdaCategoria.appendChild(badge);
                fila.appendChild(celdaCategoria);

                // Celda 3: Acciones (Botones con sus clases css e iconos correspondientes)
                const celdaAcciones = document.createElement('td');

                // Botón Editar
                const btnEdit = document.createElement('button');
                btnEdit.className = 'action-btn edit';
                btnEdit.setAttribute('data-id', libro._id);
                const iconoEdit = document.createElement('i');
                iconoEdit.className = 'fa-solid fa-pen';
                btnEdit.appendChild(iconoEdit);

                // Botón Eliminar
                const btnDelete = document.createElement('button');
                btnDelete.className = 'action-btn delete';
                btnDelete.setAttribute('data-id', libro._id);
                const iconoDelete = document.createElement('i');
                iconoDelete.className = 'fa-solid fa-trash';
                btnDelete.appendChild(iconoDelete);

                // Agregar ambos botones a la celda de acciones
                celdaAcciones.appendChild(btnEdit);
                celdaAcciones.appendChild(btnDelete);
                fila.appendChild(celdaAcciones);

                // Adjuntar la fila completa construida al cuerpo de la tabla
                tablaCuerpo.appendChild(fila);
            });

            // Actualizar la caja superior del contador de Libros Totales con tus datos reales
            if (totalLibrosLabel) {
                totalLibrosLabel.textContent = libros.length;
            }
        } catch (error) {
            console.error("Error al sincronizar el inventario desde la Base de Datos:", error);
        }
    };


    tablaCuerpo.addEventListener('click', async (e) => {
        const btnDelete = e.target.closest('.delete');
        const btnEdit = e.target.closest('.edit');
      
        if (btnDelete) {
            const id = btnDelete.dataset.id; 
            if (confirm('¿Estás seguro de eliminar este libro de la base de datos?')) {
                try {
                    const response = await fetch(`/api/libros/eliminar/${id}`, { method: 'DELETE' });
                    const data = await response.json();

                    if (response.ok) {
                        alert("✅ " + data.mensaje);
                        cargarInventario(); 
                    } else {
                        alert("❌ Error: " + data.mensaje);
                    }
                } catch (error) {
                    console.error("Error al eliminar:", error);
                    alert("❌ Error al intentar eliminar el registro");
                }
            }
        }

        if (btnEdit) {
            const id = btnEdit.dataset.id;
            const fila = btnEdit.closest('tr');
            const tituloActual = fila.cells[0].textContent;
            const categoriaActual = fila.querySelector('.badge').textContent;

            const nuevoTitulo = prompt("Modificar Título del Libro:", tituloActual);
            if (nuevoTitulo === null) return; 

            const nuevaCategoria = prompt("Modificar Categoría:", categoriaActual);
            if (nuevaCategoria === null) return;

            try {
                const response = await fetch(`/api/libros/editar/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        titulo: nuevoTitulo,
                        categoria: nuevaCategoria
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("✅ " + data.mensaje);
                    cargarInventario(); 
                } else {
                    alert("❌ Error: " + data.mensaje);
                }
            } catch (error) {
                console.error("Error al editar:", error);
                alert("❌ Error al intentar actualizar los datos");
            }
        }
    });

    formSubir.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('titulo', document.getElementById('titulo').value);
        formData.append('autor', document.getElementById('autor').value);
        formData.append('categoria', document.getElementById('categoria').value);
        formData.append('idioma', document.getElementById('idioma').value);
        formData.append('portadaUrl', document.getElementById('portadaUrl').value);
        
        const inputPdf = document.getElementById('pdf');
        if (inputPdf.files.length > 0) {
            formData.append('pdf', inputPdf.files[0]);
        }

        try {
            const response = await fetch('/api/libros/subir', {
                method: 'POST',
                body: formData 
            });

            const data = await response.json();

            if (response.ok) {
                alert("✅ " + data.mensaje);
                formSubir.reset();
                cargarInventario(); 
            } else {
                alert("❌ Error: " + data.mensaje);
            }
        } catch (error) {
            console.error("Error en la petición de subida:", error);
            alert("❌ No se pudo conectar con el servidor backend");
        }
    });
    cargarInventario();
});