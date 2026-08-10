import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  mostrarFormDenunciarPublicacion,
  crearDenunciaPublicacion,
  mostrarFormDenunciarComentario,
  crearDenunciaComentario,
} from "../controllers/denuncia.controller.js";

const denuncia = Router();

denuncia.use(isAuthenticated);

// Denuncias de publicaciones
denuncia.get("/publicacion/:id", mostrarFormDenunciarPublicacion);
denuncia.post("/publicacion/:id", crearDenunciaPublicacion);

// Denuncias de comentarios
denuncia.get("/comentario/:idComentario", mostrarFormDenunciarComentario);
denuncia.post("/comentario/:idComentario", crearDenunciaComentario);

export default denuncia;
