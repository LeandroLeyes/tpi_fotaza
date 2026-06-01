import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  crearPublicacion,
  mostrarFormPublicacion,
} from "../controllers/publicacion.controller.js";
import { mostrarHome } from "../controllers/usuario.controller.js";

const usuario = Router();

usuario.use(isAuthenticated);

usuario.get("/home", mostrarHome);

usuario.get("/publicaciones/crear", mostrarFormPublicacion);

usuario.post("/publicaciones/crear", crearPublicacion);

export default usuario;
