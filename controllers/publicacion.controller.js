import { Publicacion } from "../models/publicacion.js";
import { Imagen } from "../models/imagen.js";
import { Etiqueta } from "../models/etiqueta.js";
import { Usuario } from "../models/usuario.js";
import { Comentario } from "../models/comentario.js";
import { Valoracion } from "../models/valoracion.js";
import sharp from "sharp";
import blobABase64 from "../helpers/blobAbase64.js";
import crearNotificacion from "../helpers/notificaciones.helper.js";

export function mostrarFormPublicacion(req, res) {
  res.render("usuario/publicaciones/crearPublicacion", {
    title: "Crear publicación",
  });
}

export async function crearPublicacion(req, res) {
  let publicacion = null;

  try {
    const {
      titulo,
      descripcion,
      etiquetas,
      copyright: copyrightStr,
    } = req.datosValidados;
    const idUsuario = req.session.usuario.id;
    const username = req.session.usuario.username;
    const copyright = copyrightStr === "true";

    publicacion = await Publicacion.create({
      titulo,
      descripcion,
      idUsuario: idUsuario,
    });

    for (const archivo of req.files) {
      let imagenProcesada;

      if (copyright) {
        const metadata = await sharp(archivo.buffer).metadata();
        const imgWidth = metadata.width || 800;

        const fontSize = 13;
        const padding = 8;
        const texto = `© ${username}`;
        const svgWidth = texto.length * 7 + padding * 2;
        const svgHeight = fontSize + padding * 2;

        const watermarkSvg = Buffer.from(
          `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">` +
            `<rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="black" opacity="0.35" rx="4"/>` +
            `<text x="${padding}" y="${fontSize + padding - 2}" font-size="${fontSize}" font-family="Arial, sans-serif" fill="white" opacity="0.95">© ${username}</text>` +
            `</svg>`,
        );

        imagenProcesada = await sharp(archivo.buffer)
          .composite([{ input: watermarkSvg, gravity: "southeast" }])
          .jpeg()
          .toBuffer();
      } else {
        imagenProcesada = await sharp(archivo.buffer).jpeg().toBuffer();
      }

      await Imagen.create({
        url: imagenProcesada,
        copyright,
        idPublicacion: publicacion.id,
      });
    }

    if (etiquetas) {
      const nombresEtiquetas = etiquetas
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      for (const nombre of nombresEtiquetas) {
        const [etiqueta] = await Etiqueta.findOrCreate({ where: { nombre } });
        await publicacion.addEtiqueta(etiqueta);
      }
    }

    return res.redirect("/usuario/home");
  } catch (error) {
    console.error("Error al crear publicación:", error);

    if (publicacion?.id) {
      await publicacion.destroy().catch(() => {});
    }

    return res.status(500).render("usuario/publicaciones/crearPublicacion", {
      errores: {
        general:
          "Ocurrió un error al procesar las imágenes. Verificá el formato y tamaño.",
      },
      formValues: req.body,
    });
  }
}

export async function renderPublicacion(req, res) {
  try {
    const publicacion = await Publicacion.findByPk(req.params.id, {
      include: [
        Etiqueta,
        {
          model: Usuario,
        },
        {
          model: Imagen,
          as: "imagenes",
          include: [
            Valoracion,
            {
              model: Comentario,
              include: [Usuario],
            },
          ],
        },
      ],
    });

    if (!publicacion) {
      return res.redirect("/usuario/home");
    }

    const pub = publicacion.toJSON();

    pub.imagenes = pub.imagenes.map((img) => ({
      ...img,
      imagenBase64: blobABase64(img.url),
      Comentarios: (img.Comentarios || []).map((c) => ({
        ...c,
        Usuario: {
          ...c.Usuario,
          avatar: blobABase64(c.Usuario?.avatar),
        },
      })),
    }));

    pub.Usuario = {
      ...pub.Usuario,
      avatar: blobABase64(pub.Usuario?.avatar),
    };

    if (!pub.imagenes || pub.imagenes.length === 0) {
      return res.redirect("/usuario/home");
    }

    const esPropietario = publicacion.idUsuario === req.session.usuario.id;

    res.render("usuario/publicaciones/verPublicacion", {
      title: pub.titulo,
      publicacion: pub,
      esPropietario,
      miUsuarioId: req.session.usuario.id,
    });
  } catch (error) {
    console.error(error);
    res.send("Error al mostrar publicación");
  }
}

