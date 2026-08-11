import { Notificacion } from "../models/notificacion.js";
import { Usuario } from "../models/usuario.js";

export async function mostrarNotificaciones(req, res) {
  try {
    const idUsuario = req.session.usuario.id;

    const notificaciones = await Notificacion.findAll({
      where: {
        idUsuarioDestino: idUsuario,
      },
      include: [
        {
          model: Usuario,
          as: "origen",
          attributes: ["id", "username", "avatar"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.render("usuario/notificaciones", {
      title: "Notificaciones",
      notificaciones,
    });
  } catch (error) {
    console.error("Error al cargar notificaciones:", error);
    res.send("Error al cargar las notificaciones");
  }
}

export async function marcarNotificacionLeida(req, res) {
  try {
    const idUsuario = req.session.usuario.id;
    const idNotificacion = req.params.id;

    await Notificacion.update(
      {
        leida: true,
      },
      {
        where: {
          id: idNotificacion,
          idUsuarioDestino: idUsuario,
        },
      },
    );

    return res.redirect("/usuario/notificaciones");
  } catch (error) {
    console.error("Error al marcar notificación:", error);
    res.redirect("/usuario/notificaciones");
  }
}

export async function marcarTodasLeidas(req, res) {
  try {
    const idUsuario = req.session.usuario.id;

    await Notificacion.update(
      {
        leida: true,
      },
      {
        where: {
          idUsuarioDestino: idUsuario,
          leida: false,
        },
      },
    );

    return res.redirect("/usuario/notificaciones");
  } catch (error) {
    console.error("Error al marcar todas las notificaciones:", error);
    res.redirect("/usuario/notificaciones");
  }
}
