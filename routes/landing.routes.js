import { Router } from "express";

const landing = Router();

landing.get("/", (req, res) => {
  res.render("landing/index", {
    title: "Fotaza",
  });
});

export default landing;
