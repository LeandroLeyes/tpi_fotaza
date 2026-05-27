import "dotenv/config";
import express from "express";
import path from "path";
import routes from "./routes/views.routes.js";
import { connectDatabase } from "./models/sync.js";
import session from "express-session";
import { sesionData } from "./middlewares/sesion.middleware.js";
import multer from "multer";

//CONSTANTES
const PORT = process.env.PORT;
const app = express();

// MIDDLEWARES
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// BOOTSTRAP
app.use(
  "/bootstrap",
  express.static(path.join(process.cwd(), "node_modules/bootstrap/dist")),
);

// MOTOR DE PLANTILLAS
app.set("view engine", "pug");
app.set("views", "./views");

//AUTENTICACION
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    //cookie: { secure: true } /*Solo usar si utilizamos cookies*/
  }),
);
app.use(sesionData);
const upload = multer({ storage: multer.memoryStorage() });
app.use(upload.single("imagen"));

// RUTAS
app.use("/", routes);

// CONEXION A BD
connectDatabase()
  .then(() => {
    app.listen(PORT, (error) => {
      if (error) {
        console.error("Error al iniciar el servidor:", error);
        return;
      }
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error sincronizando la BD: ", error);
  });
