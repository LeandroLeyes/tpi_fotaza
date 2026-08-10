import { Denuncia } from "../models/denuncia.js";
import { Publicacion } from "../models/publicacion.js";
import { Comentario } from "../models/comentario.js";
import { Imagen } from "../models/imagen.js";
import { Usuario } from "../models/usuario.js";
import { Etiqueta } from "../models/etiqueta.js";
import { Op } from "sequelize";
import sharp from "sharp";
import blobABase64 from "../helpers/blobAbase64.js";

export async function mostrarHomeValidador(req, res) {
  try {
    const denunciasPublicaciones = await Denuncia.findAll({
      where: { tipo: "publicacion", idValidador: null },
      include: [
        {
          model: Publicacion,
          include: [
            { model: Usuario },
            { model: Imagen, as: "imagenes" },
          ],
        },
        { model: Usuario, as: "denunciante" },
      ],
    });

    const publicacionesMap = new Map();
    for (const denuncia of denunciasPublicaciones) {
      if (!denuncia.Publicacion) continue;
      const id = denuncia.idPublicacion;
      if (!publicacionesMap.has(id)) {
        // Convertir imagenes a base64 para el modal
        const pub = denuncia.Publicacion.toJSON();
        pub.imagenes = (pub.imagenes || []).map((img) => ({
          ...img,
          imagenBase64: blobABase64(img.url),
        }));
        pub.Usuario = {
          ...pub.Usuario,
          avatar: blobABase64(pub.Usuario?.avatar),
        };
        publicacionesMap.set(id, { publicacion: pub, denuncias: [] });
      }
      publicacionesMap.get(id).denuncias.push(denuncia);
    }

    // Cambiar >= 3 antes de entregar (>= 1 para pruebas)
    const publicacionesPendientes = [...publicacionesMap.values()].filter(
      ({ denuncias }) => {
        const usuariosUnicos = new Set(denuncias.map((d) => d.idUsuario));
        return usuariosUnicos.size >= 1;
      },
    );

    const denunciasComentarios = await Denuncia.findAll({
      where: { tipo: "comentario", idValidador: null },
      include: [
        {
          model: Comentario,
          include: [{ model: Usuario }, { model: Imagen }],
        },
        { model: Usuario, as: "denunciante" },
      ],
    });

    res.render("validador/home", {
      title: "Panel del Validador",
      publicacionesPendientes,
      denunciasComentarios,
    });
  } catch (error) {
    console.error("Error en panel validador:", error);
    res.redirect("/validador/home");
  }
}

export async function darDeBajaPublicacion(req, res) {
  try {
    const publicacion = await Publicacion.findByPk(req.params.id);

    if (!publicacion) return res.redirect("/validador/home");

    // Marcar denuncias como resueltas
    await Denuncia.update(
      { idValidador: req.session.usuario.id },
      { where: { idPublicacion: publicacion.id, tipo: "publicacion" } },
    );

    await publicacion.destroy();

    // Contar publicaciones bajadas del autor (soft deleted)
    const publicacionesBajadas = await Publicacion.count({
      where: {
        idUsuario: publicacion.idUsuario,
        deletedAt: { [Op.ne]: null },
      },
      paranoid: false,
    });

    // Bloquear cuenta si llega a 3 publicaciones bajadas
    if (publicacionesBajadas >= 3) {
      await Usuario.update(
        { activo: false },
        { where: { id: publicacion.idUsuario } },
      );
    }

    return res.redirect("/validador/home");
  } catch (error) {
    console.error("Error al dar de baja publicación:", error);
    res.redirect("/validador/home");
  }
}

export async function desestimarDenuncias(req, res) {
  try {
    await Denuncia.update(
      { idValidador: req.session.usuario.id },
      {
        where: {
          idPublicacion: req.params.id,
          tipo: "publicacion",
          idValidador: null,
        },
      },
    );
    return res.redirect("/validador/home");
  } catch (error) {
    console.error("Error al desestimar denuncias:", error);
    res.redirect("/validador/home");
  }
}

