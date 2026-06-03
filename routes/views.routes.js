import { Router } from "express";

import authRoutes from "./auth.routes.js";
import landingRoutes from "./landing.routes.js";
import usuarioRoutes from "./usuario.routes.js";
import busquedaRoutes from "./busqueda.routes.js";

const router = Router();

router.use("/", landingRoutes);

router.use("/auth", authRoutes);

router.use("/usuario", usuarioRoutes);

router.use("/buscar", busquedaRoutes);

export default router;
