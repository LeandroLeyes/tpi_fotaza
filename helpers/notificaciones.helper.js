import { Notificacion } from "../models/notificacion.js";

export default async function crearNotificacion(
  idUsuarioDestino,
  idUsuarioOrigen,
  tipo,
  mensaje,
) {
  return await Notificacion.create({
    idUsuarioDestino,
    idUsuarioOrigen,
    tipo,
    mensaje,
  });
}
