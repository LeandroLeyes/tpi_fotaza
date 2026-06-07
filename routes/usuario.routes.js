import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  crearPublicacion,
  mostrarFormPublicacion,
  renderPublicacion,
  crearComentario,
  valorarImagen,
  cambiarEstadoComentarios,
} from "../controllers/publicacion.controller.js";
import {
  mostrarHome,
  renderPerfil,
  dejarDeSeguir,
  seguirUsuario,
  renderPerfilUsuario,
  mostrarEditarPerfil,
  actualizarPerfil,
  mostrarSiguiendo,
} from "../controllers/usuario.controller.js";
import upload from "../middlewares/upload.middleware.js";

const usuario = Router();

usuario.use(isAuthenticated);

// Home
usuario.get("/home", mostrarHome);

// Siguiendo
usuario.get("/siguiendo", mostrarSiguiendo);

// Perfil
usuario.get("/perfil", renderPerfil);

usuario.get("/perfil/editar", mostrarEditarPerfil);

usuario.post("/perfil/editar", upload.single("avatar"), actualizarPerfil);

usuario.post("/seguir/:id", seguirUsuario);

usuario.post("/dejar-seguir/:id", dejarDeSeguir);

usuario.get("/perfil/:id", renderPerfilUsuario);

// Publicaciones
usuario.get("/publicaciones/crear", mostrarFormPublicacion);

usuario.post(
  "/publicaciones/crear",
  upload.array("imagenes", 10),
  crearPublicacion,
);

usuario.get("/publicaciones/:id", renderPublicacion);

usuario.post("/publicaciones/:id/comentarios", cambiarEstadoComentarios);

// Comentarios
usuario.post("/comentarios/:idImagen", crearComentario);

// Valoraciones
usuario.post("/valoraciones/:idImagen", valorarImagen);

export default usuario;
