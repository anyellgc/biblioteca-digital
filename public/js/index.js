document.addEventListener('DOMContentLoaded', () => {
    const formSoporte = document.getElementById('formSoporte');

    if (formSoporte) {
        formSoporte.addEventListener('submit', async (e) => {
            e.preventDefault();

            
            const inputNombre = document.getElementById('fname');
            const inputCorreo = document.getElementById('femail');
            const txtMensaje = document.getElementById('fmsg');

            const datosTicket = {
                nombre: inputNombre.value.trim(),
                correo: inputCorreo.value.trim(),
                mensaje: txtMensaje.value.trim()
            };

            try {
                const response = await fetch('/api/soporte', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datosTicket)
                });

                const data = await response.json();

                if (response.ok) {
                    alert("✅ " + data.mensaje);
                    formSoporte.reset(); 
                    
                    // Llama a la función global declarada en el HTML
                    if (typeof closeModal === 'function') {
                        closeModal();
                    }
                } else {
                    alert("❌ Error: " + data.mensaje);
                }
            } catch (error) {
                console.error("Error al despachar la solicitud de soporte:", error);
                alert("❌ Ocurrió un fallo de conexión con el servidor.");
            }
        });
    }
});

// Función original para inyección de secciones controladas
async function loadSection(section) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    try {
        const response = await fetch(`${section}.html`);
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const content = doc.querySelector('.container') || doc.body;
        
        // Limpieza de nodos hijos para evitar mutaciones directas de innerHTML masivas
        while (mainContent.firstChild) {
            mainContent.removeChild(mainContent.firstChild);
        }
        
        const contenedorFlex = document.createElement('div');
        contenedorFlex.classList.add('flex', 'justify-center', 'mt-10');
        
        const clon = content.cloneNode(true);
        contenedorFlex.appendChild(clon);
        mainContent.appendChild(contenedorFlex);
        
        if (section === 'login') {
            const script = document.createElement('script');
            script.src = 'js/login.js';
            document.body.appendChild(script);
        }
    } catch (error) {
        console.error('Error cargando sección:', error);
    }
}