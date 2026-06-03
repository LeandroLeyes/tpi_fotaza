import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  crearPublicacion,
  mostrarFormPublicacion,
  renderPublicacion,
  crearComentario,
  valorarImagen,
} from "../controllers/publicacion.controller.js";
import {
  mostrarHome,
  renderPerfil,
  dejarDeSeguir,
  seguirUsuario,
  renderPerfilUsuario,
} from "../controllers/usuario.controller.js";

const usuario = Router();

usuario.use(isAuthenticated);

// Home
usuario.get("/home", mostrarHome);

// Perfil
usuario.get("/perfil", renderPerfil);

usuario.post("/seguir/:id", seguirUsuario);

usuario.post("/dejar-seguir/:id", dejarDeSeguir);

usuario.get("/perfil/:id", renderPerfilUsuario);

// Publicaciones
usuario.get("/publicaciones/crear", mostrarFormPublicacion);

usuario.post("/publicaciones/crear", crearPublicacion);

usuario.get("/publicaciones/:id", renderPublicacion);

// Comentarios
usuario.post("/comentarios/:idImagen", crearComentario);

// Valoraciones
usuario.post("/valoraciones/:idImagen", valorarImagen);

export default usuario;
