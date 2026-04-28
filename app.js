import "dotenv/config";
import express from "express";
import path from "path";

import viewsRouter from "./routes/views.routes.js";

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

// RUTAS
app.use("/", viewsRouter);

// SERVIDOR
app.listen(PORT, (err) => {
  if (err) {
    console.error("Error al iniciar el servidor:", err);
    return;
  }
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
