import { Router } from "express";
import {
  registroUsuario,
  inicioSesion,
  loginForm,
  registerForm,
  finSesion,
} from "../controllers/auth.controller.js";
import { isGuest } from "../middlewares/auth.middleware.js";
import { validar } from "../middlewares/validar.middleware.js";
import { registroSchema, loginSchema } from "../schemas/validaciones.js";

const auth = Router();

auth.get("/login", isGuest, loginForm);

auth.post("/login", isGuest, validar(loginSchema, "auth/login"), inicioSesion);

auth.get("/register", isGuest, registerForm);

auth.post(
  "/register",
  isGuest,
  validar(registroSchema, "auth/register"),
  registroUsuario,
);

auth.get("/logout", finSesion);

export default auth;