export async function crearComentario(req, res) {
  try {
    const idImagen = req.params.idImagen;
    const { idPublicacion } = req.body;

    const imagen = await Imagen.findByPk(idImagen, {
      include: [{ model: Publicacion }],
    });

    if (!imagen) {
      return res.redirect(`/usuario/publicaciones/${idPublicacion}`);
    }

    if (!imagen.Publicacion.comentariosActivo) {
      return res.redirect(`/usuario/publicaciones/${imagen.idPublicacion}`);
    }

    await Comentario.create({
      contenido: req.datosValidados.contenido,
      idImagen: idImagen,
      idUsuario: req.session.usuario.id,
    });

    await crearNotificacion(
      imagen.Publicacion.idUsuario,
      req.session.usuario.id,
      "comentario",
      `${req.session.usuario.username} comentó tu publicación`,
      imagen.Publicacion.id,
    );

    return res.redirect(`/usuario/publicaciones/${imagen.idPublicacion}`);
  } catch (error) {
    console.error("Error al crear comentario:", error);
    return res.redirect(`/usuario/publicaciones/${req.body.idPublicacion}`);
  }
}

export async function valorarImagen(req, res) {
  try {
    const usuario = req.session.usuario;

    if (!usuario) {
      return res.redirect("/auth/login");
    }

    const imagen = await Imagen.findByPk(req.params.idImagen, {
      include: {
        model: Publicacion,
        attributes: ["id", "idUsuario"],
      },
    });

    const esPropietario =
      imagen.Publicacion.idUsuario === req.session.usuario.id;

    if (esPropietario) {
      return res.redirect(`/usuario/publicaciones/${imagen.idPublicacion}`);
    }

    const puntaje = Number(req.body.puntaje);

    const valoracionExistente = await Valoracion.findOne({
      where: {
        idUsuario: usuario.id,
        idImagen: req.params.idImagen,
      },
    });

    if (valoracionExistente) {
      await valoracionExistente.update({ puntaje });
    } else {
      await Valoracion.create({
        puntaje,
        idUsuario: usuario.id,
        idImagen: req.params.idImagen,
      });

      await crearNotificacion(
        imagen.Publicacion.idUsuario,
        usuario.id,
        "valoracion",
        `${usuario.username} valoró una de tus imágenes con ${puntaje} ⭐`,
        imagen.Publicacion.id,
      );
    }

    return res.redirect(`/usuario/publicaciones/${imagen.idPublicacion}`);
  } catch (error) {
    console.error(error);
    res.send("Error al valorar imagen");
  }
}

export async function cambiarEstadoComentarios(req, res) {
  const publicacion = await Publicacion.findByPk(req.params.id);

  if (!publicacion) {
    return res.redirect("/");
  }

  publicacion.comentariosActivo = !publicacion.comentariosActivo;

  await publicacion.save();

  res.redirect(`/usuario/publicaciones/${publicacion.id}`);
}

export async function eliminarPublicacion(req, res) {
  try {
    const publicacion = await Publicacion.findByPk(req.params.id);

    if (!publicacion) {
      return res.redirect("/usuario/home");
    }

    if (publicacion.idUsuario !== req.session.usuario.id) {
      return res.redirect(`/usuario/publicaciones/${publicacion.id}`);
    }

    await publicacion.destroy();

    return res.redirect("/usuario/home");
  } catch (error) {
    console.error("Error al eliminar publicación:", error);
    return res.redirect("/usuario/home");
  }
}

