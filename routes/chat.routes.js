import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isSoloUsuario } from "../middlewares/rol.middleware.js";
import {
  marcarInteres,
  listarChats,
  verChat,
  enviarMensaje,
} from "../controllers/chat.controller.js";

const chat = Router();

chat.use(isAuthenticated);
chat.use(isSoloUsuario);

// Me interesa
chat.post("/interes/:idImagen", marcarInteres);

// Chats
chat.get("/", listarChats);
chat.get("/:id", verChat);
chat.post("/:id/mensaje", enviarMensaje);

export default chat;
