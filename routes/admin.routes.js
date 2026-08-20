import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/rol.middleware.js";
import {
  mostrarHomeAdmin,
  listarUsuarios,
  asignarValidador,
  quitarValidador,
  toggleCuenta,
} from "../controllers/admin.controller.js";

const admin = Router();

admin.use(isAuthenticated);
admin.use(isAdmin);

admin.get("/home", mostrarHomeAdmin);
admin.get("/usuarios", listarUsuarios);
admin.post("/usuarios/:id/validador", asignarValidador);
admin.post("/usuarios/:id/quitar-validador", quitarValidador);
admin.post("/usuarios/:id/toggle", toggleCuenta);

export default admin;
