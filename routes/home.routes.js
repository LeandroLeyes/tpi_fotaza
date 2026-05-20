import { Router } from "express";
import { renderHome } from "../controllers/home.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const home = Router();

home.get("/", isAuthenticated, renderHome);

export default home;
