export default function renderHome(req, res) {
  const body = req.body;
  return res.render("/usuario/home");
}
