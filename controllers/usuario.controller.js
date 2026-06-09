import { Op } from "sequelize";
import { Publicacion } from "../models/publicacion.js";
import { Imagen } from "../models/imagen.js";
import { Usuario } from "../models/usuario.js";
import { Seguimiento } from "../models/seguimiento.js";
import { Valoracion } from "../models/valoracion.js";
import sharp from "sharp";
import blobABase64 from "../helpers/blobAbase64.js";

// Helper: mapea publicaciones de BD agregando imagenBase64 y promedioValoraciones
function mapearPublicaciones(pubs) {
  return pubs.map((pub) => {
    const img = pub.imagenes?.[0];

    let sumaValoraciones = 0;
    let totalValoraciones = 0;

    pub.imagenes?.forEach((imagen) => {
      (imagen.Valoracions || []).forEach((v) => {
        sumaValoraciones += v.puntaje;
        totalValoraciones++;
      });
    });

    const promedioValoraciones =
      totalValoraciones > 0 ? sumaValoraciones / totalValoraciones : 0;

    return {
      ...pub.toJSON(),
      imagenBase64: img?.url ? blobABase64(img.url) : null,
      promedioValoraciones,
    };
  });
}

export async function mostrarHome(req, res) {
  try {
    const feed = req.query.feed; // "siguiendo" o undefined (para ti)
    const usuarioId = req.session.usuario.id;

    let publicaciones = [];
    let sinSeguidos = false;

    if (feed === "siguiendo") {
      // Feed de usuarios seguidos
      const seguidos = await Seguimiento.findAll({
        where: { idSeguidor: usuarioId },
        attributes: ["idSeguido"],
      });

      const idsSeguidos = seguidos.map((s) => s.idSeguido);

      if (idsSeguidos.length === 0) {
        sinSeguidos = true;
      } else {
        const pubs = await Publicacion.findAll({
          where: { UsuarioId: idsSeguidos },
          include: [
            { model: Usuario },
            { model: Imagen, as: "imagenes", include: [Valoracion] },
          ],
          order: [["createdAt", "DESC"]],
        });
        publicaciones = mapearPublicaciones(pubs);
      }
    } else {
      // Feed general — para ti
      const pubs = await Publicacion.findAll({
        include: [
          { model: Imagen, as: "imagenes", include: [Valoracion] },
        ],
        order: [["createdAt", "DESC"]],
      });
      publicaciones = mapearPublicaciones(pubs);
    }

    res.render("usuario/home", {
      title: "Inicio",
      publicaciones,
      activoTab: feed === "siguiendo" ? "siguiendo" : "todos",
      sinSeguidos,
    });
  } catch (error) {
    console.error("Error cargando home:", error);
    res.send("Error: " + error.message);
  }
}

export async function renderPerfil(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.session.usuario.id);

    const publicacionesBD = await Publicacion.findAll({
      where: { UsuarioId: usuario.id },
      include: [{ model: Imagen, as: "imagenes", include: [Valoracion] }],
      order: [["createdAt", "DESC"]],
    });

    const publicaciones = mapearPublicaciones(publicacionesBD);

    const cantidadSeguidores = await Seguimiento.count({
      where: { idSeguido: usuario.id },
    });

    const cantidadSeguidos = await Seguimiento.count({
      where: { idSeguidor: usuario.id },
    });

    res.render("usuario/perfil", {
      title: usuario.username,
      perfilUsuario: {
        ...usuario.toJSON(),
        avatar: blobABase64(usuario.avatar),
      },
      publicaciones,
      esMiPerfil: true,
      siguiendo: false,
      cantidadPublicaciones: publicaciones.length,
      cantidadSeguidores,
      cantidadSeguidos,
    });
  } catch (error) {
    console.error(error);
    res.send("Error al mostrar perfil");
  }
}

export async function seguirUsuario(req, res) {
  try {
    const idSeguidor = req.session.usuario.id;
    const idSeguido = req.params.id;

    if (idSeguidor == idSeguido) {
      return res.redirect(`/usuario/perfil/${req.params.id}`);
    }

    const seguimiento = await Seguimiento.findOne({
      where: { idSeguidor, idSeguido },
      paranoid: false,
    });

    if (!seguimiento) {
      await Seguimiento.create({ idSeguidor, idSeguido });
    } else if (seguimiento.deletedAt) {
      await seguimiento.restore();
    }

    return res.redirect(`/usuario/perfil/${req.params.id}`);
  } catch (error) {
    console.error(error);
  }
}

