import { Notificacion } from "../models/notificacion.js";
import { Usuario } from "../models/usuario.js";
import { Publicacion } from "../models/publicacion.js";
import blobABase64 from "../helpers/blobAbase64.js";

export async function mostrarNotificaciones(req, res) {
  try {
    const idUsuario = req.session.usuario.id;

    const notificaciones = await Notificacion.findAll({
      where: { idUsuarioDestino: idUsuario },
      include: [
        {
          model: Usuario,
          as: "origen",
          attributes: ["id", "username", "name", "lastName", "avatar"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const nots = notificaciones.map((n) => {
      const json = n.toJSON();
      if (json.origen?.avatar) {
        json.origen.avatar = blobABase64(json.origen.avatar);
      }
      return json;
    });

    const noLeidas = nots.filter((n) => !n.leida).length;

    res.render("usuario/notificaciones", {
      title: "Notificaciones",
      notificaciones: nots,
      noLeidas,
    });
  } catch (error) {
    console.error("Error al cargar notificaciones:", error);
    res.send("Error al cargar las notificaciones");
  }
}

export async function marcarNotificacionLeida(req, res) {
  try {
    await Notificacion.update(
      { leida: true },
      {
        where: {
          id: req.params.id,
          idUsuarioDestino: req.session.usuario.id,
        },
      },
    );
    return res.redirect("/usuario/notificaciones");
  } catch (error) {
    console.error("Error al marcar notificación:", error);
    res.redirect("/usuario/notificaciones");
  }
}

export async function verNotificacion(req, res) {
  try {
    const idUsuario = req.session.usuario.id;
    const idNotificacion = req.params.id;

    const notificacion = await Notificacion.findOne({
      where: {
        id: idNotificacion,
        idUsuarioDestino: idUsuario,
      },
    });

    if (!notificacion) {
      return res.redirect("/usuario/notificaciones");
    }

    await notificacion.update({
      leida: true,
    });

    const tiposNavegables = ["comentario", "valoracion", "interes"];

    if (
      tiposNavegables.includes(notificacion.tipo) &&
      notificacion.idReferencia
    ) {
      const publicacion = await Publicacion.findByPk(notificacion.idReferencia);

      if (publicacion) {
        return res.redirect(
          `/usuario/publicaciones/${notificacion.idReferencia}`,
        );
      }
    }

    return res.redirect("/usuario/notificaciones");
  } catch (error) {
    console.error("Error al abrir notificación:", error);
    return res.redirect("/usuario/notificaciones");
  }
}

export async function marcarTodasLeidas(req, res) {
  try {
    await Notificacion.update(
      { leida: true },
      {
        where: {
          idUsuarioDestino: req.session.usuario.id,
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

export async function limpiarNotificaciones(req, res) {
  try {
    await Notificacion.destroy({
      where: { idUsuarioDestino: req.session.usuario.id },
    });
    return res.redirect("/usuario/notificaciones");
  } catch (error) {
    console.error("Error al limpiar notificaciones:", error);
    res.redirect("/usuario/notificaciones");
  }
}
