import { Publicacion } from "../models/publicacion.js";
import { Imagen } from "../models/imagen.js";
import { Usuario } from "../models/usuario.js";
import { Seguimiento } from "../models/seguimiento.js";
import { Valoracion } from "../models/valoracion.js";

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

    const publicaciones = pubs.map((pub) => {
      const img = pub.imagenes?.[0];

      let sumaValoraciones = 0;
      let totalValoraciones = 0;

      pub.imagenes.forEach((imagen) => {
        const valoraciones = imagen.Valoracions || [];

        valoraciones.forEach((valoracion) => {
          sumaValoraciones += valoracion.puntaje;
          totalValoraciones++;
        });
      });

      const promedioValoraciones =
        totalValoraciones > 0 ? sumaValoraciones / totalValoraciones : 0;

      return {
        ...pub.toJSON(),
        imagenBase64: img?.url
          ? `data:image/jpeg;base64,${Buffer.from(img.url).toString("base64")}`
          : null,
        tieneCopyright: img?.copyright,
        promedioValoraciones,
      };
    });

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
    const usuarioPerfil = await Usuario.findByPk(req.session.usuario.id);

    const publicacionesBD = await Publicacion.findAll({
      where: {
        UsuarioId: usuarioPerfil.id,
      },
      include: [
        {
          model: Imagen,
          as: "imagenes",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const publicaciones = publicacionesBD.map((pub) => {
      const imagen = pub.imagenes?.[0];

      return {
        ...pub.toJSON(),

        imagenBase64: imagen
          ? `data:image/jpeg;base64,${Buffer.from(imagen.url).toString("base64")}`
          : null,

        promedioValoraciones: 0,
        cantidadComentarios: 0,
      };
    });

    const cantidadSeguidores = await Seguimiento.count({
      where: {
        idSeguido: usuarioPerfil.id,
      },
    });

    const cantidadSeguidos = await Seguimiento.count({
      where: {
        idSeguidor: usuarioPerfil.id,
      },
    });

    res.render("usuario/perfil", {
      title: usuarioPerfil.username,
      usuarioPerfil,
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
      where: {
        idSeguidor,
        idSeguido,
      },
      paranoid: false,
    });

    if (!seguimiento) {
      await Seguimiento.create({
        idSeguidor,
        idSeguido,
      });
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
    const usuarioPerfil = await Usuario.findByPk(req.params.id);

    if (!usuarioPerfil) {
      return res.redirect("/usuario/home");
    }

    const publicacionesBD = await Publicacion.findAll({
      where: {
        UsuarioId: usuarioPerfil.id,
      },
      include: [
        {
          model: Imagen,
          as: "imagenes",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const publicaciones = publicacionesBD.map((pub) => {
      const imagen = pub.imagenes?.[0];

      return {
        ...pub.toJSON(),
        imagenBase64: imagen
          ? `data:image/jpeg;base64,${Buffer.from(imagen.url).toString("base64")}`
          : null,

        promedioValoraciones: 0,
        cantidadComentarios: 0,
      };
    });

    const siguiendo = await Seguimiento.findOne({
      where: {
        idSeguidor: req.session.usuario.id,
        idSeguido: usuarioPerfil.id,
      },
    });

    const cantidadSeguidores = await Seguimiento.count({
      where: {
        idSeguido: usuarioPerfil.id,
      },
    });

    const cantidadSeguidos = await Seguimiento.count({
      where: {
        idSeguidor: usuarioPerfil.id,
      },
    });

    res.render("usuario/perfil", {
      title: usuarioPerfil.username,
      usuarioPerfil,
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
