import { Router } from "express";
import {
  renderIndex,
  renderLogin,
  renderRegister,
} from "../controllers/views.controller.js";

const router = Router();

router.get("/", renderIndex);
router.get("/login", renderLogin);
router.get("/register", renderRegister);

export default router;
