import { Publicacion } from "../models/publicacion.js";
import { Imagen } from "../models/imagen.js";
import { Etiqueta } from "../models/etiqueta.js";
import { Usuario } from "../models/usuario.js";
import { Comentario } from "../models/comentario.js";
import { Valoracion } from "../models/valoracion.js";
import sharp from "sharp";
import blobABase64 from "../helpers/blobAbase64.js";

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
    const usuarioId = req.session.usuario.id;
    const username = req.session.usuario.username;
    const copyright = copyrightStr === "true";

    publicacion = await Publicacion.create({
      titulo,
      descripcion,
      UsuarioId: usuarioId,
    });

    for (const archivo of req.files) {
      let imagenProcesada;

      if (copyright) {
        const metadata = await sharp(archivo.buffer).metadata();
        const imgWidth = metadata.width || 800;

        const svgWidth = Math.min(imgWidth, 400);
        const fontSize = Math.max(14, Math.round(svgWidth / 16));
        const svgHeight = fontSize + 20;

        const watermarkSvg = Buffer.from(
          `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">` +
            `<text x="10" y="${fontSize}" font-size="${fontSize}" fill="white" opacity="0.8">© ${username}</text>` +
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
        PublicacionId: publicacion.id,
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

    const esPropietario = publicacion.UsuarioId === req.session.usuario.id;

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
    const { publicacionId } = req.body;

    const imagen = await Imagen.findByPk(idImagen, {
      include: [{ model: Publicacion }],
    });

    if (!imagen) {
      return res.redirect(`/usuario/publicaciones/${publicacionId}`);
    }

    if (!imagen.Publicacion.comentariosActivo) {
      return res.redirect(`/usuario/publicaciones/${imagen.PublicacionId}`);
    }

    await Comentario.create({
      contenido: req.datosValidados.contenido,
      ImagenId: idImagen,
      UsuarioId: req.session.usuario.id,
    });

    return res.redirect(`/usuario/publicaciones/${imagen.PublicacionId}`);
  } catch (error) {
    console.error("Error al crear comentario:", error);
    return res.redirect(`/usuario/publicaciones/${req.body.publicacionId}`);
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
        attributes: ["id", "UsuarioId"],
      },
    });

    const esPropietario =
      imagen.Publicacion.UsuarioId === req.session.usuario.id;

    if (esPropietario) {
      return res.redirect(`/usuario/publicaciones/${imagen.PublicacionId}`);
    }

    const puntaje = Number(req.body.puntaje);

    const valoracionExistente = await Valoracion.findOne({
      where: {
        UsuarioId: usuario.id,
        ImagenId: req.params.idImagen,
      },
    });

    if (valoracionExistente) {
      await valoracionExistente.update({
        puntaje,
      });
    } else {
      await Valoracion.create({
        puntaje,
        UsuarioId: usuario.id,
        ImagenId: req.params.idImagen,
      });
    }

    return res.redirect(`/usuario/publicaciones/${imagen.PublicacionId}`);
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
