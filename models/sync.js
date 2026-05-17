import { sequelize } from "./config.js";

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

// Publicacion - Comentario
Publicacion.hasMany(Comentario);

Comentario.belongsTo(Publicacion);

// Publicacion - Imagen
Publicacion.hasMany(Imagen);

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
  foreignKey: "emisorId",
  as: "chatsEnviados",
});

Usuario.hasMany(Chat, {
  foreignKey: "destinoId",
  as: "chatsRecibidos",
});

Chat.belongsTo(Usuario, {
  foreignKey: "emisorId",
  as: "emisor",
});

Chat.belongsTo(Usuario, {
  foreignKey: "destinoId",
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
  foreignKey: "seguidorId",
  otherKey: "seguidoId",
});

// Usuario - Denuncia
Usuario.hasMany(Denuncia, {
  foreignKey: "usuarioId",
});

Denuncia.belongsTo(Usuario, {
  foreignKey: "usuarioId",
});

// Validador - Denuncia
Usuario.hasMany(Denuncia, {
  foreignKey: "validadorId",
  as: "denunciasValidadas",
});

Denuncia.belongsTo(Usuario, {
  foreignKey: "validadorId",
  as: "validador",
});

// Usuario - Notificacion
Usuario.hasMany(Notificacion, {
  foreignKey: "usuarioDestinoId",
  as: "notificacionesRecibidas",
});

Usuario.hasMany(Notificacion, {
  foreignKey: "usuarioOrigenId",
  as: "notificacionesEnviadas",
});

Notificacion.belongsTo(Usuario, {
  foreignKey: "usuarioDestinoId",
  as: "destino",
});

Notificacion.belongsTo(Usuario, {
  foreignKey: "usuarioOrigenId",
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
