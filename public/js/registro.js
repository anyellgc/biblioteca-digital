const form = document.getElementById("registroForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const datos = {
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        edad: document.getElementById("edad").value,
        correo: document.getElementById("correo").value,
        usuario: document.getElementById("usuario").value,
        password: document.getElementById("password").value,
        rol: document.getElementById("rol").value
    };

    try {
        const respuesta = await fetch("/registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        const data = await respuesta.json();

        const mensajeFlotante = document.createElement("div");
        mensajeFlotante.className = "notificacion";
        mensajeFlotante.textContent = data.mensaje;
        document.body.appendChild(mensajeFlotante);

        if (respuesta.ok) {
            setTimeout(() => window.location.href = "login.html", 2000);
        }
    } catch (error) {
        console.error("Error:", error);
    }
});