import { Denuncia } from "../models/denuncia.js";
import { Publicacion } from "../models/publicacion.js";
import { Comentario } from "../models/comentario.js";
import { Imagen } from "../models/imagen.js";
import { Usuario } from "../models/usuario.js";
import { denunciaSchema } from "../schemas/validaciones.js";
import { formatearErrores } from "../schemas/validaciones.js";

export async function mostrarFormDenunciarPublicacion(req, res) {
  try {
    const publicacion = await Publicacion.findByPk(req.params.id);

    if (!publicacion) return res.redirect("/usuario/home");

    if (publicacion.idUsuario === req.session.usuario.id) {
      return res.redirect(`/usuario/publicaciones/${publicacion.id}`);
    }

    const denunciaExistente = await Denuncia.findOne({
      where: {
        idPublicacion: publicacion.id,
        idUsuario: req.session.usuario.id,
        tipo: "publicacion",
      },
    });

    if (denunciaExistente) {
      return res.redirect(`/usuario/publicaciones/${publicacion.id}`);
    }

    res.render("usuario/denuncias/denunciarPublicacion", {
      title: "Denunciar publicación",
      publicacion,
    });
  } catch (error) {
    console.error("Error al mostrar form denuncia:", error);
    res.redirect("/usuario/home");
  }
}

export async function crearDenunciaPublicacion(req, res) {
  try {
    const publicacion = await Publicacion.findByPk(req.params.id);

    if (!publicacion) return res.redirect("/usuario/home");

    if (publicacion.idUsuario === req.session.usuario.id) {
      return res.redirect(`/usuario/publicaciones/${publicacion.id}`);
    }

    // Validar con Zod
    const resultado = denunciaSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).render("usuario/denuncias/denunciarPublicacion", {
        title: "Denunciar publicación",
        publicacion,
        errores: formatearErrores(resultado.error),
        formValues: req.body,
      });
    }

    const { motivo, descripcion } = resultado.data;

    // Verificar que no haya denuncia previa del mismo usuario
    const denunciaExistente = await Denuncia.findOne({
      where: {
        idPublicacion: publicacion.id,
        idUsuario: req.session.usuario.id,
        tipo: "publicacion",
      },
    });

    if (denunciaExistente) {
      return res.redirect(`/usuario/publicaciones/${publicacion.id}`);
    }

    await Denuncia.create({
      motivo,
      descripcion,
      tipo: "publicacion",
      idUsuario: req.session.usuario.id,
      idPublicacion: publicacion.id,
    });

    return res.redirect(`/usuario/publicaciones/${publicacion.id}`);
  } catch (error) {
    console.error("Error al crear denuncia:", error);
    res.redirect("/usuario/home");
  }
}

export async function mostrarFormDenunciarComentario(req, res) {
  try {
    const comentario = await Comentario.findByPk(req.params.idComentario, {
      include: [{ model: Usuario }, { model: Imagen }],
    });

    if (!comentario) return res.redirect("/usuario/home");

    if (comentario.idUsuario === req.session.usuario.id) {
      return res.redirect(
        `/usuario/publicaciones/${comentario.Imagen.idPublicacion}`,
      );
    }

    const denunciaExistente = await Denuncia.findOne({
      where: {
        idComentario: comentario.id,
        idUsuario: req.session.usuario.id,
        tipo: "comentario",
      },
    });

    if (denunciaExistente) {
      return res.redirect(
        `/usuario/publicaciones/${comentario.Imagen.idPublicacion}`,
      );
    }

    res.render("usuario/denuncias/denunciarComentario", {
      title: "Denunciar comentario",
      comentario,
      idPublicacion: comentario.Imagen.idPublicacion,
    });
  } catch (error) {
    console.error("Error al mostrar form denuncia comentario:", error);
    res.redirect("/usuario/home");
  }
}

export async function crearDenunciaComentario(req, res) {
  try {
    const comentario = await Comentario.findByPk(req.params.idComentario, {
      include: [{ model: Usuario }, { model: Imagen }],
    });

    if (!comentario) return res.redirect("/usuario/home");

    const idPublicacion = comentario.Imagen.idPublicacion;

    if (comentario.idUsuario === req.session.usuario.id) {
      return res.redirect(`/usuario/publicaciones/${idPublicacion}`);
    }

    const resultado = denunciaSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).render("usuario/denuncias/denunciarComentario", {
        title: "Denunciar comentario",
        comentario,
        idPublicacion,
        errores: formatearErrores(resultado.error),
        formValues: req.body,
      });
    }

    const { motivo, descripcion } = resultado.data;

    const denunciaExistente = await Denuncia.findOne({
      where: {
        idComentario: comentario.id,
        idUsuario: req.session.usuario.id,
        tipo: "comentario",
      },
    });

    if (denunciaExistente) {
      return res.redirect(`/usuario/publicaciones/${idPublicacion}`);
    }

    await Denuncia.create({
      motivo,
      descripcion,
      tipo: "comentario",
      idUsuario: req.session.usuario.id,
      idComentario: comentario.id,
    });

    return res.redirect(`/usuario/publicaciones/${idPublicacion}`);
  } catch (error) {
    console.error("Error al crear denuncia comentario:", error);
    res.redirect("/usuario/home");
  }
}
