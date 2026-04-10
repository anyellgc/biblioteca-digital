const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const User = require("./models/user");
const Libro = require("./models/Libro");

const app = express();

//MIDDLEWARES
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

//VERIFICACIÓN DE CARPETAS
const uploadDir = path.join(__dirname, "public/libros");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

//conexión con mongo
mongoose.connect("mongodb://127.0.0.1:27017/biblioteca")
    .then(() => console.log("✅ MongoDB conectado y listo"))
    .catch(err => console.log("❌ Error de conexión:", err));

//CONFIGURACIÓN DE MULTER (Subida de PDFs)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/libros/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

//ruta para los libros

// 1. Subir Libro (POST)
app.post("/api/libros/subir", upload.single('pdf'), async (req, res) => {
    try {
        const { titulo, autor, descripcion, portadaUrl, categoria, idioma } = req.body;

        if (!req.file) {
            return res.status(400).json({ mensaje: "Falta el archivo PDF" });
        }

        const nuevoLibro = new Libro({
            titulo,
            autor,
            descripcion,
            categoria: categoria || "General",
            idioma: idioma || "Español",
            portada: portadaUrl,
            pdf: `/libros/${req.file.filename}`
        });

        await nuevoLibro.save();
        res.json({ mensaje: "Libro guardado correctamente en la nube" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al guardar en BD" });
    }
});

// 2. Obtener Todos (GET)
app.get("/api/libros/todos", async (req, res) => {
    try {
        const libros = await Libro.find().sort({ _id: -1 }); // Los más nuevos primero
        res.json(libros);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener libros" });
    }
});

// 3. Eliminar Libro (DELETE) - NUEVA RUTA PARA EL ADMIN
app.delete("/api/libros/eliminar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        // Primero buscamos el libro para borrar el archivo físico del PDF
        const libro = await Libro.findById(id);
        if (libro) {
            const rutaArchivo = path.join(__dirname, "public", libro.pdf);
            if (fs.existsSync(rutaArchivo)) {
                fs.unlinkSync(rutaArchivo); // Borra el archivo de la carpeta public/libros
            }
        }

        await Libro.findByIdAndDelete(id);
        res.json({ mensaje: "Libro eliminado de la base de datos" });
    } catch (error) {
        res.status(500).json({ mensaje: "No se pudo eliminar el libro" });
    }
});

//rutas de autenticación
app.post("/registro", async (req, res) => {
    try {
        const { nombre, apellido, edad, correo, usuario, password, rol } = req.body;
        const existeUsuario = await User.findOne({ $or: [{ usuario }, { correo }] });
        if (existeUsuario) return res.status(400).json({ mensaje: "Ya existe el usuario" });

        const nuevoUsuario = new User({ nombre, apellido, edad, correo, usuario, password, rol });
        await nuevoUsuario.save();
        res.json({ mensaje: "Registro exitoso", redireccion: "login.html" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error en registro" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { usuario, password } = req.body;
        const usuarioDB = await User.findOne({ usuario, password });
        if (!usuarioDB) return res.status(401).json({ mensaje: "Error" });
        res.json({ mensaje: "Bienvenido", rol: usuarioDB.rol, nombre: usuarioDB.nombre });
    } catch (error) {
        res.status(500).json({ mensaje: "Error" });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));