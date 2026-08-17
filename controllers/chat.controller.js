import { Interes } from "../models/interes.js";
import { Chat } from "../models/chat.js";
import { Mensaje } from "../models/mensaje.js";
import { Imagen } from "../models/imagen.js";
import { Publicacion } from "../models/publicacion.js";
import { Usuario } from "../models/usuario.js";
import { Op } from "sequelize";
import blobABase64 from "../helpers/blobAbase64.js";
import crearNotificacion from "../helpers/notificaciones.helper.js";

export async function marcarInteres(req, res) {
  try {
    const idImagen = req.params.idImagen;
    const idUsuario = req.session.usuario.id;

    const imagen = await Imagen.findByPk(idImagen, {
      include: [{ model: Publicacion }],
    });

    if (!imagen) return res.redirect("/usuario/home");

    const idAutor = imagen.Publicacion.idUsuario;

    if (idUsuario === idAutor) {
      return res.redirect(`/usuario/publicaciones/${imagen.idPublicacion}`);
    }

    const interesExistente = await Interes.findOne({
      where: { idUsuario, idImagen },
    });

    if (interesExistente) {
      const chat = await Chat.findOne({
        where: { idInteres: interesExistente.id },
      });
      if (chat) return res.redirect(`/usuario/chat/${chat.id}`);
      return res.redirect(`/usuario/publicaciones/${imagen.idPublicacion}`);
    }

    const interes = await Interes.create({ idUsuario, idImagen });

    const chat = await Chat.create({
      idInteres: interes.id,
      idEmisor: idUsuario,
      idDestino: idAutor,
    });

    await crearNotificacion(
      idAutor,
      idUsuario,
      "interes",
      `${req.session.usuario.username} está interesado en una de tus imágenes`,
      imagen.idPublicacion,
    );

    return res.redirect(`/usuario/chat/${chat.id}`);
  } catch (error) {
    console.error("Error al marcar interés:", error);
    res.redirect("/usuario/home");
  }
}

export async function listarChats(req, res) {
  try {
    const idUsuario = req.session.usuario.id;

    const chats = await Chat.findAll({
      where: {
        [Op.or]: [{ idEmisor: idUsuario }, { idDestino: idUsuario }],
      },
      include: [
        { model: Usuario, as: "emisor" },
        { model: Usuario, as: "destino" },
        {
          model: Interes,
          include: [{ model: Imagen }],
        },
        {
          model: Mensaje,
          order: [["createdAt", "DESC"]],
          limit: 1,
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    const chatsFormateados = chats.map((c) => {
      const json = c.toJSON();
      const esEmisor = json.idEmisor === idUsuario;
      const otroUsuario = esEmisor ? json.destino : json.emisor;
      if (otroUsuario?.avatar)
        otroUsuario.avatar = blobABase64(otroUsuario.avatar);
      const imagenInteres = json.Interes?.Imagen;
      return {
        ...json,
        otroUsuario,
        thumbnailImagen: imagenInteres?.url
          ? blobABase64(imagenInteres.url)
          : null,
        ultimoMensaje: json.Mensajes?.[0] || null,
      };
    });

    res.render("usuario/chat/lista", {
      title: "Mensajes",
      chats: chatsFormateados,
    });
  } catch (error) {
    console.error("Error al listar chats:", error);
    res.redirect("/usuario/home");
  }
}

export async function verChat(req, res) {
  try {
    const idUsuario = req.session.usuario.id;

    const chat = await Chat.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: "emisor" },
        { model: Usuario, as: "destino" },
        {
          model: Interes,
          include: [
            {
              model: Imagen,
              include: [{ model: Publicacion }],
            },
          ],
        },
        {
          model: Mensaje,
          include: [{ model: Usuario }],
          order: [["createdAt", "ASC"]],
        },
      ],
    });

    if (!chat) return res.redirect("/usuario/chat");

    if (chat.idEmisor !== idUsuario && chat.idDestino !== idUsuario) {
      return res.redirect("/usuario/chat");
    }

    const json = chat.toJSON();

    if (json.emisor?.avatar)
      json.emisor.avatar = blobABase64(json.emisor.avatar);
    if (json.destino?.avatar)
      json.destino.avatar = blobABase64(json.destino.avatar);

    json.Mensajes = json.Mensajes.map((m) => ({
      ...m,
      esMio: m.idUsuario === idUsuario,
      Usuario: {
        ...m.Usuario,
        avatar: m.Usuario?.avatar ? blobABase64(m.Usuario.avatar) : null,
      },
    }));

    if (json.Interes?.Imagen?.url) {
      json.Interes.Imagen.imagenBase64 = blobABase64(json.Interes.Imagen.url);
    }

    const otroUsuario =
      json.idEmisor === idUsuario ? json.destino : json.emisor;

    res.render("usuario/chat/ver", {
      title: `Chat con ${otroUsuario.username}`,
      chat: json,
      otroUsuario,
      idUsuario,
    });
  } catch (error) {
    console.error("Error al ver chat:", error);
    res.redirect("/usuario/chat");
  }
}

export async function enviarMensaje(req, res) {
  try {
    const idUsuario = req.session.usuario.id;
    const { contenido } = req.body;

    if (!contenido?.trim()) {
      return res.redirect(`/usuario/chat/${req.params.id}`);
    }

    const chat = await Chat.findByPk(req.params.id);

    if (!chat) return res.redirect("/usuario/chat");

    if (chat.idEmisor !== idUsuario && chat.idDestino !== idUsuario) {
      return res.redirect("/usuario/chat");
    }

    await Mensaje.create({
      contenido: contenido.trim(),
      idChat: chat.id,
      idUsuario,
    });

    await chat.changed("updatedAt", true);
    await chat.save();

    return res.redirect(`/usuario/chat/${chat.id}`);
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    res.redirect(`/usuario/chat/${req.params.id}`);
  }
}
