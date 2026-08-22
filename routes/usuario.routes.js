import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isSoloUsuario } from "../middlewares/rol.middleware.js";
import {
  crearPublicacion,
  mostrarFormPublicacion,
  renderPublicacion,
  crearComentario,
  valorarImagen,
  cambiarEstadoComentarios,
  eliminarPublicacion,
  mostrarFormEditar,
  editarPublicacion,
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
import {
  validar,
  validarYRedirigir,
  validarConArchivos,
} from "../middlewares/validar.middleware.js";
import {
  publicacionSchema,
  comentarioSchema,
} from "../schemas/validaciones.js";
import {
  mostrarColecciones,
  verColeccion,
  crearColeccion,
  eliminarColeccion,
  agregarAColeccion,
  quitarDeColeccion,
  obtenerColeccionesUsuario,
} from "../controllers/coleccion.controller.js";

import {
  mostrarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  verNotificacion,
} from "../controllers/notificacion.controller.js";

const usuario = Router();

usuario.use(isAuthenticated);
usuario.use(isSoloUsuario);

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
  validarConArchivos(
    publicacionSchema,
    "usuario/publicaciones/crearPublicacion",
  ),
  crearPublicacion,
);
usuario.get("/publicaciones/:id", renderPublicacion);
usuario.post("/publicaciones/:id/comentarios", cambiarEstadoComentarios);
usuario.post("/publicaciones/:id/eliminar", eliminarPublicacion);
usuario.get("/publicaciones/:id/editar", mostrarFormEditar);
usuario.post(
  "/publicaciones/:id/editar",
  upload.array("imagenes", 10),
  editarPublicacion,
);

// Comentarios
usuario.post(
  "/comentarios/:idImagen",
  validarYRedirigir(
    comentarioSchema,
    (req) => `/usuario/publicaciones/${req.body.publicacionId}`,
  ),
  crearComentario,
);

// Valoraciones
usuario.post("/valoraciones/:idImagen", valorarImagen);

// Notificaciones
usuario.get("/notificaciones", mostrarNotificaciones);
usuario.get("/notificaciones/:id/ver", verNotificacion);
usuario.post("/notificaciones/:id/leida", marcarNotificacionLeida);
usuario.post("/notificaciones/marcar-todas-leidas", marcarTodasLeidas);

// Colecciones
usuario.get("/colecciones", mostrarColecciones);
usuario.get("/colecciones/api", obtenerColeccionesUsuario);
usuario.post("/colecciones/crear", crearColeccion);
usuario.get("/colecciones/:id", verColeccion);
usuario.post("/colecciones/:id/eliminar", eliminarColeccion);
usuario.post("/colecciones/:id/quitar/:idPublicacion", quitarDeColeccion);
usuario.post("/publicaciones/:idPublicacion/guardar", agregarAColeccion);

export default usuario;
