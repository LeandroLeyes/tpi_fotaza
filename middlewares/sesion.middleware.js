export function sesionData(req, res, next) {
  res.locals.usuario = req.session.usuario;

  res.locals.isActive = (ruta) => {
    return req.path.startsWith(ruta);
  };

  // Helper para chequear rol en las vistas sin lógica en PUG
  res.locals.esValidador =
    req.session.usuario?.rol === "validador" ||
    req.session.usuario?.rol === "admin";

  res.locals.esAdmin = req.session.usuario?.rol === "admin";

  next();
}
