import { Router } from "express";

import authRoutes from "./auth.routes.js";
import landingRoutes from "./landing.routes.js";
import usuarioRoutes from "./usuario.routes.js";
import busquedaRoutes from "./busqueda.routes.js";
import denunciaRoutes from "./denuncia.routes.js";
import validadorRoutes from "./validador.routes.js";
import notificacionRoutes from "./notificacion.routes.js";
import chatRoutes from "./chat.routes.js";

const router = Router();

router.use("/", landingRoutes);
router.use("/auth", authRoutes);
router.use("/usuario", usuarioRoutes);
router.use("/buscar", busquedaRoutes);
router.use("/denuncia", denunciaRoutes);
router.use("/validador", validadorRoutes);
router.use("/usuario/notificaciones", notificacionRoutes);
router.use("/usuario/chat", chatRoutes);

export default router;
