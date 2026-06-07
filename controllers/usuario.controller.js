import { Op } from "sequelize";
import { Publicacion } from "../models/publicacion.js";
import { Imagen } from "../models/imagen.js";
import { Usuario } from "../models/usuario.js";
import { Seguimiento } from "../models/seguimiento.js";
import { Valoracion } from "../models/valoracion.js";
import sharp from "sharp";

// Helper: convierte BLOB de avatar a string base64 listo para src=""
function avatarABase64(blob) {
  if (!blob) return null;
  return `data:image/jpeg;base64,${Buffer.from(blob).toString("base64")}`;
}

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
      imagenBase64: img?.url ? avatarABase64(img.url) : null,
      promedioValoraciones,
    };
  });
}

export async function mostrarHome(req, res) {
  try {
    const pubs = await Publicacion.findAll({
      include: [
        {
          model: Imagen,
          as: "imagenes",
          include: [Valoracion],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const publicaciones = mapearPublicaciones(pubs);

    res.render("usuario/home", {
      title: "Inicio",
      publicaciones,
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
      usuario: {
        ...usuario.toJSON(),
        avatar: avatarABase64(usuario.avatar),
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
      usuario: {
        ...usuario.toJSON(),
        avatar: avatarABase64(usuario.avatar),
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
      usuario: {
        ...usuario.toJSON(),
        avatar: avatarABase64(usuario.avatar),
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

    const { name, lastName, username, email, bio, eliminarAvatar } = req.body;

    const usernameExistente = await Usuario.findOne({ where: { username } });
    if (usernameExistente && usernameExistente.id !== usuario.id) {
      return res.send("El nombre de usuario ya existe");
    }

    const emailExistente = await Usuario.findOne({ where: { email } });
    if (emailExistente && emailExistente.id !== usuario.id) {
      return res.send("El email ya existe");
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

    // Actualizar sesión con los nuevos datos
    req.session.usuario.username = usuario.username;
    req.session.usuario.avatar = avatarABase64(usuario.avatar);

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
