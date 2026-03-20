let libros = JSON.parse(localStorage.getItem("libros")) || [];

const lista = document.getElementById("listaLibros");
const form = document.getElementById("formLibro");

function mostrarLibros(){

lista.innerHTML="";

libros.forEach((libro,index)=>{

lista.innerHTML += `
<div class="libro">
<h3>${libro.titulo}</h3>
<p>Autor: ${libro.autor}</p>
<button onclick="eliminarLibro(${index})">Eliminar</button>
</div>
`;

});

}

form.addEventListener("submit", function(e){

e.preventDefault(); // evita recargar la página

let titulo = document.getElementById("titulo").value;
let autor = document.getElementById("autor").value;

let libro = {
titulo: titulo,
autor: autor
};

libros.push(libro);

localStorage.setItem("libros", JSON.stringify(libros));

form.reset(); // limpia el formulario

mostrarLibros();

});

function eliminarLibro(index){

libros.splice(index,1);

localStorage.setItem("libros", JSON.stringify(libros));

mostrarLibros();

}

mostrarLibros();