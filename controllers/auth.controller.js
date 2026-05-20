import bcrypt from "bcrypt";
import { Usuario } from "../models/usuario.js";

export async function registroUsuario(req, res) {
  try {
    const body = req.body;
    const validarUsername = await Usuario.findOne({
      where: { username: body.username },
    });
    const validarEmail = await Usuario.findOne({
      where: { email: body.email },
    });

    if (validarEmail || validarUsername) {
      return res.redirect("/auth/register");
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    await Usuario.create({
      name: body.name,
      lastName: body.lastName,
      username: body.username,
      email: body.email,
      password: passwordHash,
    });

    return res.redirect("/auth/login");
  } catch (error) {
    console.error("Error al registrar usuario" + error);
    res.send("Error al registrar usuario" + error);
  }
}

export async function inicioSesion(req, res) {
  try {
    const body = req.body;
    const usuario = await Usuario.findOne({ where: { email: body.email } });

    if (usuario) {
      const validPassword = await bcrypt.compare(
        body.password,
        usuario.password,
      );

      if (validPassword) {
        req.session.usuario = {
          id: usuario.id,
          username: usuario.username,
          avatar: undefined,
          rol: usuario.rol,
        };

        req.session.save(() => {
          return res.redirect("/home");
        });
      } else {
        console.error("Contraseña incorrecta!");
        res.redirect("/auth/login");
      }
    } else {
      console.error("El usuario non existe!");
      res.redirect("/auth/login");
    }
  } catch (error) {
    console.error("Error al iniciar sesion" + error);
    res.send("Error al iniciar sesion" + error);
  }
}
