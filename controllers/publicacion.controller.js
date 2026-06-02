import { Publicacion } from "../models/publicacion.js";
import { Imagen } from "../models/imagen.js";
import { Etiqueta } from "../models/etiqueta.js";
import { Usuario } from "../models/usuario.js";
import { Comentario } from "../models/comentario.js";
import sharp from "sharp";

export function mostrarFormPublicacion(req, res) {
  res.render("usuario/publicaciones/crearPublicacion", {
    title: "Crear publicación",
  });
}

export async function crearPublicacion(req, res) {
  try {
    const { titulo, descripcion, etiquetas } = req.body;
    const usuarioId = req.session.usuario.id;
    const username = req.session.usuario.username;

    const copyright = req.body.copyright === "true";

    let imagenProcesada;

    if (copyright) {
      imagenProcesada = await sharp(req.file.buffer)
        .composite([
          {
            input: Buffer.from(
              `<svg width="400" height="50"><text x="10" y="35" font-size="24" fill="white" opacity="0.8">© ${username}</text></svg>`,
            ),
            gravity: "southeast",
          },
        ])
        .jpeg()
        .toBuffer();
    } else {
      imagenProcesada = await sharp(req.file.buffer).jpeg().toBuffer();
    }

    const publicacion = await Publicacion.create({
      titulo,
      descripcion,
      UsuarioId: usuarioId,
    });

    // Guardar imagen como BLOB
    await Imagen.create({
      url: imagenProcesada,
      copyright: copyright,
      PublicacionId: publicacion.id,
    });

    // Manejar etiquetas (vienen como "foto,viaje,naturaleza")
    if (etiquetas) {
      const nombresEtiquetas = etiquetas
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e);
      for (const nombre of nombresEtiquetas) {
        const [etiqueta] = await Etiqueta.findOrCreate({ where: { nombre } });
        await publicacion.addEtiqueta(etiqueta);
      }
    }

    res.redirect("/usuario/home");
  } catch (error) {
    console.error("Error al crear publicación:", error);
    res.send("Error al crear publicación: " + error.message);
  }
}

export async function renderPublicacion(req, res) {
  const publicacion = await Publicacion.findByPk(req.params.id, {
    include: [
      {
        model: Usuario,
      },

      {
        model: Imagen,
        as: "imagenes",
        include: [
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
    imagenBase64: `data:image/jpeg;base64,${Buffer.from(img.url).toString("base64")}`,
  }));

  res.render("usuario/publicaciones/verPublicacion", {
    title: pub.titulo,
    publicacion: pub,
  });
}