export async function eliminarComentarioDenunciado(req, res) {
  try {
    const comentario = await Comentario.findByPk(req.params.idComentario, {
      include: [{ model: Imagen }],
    });

    if (!comentario) return res.redirect("/validador/home");

    await Denuncia.update(
      { idValidador: req.session.usuario.id },
      { where: { idComentario: comentario.id, tipo: "comentario" } },
    );

    await comentario.destroy();

    return res.redirect("/validador/home");
  } catch (error) {
    console.error("Error al eliminar comentario denunciado:", error);
    res.redirect("/validador/home");
  }
}

export async function desestimarDenunciaComentario(req, res) {
  try {
    await Denuncia.update(
      { idValidador: req.session.usuario.id },
      {
        where: {
          idComentario: req.params.idComentario,
          tipo: "comentario",
          idValidador: null,
        },
      },
    );
    return res.redirect("/validador/home");
  } catch (error) {
    console.error("Error al desestimar denuncia de comentario:", error);
    res.redirect("/validador/home");
  }
}

export async function bloquearUsuario(req, res) {
  try {
    await Usuario.update(
      { activo: false },
      { where: { id: req.params.id } },
    );
    return res.redirect("/validador/home");
  } catch (error) {
    console.error("Error al bloquear usuario:", error);
    res.redirect("/validador/home");
  }
}

// ─────────────────────────────────────────────
// PERFIL DEL VALIDADOR
// ─────────────────────────────────────────────

export async function mostrarPerfilValidador(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.session.usuario.id);
    res.render("validador/perfil", {
      title: "Mi perfil",
      usuario: {
        ...usuario.toJSON(),
        avatar: blobABase64(usuario.avatar),
      },
    });
  } catch (error) {
    console.error(error);
    res.redirect("/validador/home");
  }
}

export async function mostrarEditarPerfilValidador(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.session.usuario.id);
    res.render("validador/editarPerfil", {
      title: "Editar perfil",
      perfilUsuario: {
        ...usuario.toJSON(),
        avatar: blobABase64(usuario.avatar),
      },
    });
  } catch (error) {
    console.error(error);
    res.redirect("/validador/perfil");
  }
}

export async function actualizarPerfilValidador(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.session.usuario.id);

    if (!usuario) return res.redirect("/validador/home");

    const volverAlForm = (errores) =>
      res.status(400).render("validador/editarPerfil", {
        title: "Editar perfil",
        errores,
        formValues: req.body,
        perfilUsuario: {
          ...usuario.toJSON(),
          avatar: blobABase64(usuario.avatar),
        },
      });

    const { editarPerfilSchema, formatearErrores } =
      await import("../schemas/validaciones.js");
    const resultado = editarPerfilSchema.safeParse(req.body);

    if (!resultado.success) {
      return volverAlForm(formatearErrores(resultado.error));
    }

    const { name, lastName, username, email, bio } = resultado.data;

    const [usernameExistente, emailExistente] = await Promise.all([
      Usuario.findOne({ where: { username } }),
      Usuario.findOne({ where: { email } }),
    ]);

    if (usernameExistente && usernameExistente.id !== usuario.id) {
      return volverAlForm({ username: "Ese nombre de usuario ya está en uso" });
    }
    if (emailExistente && emailExistente.id !== usuario.id) {
      return volverAlForm({ email: "Ese correo ya está registrado" });
    }

    usuario.name = name;
    usuario.lastName = lastName;
    usuario.username = username;
    usuario.email = email;
    usuario.bio = bio;

    if (req.body.eliminarAvatar === "true") usuario.avatar = null;

    if (req.file) {
      usuario.avatar = await sharp(req.file.buffer)
        .resize(512, 512, { fit: "cover" })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    await usuario.save();

    req.session.usuario.username = usuario.username;
    req.session.usuario.name = usuario.name;
    req.session.usuario.lastName = usuario.lastName;
    req.session.usuario.avatar = blobABase64(usuario.avatar);

    return res.redirect("/validador/perfil");
  } catch (error) {
    console.error(error);
    res.redirect("/validador/perfil");
  }
}
