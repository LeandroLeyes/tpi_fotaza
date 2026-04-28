export const renderIndex = (req, res) => {
  res.render("index", { title: "Inicio" });
};

export const renderLogin = (req, res) => {
  res.render("login", { title: "Login" });
};

export const renderRegister = (req, res) => {
  res.render("register", { title: "Registro" });
};
