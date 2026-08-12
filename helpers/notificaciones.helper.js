import { Notificacion } from "../models/notificacion.js";

export default async function crearNotificacion(
  idUsuarioDestino,
  idUsuarioOrigen,
  tipo,
  mensaje,
  idReferencia = null,
) {
  if (idUsuarioDestino === idUsuarioOrigen) return;

  return await Notificacion.create({
    idUsuarioDestino,
    idUsuarioOrigen,
    tipo,
    mensaje,
    idReferencia,
  });
}
