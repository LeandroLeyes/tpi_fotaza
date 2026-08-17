import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  mostrarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
} from "../controllers/notificacion.controller.js";

const notificacion = Router();

notificacion.use(isAuthenticated);

notificacion.get("/", mostrarNotificaciones);
notificacion.post("/:id/leida", marcarNotificacionLeida);
notificacion.post("/marcar-todas-leidas", marcarTodasLeidas);

export default notificacion;
