import { Usuario } from "../models/usuario.js";

export async function loginForm(req, res) {
  res.render("auth/login");
}

export async function registerForm(req, res) {
  res.render("auth/register");
}

export async function registroUsuario(req, res) {
  const { username, name, lastName, email, password, confirmPassword } =
    req.body;

  const nombre = name.trim();
  const apellido = lastName.trim();
  const mail = email.trim();
  const pass = password.trim();
  const confirmPass = confirmPassword.trim();

  if (!nombre || !apellido || !mail || !pass || !confirmPass) {
    res.status(400).render("auth/register", {
      alert: {
        status: "error",
        text: "No deben haber campos vacios",
      },
      formValues: req.body,
    });
  }

  if (pass !== confirmPass) {
    res.status(400).render("auth/register", {
      alert: {
        status: "error",
        text: "Las contrasenas no coinciden",
      },
      formValues: req.body,
    });
  }
  try {
    const validarUsername = await Usuario.findOne({
      where: { username: username },
    });
    const validarEmail = await Usuario.findOne({
      where: { email: email },
    });

    if (validarEmail || validarUsername) {
      return res.redirect("/auth/register");
    }

    await Usuario.create({
      name: nombre,
      lastName: apellido,
      username: username,
      email: mail,
      password: pass,
    });

    return res.redirect("/auth/login");
  } catch (error) {
    console.log(error);
    res.status(500).render("auth/register", {
      alert: {
        status: "error",
        text: "Hubo un error al crear el usuario",
      },
      formValues: req.body,
    });
    return;
  }
}

export async function inicioSesion(req, res) {
  const { email, password } = req.body;
  const mail = email.trim();
  const pass = password.trim();

  if (!mail || !pass) {
    res.status(400).render("auth/login", {
      alert: {
        status: "error",
        text: "Complete todos los campos",
      },
      formValues: req.body,
    });
    return;
  }

  try {
    const usuario = await Usuario.findOne({ where: { email: email } });
    if (!usuario) {
      res.status(400).render("auth/login", {
        alert: {
          status: "error",
          text: "Usuario o contrasena incorrecta.",
        },
        formValues: req.body,
      });
      return;
    }

    const isValidated = await usuario.validatePassword(pass);

    if (!isValidated) {
      res.status(400).render("auth/login", {
        alert: {
          status: "error",
          text: "Usuario o contrasena incorrecta.",
        },
        formValues: req.body,
      });
      return;
    }

    req.session.usuario = {
      id: usuario.id,
    };
  } catch (error) {
    console.log("[!] Error en login: ", error);
    res.status(500).render("auth/login", {
      alert: {
        status: "error",
        text: "Hubo un error al iniciar sesion",
      },
      formValues: req.body,
    });
    return;
  }

  res.redirect("/usuario/home");
}

export async function finSesion(req, res) {
  if (req.session) {
    await req.session.destroy();
    res.redirect("/auth/login");
    return;
  }
}
