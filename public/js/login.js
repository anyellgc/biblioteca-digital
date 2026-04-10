document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // Obtener los valores de los inputs
    const usuario = e.target.usuario.value;
    const password = e.target.password.value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Aquí es donde decides a dónde va cada uno
            if (data.rol === "admin") {
                window.location.href = "admin.html"; // Asegúrate de que este archivo exista
            } else {
                window.location.href = "usuario.html"; // O la página principal del usuario
            }
        } else {
            alert("Error: " + data.mensaje);
        }
    } catch (error) {
        console.error("Error en el login:", error);
        alert("No se pudo conectar con el servidor");
    }
});