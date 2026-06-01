import { Router } from "express";
import {
  registroUsuario,
  inicioSesion,
  loginForm,
  registerForm,
} from "../controllers/auth.controller.js";

const auth = Router();

auth.get("/login", loginForm);

auth.post("/login", inicioSesion);

auth.get("/register", registerForm);

auth.post("/register", registroUsuario);

export default auth;
