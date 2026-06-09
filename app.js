import "dotenv/config";
import express from "express";
import path from "path";
import routes from "./routes/views.routes.js";
import { connectDatabase } from "./models/sync.js";
import session from "express-session";
import { sesionData } from "./middlewares/sesion.middleware.js";

const PORT = process.env.PORT || 3000;
const enProduccion = process.env.NODE_ENV === "production";

const app = express();

app.set("trust proxy", 1);

// MIDDLEWARES
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: enProduccion,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(sesionData);

// BOOTSTRAP
app.use(
  "/bootstrap",
  express.static(path.join(process.cwd(), "node_modules/bootstrap/dist")),
);

// MOTOR DE PLANTILLAS
app.set("view engine", "pug");
app.set("views", "./views");

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
