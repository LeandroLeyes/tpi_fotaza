import { Notificacion } from "../models/notificacion.js";

export async function sesionData(req, res, next) {
  res.locals.hayNotificacionesNoLeidas = false;

  if (req.session.usuario) {
    try {
      const notificacion = await Notificacion.findOne({
        where: {
          idUsuarioDestino: req.session.usuario.id,
          leida: false,
        },
      });

      res.locals.hayNotificacionesNoLeidas = !!notificacion;
    } catch (error) {
      console.error("Error al comprobar notificaciones:", error);
    }
  }

  res.locals.usuario = req.session.usuario;

  res.locals.isActive = (ruta) => {
    return req.path.startsWith(ruta);
  };

  res.locals.esValidador =
    req.session.usuario?.rol === "validador" ||
    req.session.usuario?.rol === "admin";

  res.locals.esAdmin = req.session.usuario?.rol === "admin";

  next();
}
