export function sesionData(req, res, next) {
  res.locals.usuario = req.session.usuario;

  res.locals.isActive = (ruta) => {
    return req.path.startsWith(ruta);
  };

  next();
}
