import { Router } from "express";
import {
  registroUsuario,
  inicioSesion,
  loginForm,
  registerForm,
  finSesion,
} from "../controllers/auth.controller.js";
import { isGuest } from "../middlewares/auth.middleware.js";

const auth = Router();

auth.get("/login", isGuest, loginForm);

auth.post("/login", inicioSesion);

auth.get("/register", isGuest, registerForm);

auth.post("/register", registroUsuario);

auth.get("/logout", finSesion);

export default auth;
