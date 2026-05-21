import { Router } from "express";
import renderHome from "../controllers/usuario.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const usuario = Router();

usuario.get("/", (req, res) => {
  res.render("usuario/home", {
    title: "Inicio",
  });
});

export default usuario;
