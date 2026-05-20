export function isAuthenticated(req, res, next) {
  if (!req.session.usuario) {
    return res.redirect("/auth/login");
  }

  next();
}
