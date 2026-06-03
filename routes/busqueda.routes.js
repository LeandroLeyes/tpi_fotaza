import { Router } from "express";
import { buscarContenido } from "../controllers/busqueda.controller.js";

const busqueda = Router();

busqueda.get("/", buscarContenido);

export default busqueda;
