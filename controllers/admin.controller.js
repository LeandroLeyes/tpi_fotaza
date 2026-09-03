import { Usuario } from "../models/usuario.js";
import { Rol } from "../models/rol.js";
import { UsuariosRoles } from "../models/usuariosRoles.js";
import { Op } from "sequelize";
import blobABase64 from "../helpers/blobAbase64.js";

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
    res.redirect("/usuario/home");
  }
}

export async function listarUsuarios(req, res) {
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

    const usuariosFormateados = validadores.map((u) => ({
      ...u.toJSON(),
      avatar: blobABase64(u.avatar),
      rol: u.Rols?.[0]?.nombre || "usuario",
    }));

    res.render("admin/usuarios", {
      title: "Gestión de Validadores",
      usuarios: usuariosFormateados,
    });
  } catch (error) {
    console.error("Error al listar validadores:", error);
    res.redirect("/admin/home");
  }
}

export async function crearValidador(req, res) {
  try {
    const { name, lastName, username, email, password } = req.body;

    const rolValidador = await Rol.findOne({ where: { nombre: "validador" } });
    if (!rolValidador) return res.redirect("/admin/usuarios");

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

export async function quitarValidador(req, res) {
  try {
    const rolUsuario = await Rol.findOne({ where: { nombre: "usuario" } });
    if (!rolUsuario) return res.redirect("/admin/usuarios");

    await UsuariosRoles.destroy({ where: { idUsuario: req.params.id } });
    await UsuariosRoles.create({
      idUsuario: req.params.id,
      idRol: rolUsuario.id,
    });

    return res.redirect("/admin/usuarios");
  } catch (error) {
    console.error("Error al quitar validador:", error);
    res.redirect("/admin/usuarios");
  }
}

export async function toggleCuenta(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      include: [{ model: Rol }],
      paranoid: false,
    });

    if (!usuario) return res.redirect("/admin/usuarios");

    const esValidador = usuario.Rols?.some((rol) => rol.nombre === "validador");

    if (!esValidador) {
      console.warn(
        `Alerta de seguridad: Intento de modificar estado de un usuario estándar. ID: ${usuario.id}`,
      );
      return res.redirect("/admin/usuarios");
    }

    await usuario.update({ activo: !usuario.activo });

    return res.redirect("/admin/usuarios");
  } catch (error) {
    console.error("Error al cambiar estado de cuenta:", error);
    res.redirect("/admin/usuarios");
  }
}
