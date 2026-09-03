import { Usuario } from "../models/usuario.js";
import { Rol } from "../models/rol.js";
import { UsuariosRoles } from "../models/usuariosRoles.js";
import blobABase64 from "../helpers/blobAbase64.js";

export function mostrarFormularioCrear(req, res) {
  res.render("admin/crearValidador", {
    title: "Crear Validador",
  });
}

export async function crearValidador(req, res) {
  try {
    const { name, lastName, username, email, password } = req.datosValidados;

    const [usernameExistente, emailExistente] = await Promise.all([
      Usuario.findOne({ where: { username } }),
      Usuario.findOne({ where: { email } }),
    ]);

    if (usernameExistente || emailExistente) {
      return res.status(400).render("admin/crearValidador", {
        title: "Crear Validador",
        errores: {
          username: usernameExistente ? "Usuario en uso" : undefined,
          email: emailExistente ? "Email registrado" : undefined,
        },
        formValues: req.body,
      });
    }

    const rolValidador = await Rol.findOne({ where: { nombre: "validador" } });
    const nuevoUsuario = await Usuario.create({
      name,
      lastName,
      username,
      email,
      password,
    });
    await UsuariosRoles.create({
      idUsuario: nuevoUsuario.id,
      idRol: rolValidador.id,
    });

    return res.redirect("/admin/usuarios");
  } catch (error) {
    console.error("Error al crear validador:", error);
    res.redirect("/admin/usuarios");
  }
}

export async function mostrarHomeAdmin(req, res) {
  try {
    const rolValidador = await Rol.findOne({ where: { nombre: "validador" } });
    const totalValidadores = rolValidador
      ? await UsuariosRoles.count({ where: { idRol: rolValidador.id } })
      : 0;

    res.render("admin/home", {
      title: "Panel Admin",
      stats: {
        totalValidadores,
      },
    });
  } catch (error) {
    console.error("Error en panel admin:", error);
    res.redirect("/validadores/home");
  }
}

export async function listarValidadores(req, res) {
  try {
    const validadores = await Usuario.findAll({
      include: [
        {
          model: Rol,
          where: { nombre: "validador" },
        },
      ],
      order: [["createdAt", "DESC"]],
      paranoid: false,
    });

    const usuariosFormateados = validadores.map((u) => {
      const uJson = u.toJSON();
      return {
        ...uJson,
        avatar: blobABase64(u.avatar),
        rol: u.Rols?.[0]?.nombre || "usuario",
        activo: uJson.deletedAt === null,
      };
    });

    res.render("admin/validadores", {
      title: "Gestión de Validadores",
      usuarios: usuariosFormateados,
    });
  } catch (error) {
    console.error("Error al listar validadores:", error);
    res.redirect("/admin/home");
  }
}

export async function eliminarValidador(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      include: [{ model: Rol }],
      paranoid: false,
    });

    if (!usuario) return res.redirect("/admin/validadores");

    const esValidador = usuario.Rols?.some((rol) => rol.nombre === "validador");
    if (esValidador) {
      await UsuariosRoles.destroy({ where: { idUsuario: usuario.id } });
      await usuario.destroy({ force: true });
    }

    return res.redirect("/admin/validadores");
  } catch (error) {
    console.error("Error al eliminar validador:", error);
    res.redirect("/admin/validadores");
  }
}

export async function toggleCuenta(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      include: [{ model: Rol }],
      paranoid: false,
    });

    if (!usuario) return res.redirect("/admin/validadores");

    const esValidador = usuario.Rols?.some((rol) => rol.nombre === "validador");

    if (!esValidador) {
      console.warn(
        `Intento de modificar estado de un usuario estándar. ID: ${usuario.id}`,
      );
      return res.redirect("/admin/validadores");
    }

    if (usuario.deletedAt) {
      await usuario.restore();
    } else {
      await usuario.destroy();
    }

    return res.redirect("/admin/validadores");
  } catch (error) {
    console.error("Error al cambiar estado de cuenta:", error);
    res.redirect("/admin/validadores");
  }
}
