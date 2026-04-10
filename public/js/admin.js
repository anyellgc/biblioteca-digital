document.addEventListener('DOMContentLoaded', () => {
    const formSubir = document.getElementById('formSubirLibro');
    const tablaCuerpo = document.querySelector('.admin-table tbody');
    const totalLibrosLabel = document.querySelector('.stat-num');

    // --- 1. FUNCIÓN PARA CARGAR EL INVENTARIO DESDE MONGO ---
    const cargarInventario = async () => {
        try {
            // Petición a tu ruta GET definida en el servidor
            const response = await fetch('/api/libros/todos');
            const libros = await response.json();
            
            tablaCuerpo.innerHTML = ''; 

            libros.forEach((libro) => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${libro.titulo}</td>
                    <td><span class="badge">${libro.categoria || 'General'}</span></td>
                    <td>
                        <button class="action-btn edit" data-id="${libro._id}"><i class="fa-solid fa-pen"></i></button>
                        <button class="action-btn delete" data-id="${libro._id}"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                tablaCuerpo.appendChild(fila);
            });

            if (totalLibrosLabel) totalLibrosLabel.textContent = libros.length;
        } catch (error) {
            console.error("Error al cargar inventario:", error);
        }
    };

    tablaCuerpo.addEventListener('click', async (e) => {
        const btnDelete = e.target.closest('.delete');
        
        if (btnDelete) {
            const id = btnDelete.dataset.id; // ID de MongoDB (_id)
            if (confirm('¿Estás seguro de eliminar este libro de la base de datos?')) {
                try {
                    // Nota: Necesitarías crear esta ruta DELETE en tu server.js
                    const response = await fetch(`/api/libros/eliminar/${id}`, { method: 'DELETE' });
                    if (response.ok) {
                        alert("Libro eliminado");
                        cargarInventario();
                    }
                } catch (error) {
                    alert("Error al intentar eliminar");
                }
            }
        }
    });

    formSubir.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Usamos FormData porque hay un archivo (PDF) involucrado
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
            // Ruta de tu servidor Express
            const response = await fetch('/api/libros/subir', {
                method: 'POST',
                body: formData // No enviamos headers de JSON, el navegador pone el Boundary de Multer solo
            });

            const data = await response.json();

            if (response.ok) {
                alert("✅ " + data.mensaje);
                formSubir.reset();
                cargarInventario(); // Recarga la tabla para ver el nuevo libro
            } else {
                alert("❌ Error: " + data.mensaje);
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            alert("❌ No se pudo conectar con el servidor de MongoDB");
        }
    });

    // Carga inicial
    cargarInventario();
});