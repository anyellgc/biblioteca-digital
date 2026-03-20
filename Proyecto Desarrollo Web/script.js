let usuarios = []

function mostrarRegistro(){

document.getElementById("registroForm").style.display="block"
document.getElementById("loginForm").style.display="none"

}

function mostrarLogin(){

document.getElementById("registroForm").style.display="none"
document.getElementById("loginForm").style.display="block"

}

document.getElementById("registroForm").addEventListener("submit",function(e){

e.preventDefault()

let nombre=document.getElementById("nombre").value
let correo=document.getElementById("correoRegistro").value
let password=document.getElementById("passwordRegistro").value
let rol=document.getElementById("rolRegistro").value

usuarios.push({
nombre,
correo,
password,
rol
})

document.getElementById("mensaje").innerText="Usuario registrado correctamente"

})

document.getElementById("loginForm").addEventListener("submit",function(e){

e.preventDefault()

let correo=document.getElementById("correoLogin").value
let password=document.getElementById("passwordLogin").value

let usuario=usuarios.find(u=>u.correo===correo && u.password===password)

if(usuario){

if(usuario.rol==="admin"){

window.location.href="administrador.html"

}else{

window.location.href="usuario.html"

}

}else{

document.getElementById("mensaje").innerText="Usuario o contraseña incorrectos"

}

})