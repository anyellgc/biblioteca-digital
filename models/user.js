const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    edad: { type: Number, required: true },
    correo: { type: String, required: true, unique: true },
    usuario: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { 
        type: String, 
        enum: ["usuario", "admin"], 
        default: "usuario" 
    }
});

module.exports = mongoose.model("User", UserSchema);