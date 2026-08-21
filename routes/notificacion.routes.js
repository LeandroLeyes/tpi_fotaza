import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  mostrarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  limpiarNotificaciones,
} from "../controllers/notificacion.controller.js";

const notificacion = Router();

notificacion.use(isAuthenticated);

notificacion.get("/", mostrarNotificaciones);
notificacion.post("/:id/leida", marcarNotificacionLeida);
notificacion.post("/marcar-todas-leidas", marcarTodasLeidas);
notificacion.post("/limpiar", limpiarNotificaciones);

export default notificacion;
