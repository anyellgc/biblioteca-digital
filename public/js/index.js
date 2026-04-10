async function loadSection(section) {
    const mainContent = document.getElementById('main-content');
    
    try {
        const response = await fetch(`${section}.html`);
        const html = await response.text();
        
        // Extraer solo el contenido dentro de la clase .container de los otros archivos
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const content = doc.querySelector('.container') || doc.body;
        
        mainContent.innerHTML = `<div class="flex justify-center mt-10">${content.innerHTML}</div>`;
        
        // Cargar script específico de la sección si existe
        if (section === 'login') {
            const script = document.createElement('script');
            script.src = 'js/login.js';
            document.body.appendChild(script);
        }
    } catch (error) {
        console.error('Error cargando sección:', error);
    }
}