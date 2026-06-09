import { formatearErrores } from "../schemas/validaciones.js";

export function validar(schema, vistaError) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      const errores = formatearErrores(resultado.error);

      return res.status(400).render(vistaError, {
        errores,
        formValues: req.body,
      });
    }

    req.datosValidados = resultado.data;
    next();
  };
}

export function validarYRedirigir(schema) {
  return (req, res, next) => {
    const body = req.body;
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      return res.redirect(`/usuario/publicaciones/${body.publicacionId}`);
    }

    req.datosValidados = resultado.data;
    next();
  };
}

export function validarConArchivos(
  schema,
  vistaError,
  { requerirArchivo = true } = {},
) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      const errores = formatearErrores(resultado.error);
      return res.status(400).render(vistaError, {
        errores,
        formValues: req.body,
      });
    }

    const archivos = req.files || (req.file ? [req.file] : []);

    if (requerirArchivo && archivos.length === 0) {
      return res.status(400).render(vistaError, {
        errores: { imagenes: "Debés subir al menos una imagen" },
        formValues: req.body,
      });
    }

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    for (const archivo of archivos) {
      if (!tiposPermitidos.includes(archivo.mimetype)) {
        return res.status(400).render(vistaError, {
          errores: {
            imagenes: "Solo se permiten imágenes JPG, PNG, WEBP o GIF",
          },
          formValues: req.body,
        });
      }
    }

    req.datosValidados = resultado.data;
    next();
  };
}
