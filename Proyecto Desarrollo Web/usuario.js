let libros = JSON.parse(localStorage.getItem("libros")) || []

const catalogo = document.getElementById("catalogo")

libros.forEach(libro=>{

catalogo.innerHTML+=`

<div class="libro">

<h3>${libro.titulo}</h3>

<p>Autor: ${libro.autor}</p>

<button>Leer PDF</button>

</div>

`

})