export async function mostrarFormEditar(req, res) {
  try {
    const publicacion = await Publicacion.findByPk(req.params.id, {
      include: [Etiqueta, { model: Imagen, as: "imagenes" }],
    });

    if (!publicacion) return res.redirect("/usuario/home");

    if (publicacion.idUsuario !== req.session.usuario.id) {
      return res.redirect(`/usuario/publicaciones/${publicacion.id}`);
    }

    const pub = publicacion.toJSON();
    pub.imagenes = pub.imagenes.map((img) => ({
      ...img,
      imagenBase64: blobABase64(img.url),
    }));

    res.render("usuario/publicaciones/editarPublicacion", {
      title: "Editar publicación",
      publicacion: pub,
    });
  } catch (error) {
    console.error("Error al cargar edición:", error);
    res.redirect("/usuario/home");
  }
}

export async function editarPublicacion(req, res) {
  let publicacion = null;

  try {
    publicacion = await Publicacion.findByPk(req.params.id, {
      include: [Etiqueta, { model: Imagen, as: "imagenes" }],
    });

    if (!publicacion) return res.redirect("/usuario/home");

    if (publicacion.idUsuario !== req.session.usuario.id) {
      return res.redirect(`/usuario/publicaciones/${publicacion.id}`);
    }

    const volverAlForm = async (errores) => {
      const pub = publicacion.toJSON();
      pub.imagenes = pub.imagenes.map((img) => ({
        ...img,
        imagenBase64: blobABase64(img.url),
      }));
      return res.status(400).render("usuario/publicaciones/editarPublicacion", {
        title: "Editar publicación",
        publicacion: pub,
        errores,
        formValues: req.body,
      });
    };

    const { editarPublicacionSchema } =
      await import("../schemas/validaciones.js");
    const { formatearErrores } = await import("../schemas/validaciones.js");
    const resultado = editarPublicacionSchema.safeParse(req.body);

    if (!resultado.success) {
      return volverAlForm(formatearErrores(resultado.error));
    }

    const { titulo, descripcion, etiquetas } = resultado.data;

    publicacion.titulo = titulo;
    publicacion.descripcion = descripcion;
    await publicacion.save();

    const eliminarIds = req.body.eliminarImagenes
      ? [].concat(req.body.eliminarImagenes)
      : [];

    if (eliminarIds.length > 0) {
      const totalImagenes = publicacion.imagenes.length;
      const nuevasImagenes = req.files?.length || 0;

      if (eliminarIds.length >= totalImagenes && nuevasImagenes === 0) {
        return volverAlForm({
          imagenes: "La publicación debe tener al menos una imagen",
        });
      }

      for (const idImg of eliminarIds) {
        await Imagen.destroy({
          where: { id: idImg, idPublicacion: publicacion.id },
        });
      }
    }

    if (req.files && req.files.length > 0) {
      for (const archivo of req.files) {
        const tiposPermitidos = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
        ];
        if (!tiposPermitidos.includes(archivo.mimetype)) {
          return volverAlForm({
            imagenes: "Solo se permiten imágenes JPG, PNG, WEBP o GIF",
          });
        }

        const imagenProcesada = await sharp(archivo.buffer).jpeg().toBuffer();
        await Imagen.create({
          url: imagenProcesada,
          copyright: false,
          idPublicacion: publicacion.id,
        });
      }
    }

    await publicacion.setEtiqueta([]);

    if (etiquetas) {
      const nombresEtiquetas = etiquetas
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      for (const nombre of nombresEtiquetas) {
        const [etiqueta] = await Etiqueta.findOrCreate({ where: { nombre } });
        await publicacion.addEtiqueta(etiqueta);
      }
    }

    return res.redirect(`/usuario/publicaciones/${publicacion.id}`);
  } catch (error) {
    console.error("Error al editar publicación:", error);
    return res.redirect(`/usuario/publicaciones/${req.params.id}`);
  }
}

export async function eliminarComentario(req, res) {
  try {
    const comentario = await Comentario.findByPk(req.params.idComentario, {
      include: [{ model: Imagen }],
    });

    if (!comentario) return res.redirect("/usuario/home");

    if (comentario.idUsuario !== req.session.usuario.id) {
      return res.redirect(
        `/usuario/publicaciones/${comentario.Imagen.idPublicacion}`,
      );
    }

    const idPublicacion = comentario.Imagen.idPublicacion;

    await comentario.destroy();

    return res.redirect(`/usuario/publicaciones/${idPublicacion}`);
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    return res.redirect("/usuario/home");
  }
}
