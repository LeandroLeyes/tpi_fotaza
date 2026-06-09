import { Usuario } from "../models/usuario.js";

export async function loginForm(req, res) {
  res.render("auth/login");
}

export async function registerForm(req, res) {
  res.render("auth/register");
}

export async function registroUsuario(req, res) {
  const { username, name, lastName, email, password } = req.datosValidados;

  try {
    const [usuarioExistente, emailExistente] = await Promise.all([
      Usuario.findOne({ where: { username } }),
      Usuario.findOne({ where: { email } }),
    ]);

    if (usuarioExistente) {
      return res.status(400).render("auth/register", {
        errores: { username: "Ese nombre de usuario ya está en uso" },
        formValues: req.body,
      });
    }

    if (emailExistente) {
      return res.status(400).render("auth/register", {
        errores: { email: "Ese correo ya está registrado" },
        formValues: req.body,
      });
    }

    await Usuario.create({ name, lastName, username, email, password });

    return res.redirect("/auth/login");
  } catch (error) {
    console.error(error);
    return res.status(500).render("auth/register", {
      errores: {
        general: "Hubo un error al crear el usuario. Intentá de nuevo.",
      },
      formValues: req.body,
    });
  }
}

export async function inicioSesion(req, res) {
  const { email, password } = req.datosValidados;

  try {
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(400).render("auth/login", {
        errores: { general: "Usuario o contraseña incorrectos" },
        formValues: req.body,
      });
    }

    const isValidated = await usuario.validatePassword(password);

    if (!isValidated) {
      return res.status(400).render("auth/login", {
        errores: { general: "Usuario o contraseña incorrectos" },
        formValues: req.body,
      });
    }

    let avatarBase64 = null;
    if (usuario.avatar) {
      avatarBase64 = `data:image/jpeg;base64,${Buffer.from(usuario.avatar).toString("base64")}`;
    }

    req.session.usuario = {
      id: usuario.id,
      username: usuario.username,
      name: usuario.name,
      rol: usuario.rol,
      avatar: avatarBase64,
    };

    return res.redirect("/usuario/home");
  } catch (error) {
    console.error("[!] Error en login:", error);
    return res.status(500).render("auth/login", {
      errores: {
        general: "Hubo un error al iniciar sesión. Intenta de nuevo.",
      },
      formValues: req.body,
    });
  }
}

export function finSesion(req, res) {
  req.session.destroy((error) => {
    if (error) {
      console.error("Error al cerrar sesión:", error);
      return res.redirect("/usuario/home");
    }
    res.clearCookie("connect.sid");
    return res.redirect("/auth/login");
  });
}
