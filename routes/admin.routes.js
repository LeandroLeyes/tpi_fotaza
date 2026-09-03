import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/rol.middleware.js";
import { registroSchema } from "../schemas/validaciones.js";
import { validar } from "../middlewares/validar.middleware.js";
import {
  mostrarHomeAdmin,
  listarValidadores,
  eliminarValidador,
  mostrarFormularioCrear,
  crearValidador,
  toggleCuenta,
} from "../controllers/admin.controller.js";

const admin = Router();

admin.use(isAuthenticated);
admin.use(isAdmin);

admin.get("/home", mostrarHomeAdmin);
admin.get("/validadores", listarValidadores);
admin.get("/usuarios/crear", mostrarFormularioCrear);
admin.post("/validadores/:id/eliminar", eliminarValidador);
admin.post("/validadores/:id/toggle", toggleCuenta);
admin.post(
  "/usuarios/crear",
  validar(registroSchema, "admin/crearValidador"),
  crearValidador,
);

export default admin;
