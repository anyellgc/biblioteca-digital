const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const nodemailer = require("nodemailer");

const User = require("./models/user");
const Libro = require("./models/Libro");
const Resena = require("./models/Resena");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/libros", express.static(path.join(__dirname, "public/libros")));

const uploadDir = path.join(__dirname, "public/libros");

if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(uploadDir, { recursive: true });

}

const mongoURI = "mongodb://anyellgc:amgc6372839943@ac-cqmuaag-shard-00-00.c4oobiu.mongodb.net:27017,ac-cqmuaag-shard-00-01.c4oobiu.mongodb.net:27017,ac-cqmuaag-shard-00-02.c4oobiu.mongodb.net:27017/biblioteca?ssl=true&replicaSet=atlas-c43k79-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(mongoURI)

.then(() => console.log("✅ Conectado a MongoDB Atlas"))

.catch(err => {

    console.error("❌ Error crítico al conectar a MongoDB:", err.message);

    process.exit(1);

});

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "public/libros/");

    },

    filename: (req, file, cb) => {

    const nombreLimpio = file.originalname
        .replace(/\s+/g, "_")
        .replace(/[^\w.-]/g, "");

    cb(
        null,
        Date.now() + "-" + nombreLimpio
    );

}

});

const upload = multer({ storage });

const transcriptor = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user: "ac5095319@gmail.com",

        pass: "12345"

    }

});

app.post("/api/soporte", async (req, res) => {

    try {

        const {
            nombre,
            correo,
            mensaje
        } = req.body;

        if (!nombre || !correo || !mensaje) {

            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });

        }

        console.log(`📩 [Soporte] Mensaje de ${nombre} (${correo}): ${mensaje}`);

        return res.status(200).json({
            success: true,
            mensaje: "Mensaje recibido correctamente."
        });

    } catch (error) {

        console.error("Error en soporte:", error);

        res.status(500).json({
            mensaje: "No se pudo procesar tu solicitud."
        });

    }

});

// RUTA PARA SUBIR LIBROS
app.post("/api/libros/subir", upload.single("pdf"), async (req, res) => {

    try {

        const {
            titulo,
            autor,
            descripcion,
            portadaUrl,
            categoria,
            idioma
        } = req.body;

        if (!req.file) {

            return res.status(400).json({
                mensaje: "Falta el archivo PDF"
            });

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

        res.json({
            mensaje: "Libro guardado correctamente"
        });

    } catch (error) {

        console.error("Error al guardar libro:", error);

        res.status(500).json({
            mensaje: "Error al guardar el archivo."
        });

    }

});

// OBTENER TODOS LOS LIBROS
app.get("/api/libros/todos", async (req, res) => {

    try {

        const libros = await Libro.find().sort({ _id: -1 });

        res.json(libros);

    } catch (error) {

        console.error("Error al obtener libros:", error);

        res.status(500).json({
            mensaje: "Error al cargar la lista de libros."
        });

    }

});

// GUARDAR RESEÑA
app.post("/api/resenas", async (req, res) => {

    try {

        const {
            libroId,
            usuario,
            comentario,
            calificacion
        } = req.body;

        if (
            !libroId ||
            !usuario ||
            !comentario ||
            !calificacion
        ) {

            return res.status(400).json({
                mensaje: "Faltan datos obligatorios"
            });

        }

        const nuevaResena = new Resena({

            libroId,
            usuario,
            comentario,
            calificacion

        });

        await nuevaResena.save();

        res.json({
            mensaje: "Reseña guardada correctamente"
        });

    } catch (error) {

        console.error("Error guardando reseña:", error);

        res.status(500).json({
            mensaje: "Error interno al guardar reseña"
        });

    }

});

// OBTENER RESEÑAS DE UN LIBRO
app.get("/api/resenas/:libroId", async (req, res) => {

    try {

        const { libroId } = req.params;

        const resenas = await Resena.find({

            libroId

        }).sort({ fecha: -1 });

        res.json(resenas);

    } catch (error) {

        console.error("Error obteniendo reseñas:", error);

        res.status(500).json({
            mensaje: "Error interno"
        });

    }

});

// RUTA PARA ELIMINAR UN LIBRO
app.delete("/api/libros/eliminar/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const libroEliminado = await Libro.findByIdAndDelete(id);

        if (!libroEliminado) {

            return res.status(404).json({
                mensaje: "El libro no existe"
            });

        }

        // ELIMINAR PDF
        if (libroEliminado.pdf) {

            const filePath = path.join(
                __dirname,
                "public",
                libroEliminado.pdf
            );

            if (fs.existsSync(filePath)) {

                fs.unlinkSync(filePath);

            }

        }

        // ELIMINAR RESEÑAS RELACIONADAS
        await Resena.deleteMany({

            libroId: id

        });

        res.json({
            mensaje: "Libro eliminado correctamente"
        });

    } catch (error) {

        console.error("Error al eliminar libro:", error);

        res.status(500).json({
            mensaje: "Error interno al eliminar"
        });

    }

});

app.put("/api/libros/editar/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const {
            titulo,
            categoria,
            autor,
            idioma,
            descripcion,
            portadaUrl
        } = req.body;

        const libroActualizado = await Libro.findByIdAndUpdate(

            id,

            {
                titulo,
                categoria,
                autor,
                idioma,
                descripcion,
                portada: portadaUrl
            },

            { new: true }

        );

        if (!libroActualizado) {

            return res.status(404).json({
                mensaje: "Libro no encontrado"
            });

        }

        res.json({
            mensaje: "Libro actualizado correctamente."
        });

    } catch (error) {

        console.error("Error al actualizar libro:", error);

        res.status(500).json({
            mensaje: "Error interno al actualizar"
        });

    }

});

app.post("/registro", async (req, res) => {

    try {

        const {
            nombre,
            apellido,
            edad,
            correo,
            usuario,
            password,
            rol
        } = req.body;

        const usuarioExistente = await User.findOne({ usuario });

        if (usuarioExistente) {

            return res.status(400).json({
                mensaje: "El nombre de usuario ya está en uso."
            });

        }

        const nuevoUsuario = new User({

            nombre,

            apellido,

            edad,

            correo,

            usuario,

            password,

            rol: rol || "user"

        });

        await nuevoUsuario.save();

        res.json({

            mensaje: "Registro exitoso",

            redireccion: "login.html"

        });

    } catch (error) {

        console.error("Error en registro:", error);

        res.status(500).json({
            mensaje: "Error al registrar"
        });

    }

});

app.post("/login", async (req, res) => {

    try {

        const {
            usuario,
            password
        } = req.body;

        const usuarioDB = await User.findOne({

            usuario,
            password

        });

        if (!usuarioDB) {

            return res.status(401).json({
                mensaje: "Usuario o contraseña incorrectos"
            });

        }

        res.json({

            mensaje: "Bienvenido",

            rol: usuarioDB.rol,

            nombre: usuarioDB.nombre

        });

    } catch (error) {

        console.error("Error en login:", error);

        res.status(500).json({
            mensaje: "Error al iniciar sesión"
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);

});