import { Op } from "sequelize";

import { Usuario } from "../models/usuario.js";
import { Etiqueta } from "../models/etiqueta.js";
import { Publicacion } from "../models/publicacion.js";
import { Imagen } from "../models/imagen.js";
import { Comentario } from "../models/comentario.js";
import { Valoracion } from "../models/valoracion.js";

export async function buscarContenido(req, res) {
  try {
    const termino = req.query.q?.trim();

    const filtro = req.query.filtro || "todo";

    if (!termino) {
      return res.redirect("/usuario/home");
    }

    const usuarios = await Usuario.findAll({
      where: {
        username: {
          [Op.iLike]: `%${termino}%`,
        },
      },
    });

    const etiquetas = await Etiqueta.findAll({
      where: {
        nombre: {
          [Op.iLike]: `%${termino}%`,
        },
      },
    });

    const publicacionesDB = await Publicacion.findAll({
      include: [
        Usuario,
        Etiqueta,
        {
          model: Imagen,
          as: "imagenes",
          include: [Comentario, Valoracion],
        },
      ],

      where: {
        [Op.or]: [
          {
            titulo: {
              [Op.iLike]: `%${termino}%`,
            },
          },

          {
            "$Etiqueta.nombre$": {
              [Op.iLike]: `%${termino}%`,
            },
          },

          {
            "$Usuario.username$": {
              [Op.iLike]: `%${termino}%`,
            },
          },
        ],
      },

      distinct: true,
    });

    const publicaciones = publicacionesDB.map((publicacion) => {
      const pub = publicacion.toJSON();

      const imagen = pub.imagenes[0];

      const promedioValoraciones =
        imagen?.Valoracions?.length > 0
          ? (
              imagen.Valoracions.reduce(
                (total, valoracion) => total + valoracion.puntaje,
                0,
              ) / imagen.Valoracions.length
            ).toFixed(1)
          : 0;

      const cantidadComentarios = imagen?.Comentarios?.length || 0;

      return {
        ...pub,

        imagenBase64: imagen
          ? `data:image/jpeg;base64,${Buffer.from(imagen.url).toString(
              "base64",
            )}`
          : null,

        promedioValoraciones,
        cantidadComentarios,
      };
    });

    const sinResultados =
      usuarios.length === 0 &&
      etiquetas.length === 0 &&
      publicaciones.length === 0;

    res.render("usuario/busqueda", {
      title: `Resultados para ${termino}`,
      termino,
      filtro,
      usuarios,
      etiquetas,
      publicaciones,
      sinResultados,
    });
  } catch (error) {
    console.error(error);
    res.send("Error al realizar búsqueda");
  }
}
