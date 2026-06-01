import { Publicacion } from "../models/publicacion.js";
import { Imagen } from "../models/imagen.js";
import { Usuario } from "../models/usuario.js";

export async function mostrarHome(req, res) {
  try {
    const publicaciones = await Publicacion.findAll({
      include: [
        {
          model: Imagen,
          as: "imagenes",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const pubs = publicaciones.map((pub) => {
      const img = pub.imagenes?.[0];
      return {
        ...pub.toJSON(),
        imagenBase64: img?.url
          ? `data:image/jpeg;base64,${Buffer.from(img.url).toString("base64")}`
          : null,
        tieneCopyright: img?.copyright,
      };
    });

    res.render("usuario/home", { title: "Inicio", publicaciones: pubs });
  } catch (error) {
    console.error("Error cargando home:", error);
    res.send("Error: " + error.message);
  }
}
