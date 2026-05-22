document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 

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
            if (data.rol === "admin") {
                window.location.href = "admin.html"; 
            } else {
                window.location.href = "usuario.html"; 
            }
        } else {
            alert("Error: " + data.mensaje);
        }
    } catch (error) {
        console.error("Error en el login:", error);
        alert("No se pudo conectar con el servidor");
    }
});