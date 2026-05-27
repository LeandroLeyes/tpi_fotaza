export function isAdmin(req, res, next) {
  if (req.session.usuario.rol !== "admin") {
    return res.redirect("/admin/home");
  }

  next();
}

export function isValidador(req, res, next) {
  const rol = req.session.usuario.rol;

  if (rol !== "validador" && rol !== "admin") {
    return res.redirect("/validador/home");
  }

  next();
}
