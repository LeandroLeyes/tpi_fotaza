import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.render("landing/index", {
    title: "Fotaza",
  });
});

router.get("/home", (req, res) => {
  res.render("home/index", {
    title: "Inicio",
  });
});

router.get("/login", (req, res) => {
  res.render("auth/login", {
    title: "Login",
  });
});

router.get("/register", (req, res) => {
  res.render("auth/register", {
    title: "Registro",
  });
});

export default router;
