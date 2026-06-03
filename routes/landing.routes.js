import { Router } from "express";
import { isGuest } from "../middlewares/auth.middleware.js";

const landing = Router();

landing.get("/", isGuest, (req, res) => {
  res.render("landing/index", {
    title: "Fotaza",
  });
});

export default landing;
