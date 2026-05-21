import { Router } from "express";

import authRoutes from "./auth.routes.js";
import landingRoutes from "./landing.routes.js";
import usuarioRoutes from "./usuario.routes.js";

const router = Router();

router.use("/", landingRoutes);

router.use("/auth", authRoutes);

router.use("/usuario", usuarioRoutes);

export default router;
