import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/rol.middleware.js";
import {
  mostrarHomeAdmin,
  listarUsuarios,
  crearValidador,
  quitarValidador,
  toggleCuenta,
} from "../controllers/admin.controller.js";

const admin = Router();

admin.use(isAuthenticated);
admin.use(isAdmin);

admin.get("/home", mostrarHomeAdmin);
admin.get("/usuarios", listarUsuarios);
admin.post("/usuarios/crear", crearValidador);
admin.post("/usuarios/:id/toggle", toggleCuenta);

export default admin;
