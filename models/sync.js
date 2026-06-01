import sequelize from "./config.js";

import { Usuario } from "./usuario.js";
import { Publicacion } from "./publicacion.js";
import { Comentario } from "./comentario.js";
import { Imagen } from "./imagen.js";
import { Interes } from "./interes.js";
import { Chat } from "./chat.js";
import { Mensaje } from "./mensaje.js";
import { Denuncia } from "./denuncia.js";
import { Valoracion } from "./valoracion.js";
import { Etiqueta } from "./etiqueta.js";
import { Coleccion } from "./coleccion.js";
import { Notificacion } from "./notificacion.js";
import { Seguimiento } from "./seguimiento.js";

// Usuario - Publicacion
Usuario.hasMany(Publicacion);

Publicacion.belongsTo(Usuario);

// Usuario - Comentario
Usuario.hasMany(Comentario);

Comentario.belongsTo(Usuario);

// Imagen - Comentario
Imagen.hasMany(Comentario);

Comentario.belongsTo(Imagen);

// Publicacion - Imagen
Publicacion.hasMany(Imagen, {
  as: "imagenes",
});

Imagen.belongsTo(Publicacion);

// Usuario - Interes
Usuario.hasMany(Interes);

Interes.belongsTo(Usuario);

// Imagen - Interes
Imagen.hasMany(Interes);

Interes.belongsTo(Imagen);

// Interes - Chat
Interes.hasOne(Chat);

Chat.belongsTo(Interes);

// Chat - Usuario
Usuario.hasMany(Chat, {
  foreignKey: "idEmisor",
  as: "chatsEnviados",
});

Usuario.hasMany(Chat, {
  foreignKey: "idDestino",
  as: "chatsRecibidos",
});

Chat.belongsTo(Usuario, {
  foreignKey: "idEmisor",
  as: "emisor",
});

Chat.belongsTo(Usuario, {
  foreignKey: "idDestino",
  as: "destino",
});

// Chat - Mensaje
Chat.hasMany(Mensaje);

Mensaje.belongsTo(Chat);

// Usuario - Mensaje
Usuario.hasMany(Mensaje);

Mensaje.belongsTo(Usuario);

// Usuario - Valoracion
Usuario.hasMany(Valoracion);

Valoracion.belongsTo(Usuario);

// Imagen - Valoracion
Imagen.hasMany(Valoracion);

Valoracion.belongsTo(Imagen);

// Publicacion - Etiqueta
Publicacion.belongsToMany(Etiqueta, {
  through: "publicacionEtiqueta",
});

Etiqueta.belongsToMany(Publicacion, {
  through: "publicacionEtiqueta",
});

// Usuario - Coleccion
Usuario.hasMany(Coleccion);

Coleccion.belongsTo(Usuario);

// Coleccion - Publicacion
Coleccion.belongsToMany(Publicacion, {
  through: "coleccionPublicacion",
});

Publicacion.belongsToMany(Coleccion, {
  through: "coleccionPublicacion",
});

// Usuario - Seguimiento
Usuario.belongsToMany(Usuario, {
  through: Seguimiento,
  as: "seguidos",
  foreignKey: "idSeguidor",
  otherKey: "idSeguido",
});

// Usuario - Denuncia
Usuario.hasMany(Denuncia, {
  foreignKey: "idUsuario",
});

Denuncia.belongsTo(Usuario, {
  foreignKey: "idUsuario",
});

// Validador - Denuncia
Usuario.hasMany(Denuncia, {
  foreignKey: "idValidador",
  as: "denunciasValidadas",
});

Denuncia.belongsTo(Usuario, {
  foreignKey: "idValidador",
  as: "validador",
});

// Usuario - Notificacion
Usuario.hasMany(Notificacion, {
  foreignKey: "idUsuarioDestino",
  as: "notificacionesRecibidas",
});

Usuario.hasMany(Notificacion, {
  foreignKey: "idUsuarioOrigen",
  as: "notificacionesEnviadas",
});

Notificacion.belongsTo(Usuario, {
  foreignKey: "idUsuarioDestino",
  as: "destino",
});

Notificacion.belongsTo(Usuario, {
  foreignKey: "idUsuarioOrigen",
  as: "origen",
});

//Sincronizacion de datos
export async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Conexion a bd establecida");

    await sequelize.sync({ alter: true });
    console.log("Base de datos sincronizada");
  } catch (error) {
    console.error("Error al sincronizar la base de datos:");
    throw error;
  }
}