export async function dejarDeSeguir(req, res) {
  try {
    await Seguimiento.destroy({
      where: {
        idSeguidor: req.session.usuario.id,
        idSeguido: req.params.id,
      },
    });

    return res.redirect(`/usuario/perfil/${req.params.id}`);
  } catch (error) {
    console.error(error);
  }
}

export async function renderPerfilUsuario(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) {
      return res.redirect("/usuario/home");
    }

    const publicacionesBD = await Publicacion.findAll({
      where: { UsuarioId: usuario.id },
      include: [{ model: Imagen, as: "imagenes", include: [Valoracion] }],
      order: [["createdAt", "DESC"]],
    });

    const publicaciones = mapearPublicaciones(publicacionesBD);

    const siguiendo = await Seguimiento.findOne({
      where: {
        idSeguidor: req.session.usuario.id,
        idSeguido: usuario.id,
      },
    });

    const cantidadSeguidores = await Seguimiento.count({
      where: { idSeguido: usuario.id },
    });

    const cantidadSeguidos = await Seguimiento.count({
      where: { idSeguidor: usuario.id },
    });

    res.render("usuario/perfil", {
      title: usuario.username,
      perfilUsuario: {
        ...usuario.toJSON(),
        avatar: blobABase64(usuario.avatar),
      },
      publicaciones,
      esMiPerfil: false,
      siguiendo: !!siguiendo,
      cantidadPublicaciones: publicaciones.length,
      cantidadSeguidores,
      cantidadSeguidos,
    });
  } catch (error) {
    console.error(error);
    res.send("Error al mostrar perfil");
  }
}

export async function mostrarEditarPerfil(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.session.usuario.id);

    res.render("usuario/editarPerfil", {
      title: "Editar Perfil",
      perfilUsuario: {
        ...usuario.toJSON(),
        avatar: blobABase64(usuario.avatar),
      },
    });
  } catch (error) {
    console.error(error);
    res.send("Error al cargar perfil");
  }
}

export async function actualizarPerfil(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.session.usuario.id);

    if (!usuario) {
      return res.redirect("/usuario/home");
    }

    // Helper para volver al form con errores, siempre con perfilUsuario disponible
    const volverAlForm = (errores) =>
      res.status(400).render("usuario/editarPerfil", {
        title: "Editar Perfil",
        errores,
        formValues: req.body,
        perfilUsuario: {
          ...usuario.toJSON(),
          avatar: blobABase64(usuario.avatar),
        },
      });

    // Validar con Zod
    const { editarPerfilSchema } = await import("../schemas/validaciones.js");
    const resultado = editarPerfilSchema.safeParse(req.body);

    if (!resultado.success) {
      const { formatearErrores } = await import("../schemas/validaciones.js");
      return volverAlForm(formatearErrores(resultado.error));
    }

    const { name, lastName, username, email, bio } = resultado.data;
    const { eliminarAvatar } = req.body;

    // Verificar unicidad de username y email
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

    if (eliminarAvatar === "true") {
      usuario.avatar = null;
    }

    if (req.file) {
      usuario.avatar = await sharp(req.file.buffer)
        .resize(512, 512, { fit: "cover" })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    await usuario.save();

    req.session.usuario.username = usuario.username;
    req.session.usuario.name = usuario.name;
    req.session.usuario.avatar = blobABase64(usuario.avatar);

    return res.redirect("/usuario/perfil");
  } catch (error) {
    console.error(error);
    res.send("Error al actualizar perfil");
  }
}

export async function mostrarSiguiendo(req, res) {
  try {
    const usuarioId = req.session.usuario.id;

    const seguidos = await Seguimiento.findAll({
      where: { idSeguidor: usuarioId },
      attributes: ["idSeguido"],
    });

    const idsSeguidos = seguidos.map((s) => s.idSeguido);

    let publicaciones = [];

    if (idsSeguidos.length > 0) {
      const pubs = await Publicacion.findAll({
        where: { UsuarioId: idsSeguidos },
        include: [
          { model: Usuario },
          { model: Imagen, as: "imagenes", include: [Valoracion] },
        ],
        order: [["createdAt", "DESC"]],
      });

      publicaciones = mapearPublicaciones(pubs);
    }

    res.render("usuario/siguiendo", {
      title: "Publicaciones de usuarios que sigo",
      publicaciones,
      sinSeguidos: idsSeguidos.length === 0,
    });
  } catch (error) {
    console.error(error);
    res.send("Error al cargar publicaciones de seguidos");
  }
}
