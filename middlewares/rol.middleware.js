export function isAdmin(req, res, next) {
  if (req.session.usuario?.rol !== "admin") {
    return res.redirect("/usuario/home");
  }
  next();
}

export function isValidador(req, res, next) {
  if (
    req.session.usuario?.rol !== "validador" &&
    req.session.usuario?.rol !== "admin"
  ) {
    return res.redirect("/usuario/home");
  }
  next();
}

// Bloquea el acceso de validadores y admins a rutas de usuario normal
export function isSoloUsuario(req, res, next) {
  const rol = req.session.usuario?.rol;
  if (rol === "validador") return res.redirect("/validador/home");
  if (rol === "admin") return res.redirect("/admin/home");
  next();
}
