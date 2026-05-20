export async function renderHome(req, res) {
  const usuario = req.session.usuario;
  let view = "home/usuario";

  if (usuario.rol === "validador") {
    view = "home/validador";
  }

  if (usuario.rol === "admin") {
    view = "home/admin";
  }

  return res.render(view, {
    title: "Inicio",
    usuario,
  });
}
