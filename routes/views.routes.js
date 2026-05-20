import { Router } from "express";

import authRoutes from "./auth.routes.js";
import landingRoutes from "./landing.routes.js";
import homeRoutes from "./home.routes.js";

const router = Router();

router.use("/", landingRoutes);

router.use("/auth", authRoutes);

router.use("/home", homeRoutes);

export default router;
