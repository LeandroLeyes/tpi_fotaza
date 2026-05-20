import { Router } from "express";
import { renderHome } from "../controllers/home.controller.js";

const home = Router();

home.get("/", renderHome);

export default home;
