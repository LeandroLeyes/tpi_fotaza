import { Usuario } from "../models/usuario.js";
import { Publicacion } from "../models/publicacion.js";
import { Comentario } from "../models/comentario.js";
import { Rol } from "../models/rol.js";
import { UsuariosRoles } from "../models/usuariosRoles.js";
import { Op } from "sequelize";
import blobABase64 from "../helpers/blobAbase64.js";

export async function mostrarHomeAdmin(req, res) {
  try {
    const [
      totalUsuarios,
      totalPublicaciones,
      totalComentarios,
      usuariosBloqueados,
      publicacionesBajadas,
    ] = await Promise.all([
      Usuario.count(),
      Publicacion.count(),
      Comentario.count(),
      Usuario.count({ where: { deletedAt: { [Op.ne]: null } } }),
      Publicacion.count({
        where: { deletedAt: { [Op.ne]: null } },
        paranoid: false,
      }),
    ]);

    const rolValidador = await Rol.findOne({ where: { nombre: "validador" } });
    const totalValidadores = rolValidador
      ? await UsuariosRoles.count({ where: { idRol: rolValidador.id } })
      : 0;

    res.render("admin/home", {
      title: "Panel Admin",
      stats: {
        totalUsuarios,
        totalPublicaciones,
        totalComentarios,
        usuariosBloqueados,
        publicacionesBajadas,
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
    const usuarios = await Usuario.findAll({
      include: [{ model: Rol }],
      order: [["createdAt", "DESC"]],
      paranoid: false,
    });

    const usuariosFormateados = usuarios.map((u) => ({
      ...u.toJSON(),
      avatar: blobABase64(u.avatar),
      rol: u.Rols?.[0]?.nombre || "usuario",
    }));

    res.render("admin/usuarios", {
      title: "Gestión de usuarios",
      usuarios: usuariosFormateados,
    });
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    res.redirect("/admin/home");
  }
}

export async function asignarValidador(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      include: [{ model: Rol }],
    });

    if (!usuario) return res.redirect("/admin/usuarios");

    const rolValidador = await Rol.findOne({ where: { nombre: "validador" } });
    const rolUsuario = await Rol.findOne({ where: { nombre: "usuario" } });

    if (!rolValidador) return res.redirect("/admin/usuarios");

    await UsuariosRoles.destroy({ where: { idUsuario: usuario.id } });
    await UsuariosRoles.create({
      idUsuario: usuario.id,
      idRol: rolValidador.id,
    });

    return res.redirect("/admin/usuarios");
  } catch (error) {
    console.error("Error al asignar validador:", error);
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
    const usuario = await Usuario.findByPk(req.params.id, { paranoid: false });

    if (!usuario) return res.redirect("/admin/usuarios");

    await usuario.update({ activo: !usuario.activo });

    return res.redirect("/admin/usuarios");
  } catch (error) {
    console.error("Error al cambiar estado de cuenta:", error);
    res.redirect("/admin/usuarios");
  }
}
