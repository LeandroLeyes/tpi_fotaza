import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  crearPublicacion,
  mostrarFormPublicacion,
} from "../controllers/publicaciones.controller.js";

const usuario = Router();

usuario.use(isAuthenticated); // protege TODAS las rutas de /usuario

usuario.get("/", (req, res) => {
  res.render("usuario/home", { title: "Inicio" });
});

usuario.get("/publicaciones/crear", mostrarFormPublicacion);
usuario.post("/publicaciones/crear", crearPublicacion);

export default usuario;
