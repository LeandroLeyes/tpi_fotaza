import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isValidador } from "../middlewares/rol.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import {
  mostrarHomeValidador,
  darDeBajaPublicacion,
  desestimarDenuncias,
  eliminarComentarioDenunciado,
  desestimarDenunciaComentario,
  mostrarPerfilValidador,
  mostrarEditarPerfilValidador,
  actualizarPerfilValidador,
} from "../controllers/validador.controller.js";

const validador = Router();

validador.use(isAuthenticated);
validador.use(isValidador);

// Panel principal
validador.get("/home", mostrarHomeValidador);

// Acciones sobre publicaciones denunciadas
validador.post("/publicacion/:id/baja", darDeBajaPublicacion);
validador.post("/publicacion/:id/desestimar", desestimarDenuncias);

// Acciones sobre comentarios denunciados
validador.post("/comentario/:idComentario/eliminar", eliminarComentarioDenunciado);
validador.post("/comentario/:idComentario/desestimar", desestimarDenunciaComentario);

// Perfil propio
validador.get("/perfil", mostrarPerfilValidador);
validador.get("/perfil/editar", mostrarEditarPerfilValidador);
validador.post("/perfil/editar", upload.single("avatar"), actualizarPerfilValidador);

export default validador;
