import { Coleccion } from "../models/coleccion.js";
import { Publicacion } from "../models/publicacion.js";
import { Imagen } from "../models/imagen.js";
import { Valoracion } from "../models/valoracion.js";
import blobABase64 from "../helpers/blobAbase64.js";

export async function mostrarColecciones(req, res) {
  try {
    const colecciones = await Coleccion.findAll({
      where: { idUsuario: req.session.usuario.id },
      include: [
        {
          model: Publicacion,
          through: { attributes: [] },
          include: [{ model: Imagen, as: "imagenes" }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const cols = colecciones.map((c) => {
      const json = c.toJSON();
      const primeraImagen = json.Publicacions?.[0]?.imagenes?.[0];
      return {
        ...json,
        thumbnail: primeraImagen ? blobABase64(primeraImagen.url) : null,
        cantidadPublicaciones: json.Publicacions?.length || 0,
      };
    });

    res.render("usuario/colecciones/index", {
      title: "Mis colecciones",
      colecciones: cols,
    });
  } catch (error) {
    console.error("Error al cargar colecciones:", error);
    res.redirect("/usuario/home");
  }
}

export async function verColeccion(req, res) {
  try {
    const coleccion = await Coleccion.findOne({
      where: {
        id: req.params.id,
        idUsuario: req.session.usuario.id,
      },
      include: [
        {
          model: Publicacion,
          through: { attributes: [] },
          include: [{ model: Imagen, as: "imagenes", include: [Valoracion] }],
        },
      ],
    });

    if (!coleccion) return res.redirect("/usuario/colecciones");

    const json = coleccion.toJSON();

    const publicaciones = (json.Publicacions || []).map((pub) => {
      const img = pub.imagenes?.[0];
      let suma = 0,
        total = 0;
      pub.imagenes?.forEach((i) => {
        (i.Valoracions || []).forEach((v) => {
          suma += v.puntaje;
          total++;
        });
      });
      return {
        ...pub,
        imagenBase64: img?.url ? blobABase64(img.url) : null,
        promedioValoraciones: total > 0 ? (suma / total).toFixed(1) : 0,
      };
    });

    res.render("usuario/colecciones/ver", {
      title: coleccion.nombre,
      coleccion: json,
      publicaciones,
    });
  } catch (error) {
    console.error("Error al ver colección:", error);
    res.redirect("/usuario/colecciones");
  }
}

export async function crearColeccion(req, res) {
  try {
    const { nombre } = req.body;

    if (!nombre?.trim()) {
      return res.redirect("/usuario/colecciones");
    }

    await Coleccion.create({
      nombre: nombre.trim(),
      idUsuario: req.session.usuario.id,
    });

    return res.redirect("/usuario/colecciones");
  } catch (error) {
    console.error("Error al crear colección:", error);
    res.redirect("/usuario/colecciones");
  }
}

export async function eliminarColeccion(req, res) {
  try {
    await Coleccion.destroy({
      where: {
        id: req.params.id,
        idUsuario: req.session.usuario.id,
      },
    });

    return res.redirect("/usuario/colecciones");
  } catch (error) {
    console.error("Error al eliminar colección:", error);
    res.redirect("/usuario/colecciones");
  }
}

export async function agregarAColeccion(req, res) {
  try {
    const { idColeccion } = req.body;
    const idPublicacion = req.params.idPublicacion;

    const coleccion = await Coleccion.findOne({
      where: {
        id: idColeccion,
        idUsuario: req.session.usuario.id,
      },
    });

    if (!coleccion)
      return res.redirect(`/usuario/publicaciones/${idPublicacion}`);

    const publicacion = await Publicacion.findByPk(idPublicacion);
    if (!publicacion) return res.redirect("/usuario/home");

    // Verificar que no esté ya en la colección (no se puede duplicar)
    const yaExiste = await coleccion.hasPublicacion(publicacion);
    if (!yaExiste) {
      await coleccion.addPublicacion(publicacion);
    }

    return res.redirect(`/usuario/publicaciones/${idPublicacion}`);
  } catch (error) {
    console.error("Error al agregar a colección:", error);
    res.redirect("/usuario/home");
  }
}

export async function quitarDeColeccion(req, res) {
  try {
    const { idPublicacion } = req.params;

    const coleccion = await Coleccion.findOne({
      where: {
        id: req.params.id,
        idUsuario: req.session.usuario.id,
      },
    });

    if (!coleccion) return res.redirect("/usuario/colecciones");

    await coleccion.removePublicacion(idPublicacion);

    return res.redirect(`/usuario/colecciones/${req.params.id}`);
  } catch (error) {
    console.error("Error al quitar de colección:", error);
    res.redirect("/usuario/colecciones");
  }
}

export async function obtenerColeccionesUsuario(req, res) {
  try {
    const colecciones = await Coleccion.findAll({
      where: { idUsuario: req.session.usuario.id },
      order: [["nombre", "ASC"]],
    });

    res.json(colecciones);
  } catch (error) {
    console.error("Error al obtener colecciones:", error);
    res.status(500).json({ error: "Error al obtener colecciones" });
  }
}
