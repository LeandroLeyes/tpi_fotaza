export function isAuthenticated(req, res, next) {
  if (!req.session.usuario) {
    return res.redirect("/auth/login");
  }
  next();
}

export function isGuest(req, res, next) {
  if (!req.session.usuario) return next();

  // Redirigir según el rol si ya está logueado
  const rol = req.session.usuario.rol;
  if (rol === "validador") return res.redirect("/validador/home");
  if (rol === "admin") return res.redirect("/admin/home");
  return res.redirect("/usuario/home");
}
