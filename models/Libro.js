const mongoose = require("mongoose");

const libroSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    autor: { type: String, required: true },
    categoria: { type: String, default: "General" }, // Nuevo campo
    idioma: { type: String, default: "Español" },    // Nuevo campo
    descripcion: { type: String },
    portada: { type: String, required: true }, 
    pdf: { type: String, required: true },
    fechaSubida: { type: Date, default: Date.now }  // Útil para ordenar por "Recientes"
});

module.exports = mongoose.model("Libro", libroSchema);