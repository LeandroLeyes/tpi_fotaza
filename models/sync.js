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
import { Rol } from "./rol.js";
import { UsuariosRoles } from "./usuariosRoles.js";

// Usuario - Publicacion
Usuario.hasMany(Publicacion, { foreignKey: "idUsuario" });
Publicacion.belongsTo(Usuario, { foreignKey: "idUsuario" });

// Usuario - Comentario
Usuario.hasMany(Comentario, { foreignKey: "idUsuario" });
Comentario.belongsTo(Usuario, { foreignKey: "idUsuario" });

// Imagen - Comentario
Imagen.hasMany(Comentario, { foreignKey: "idImagen" });
Comentario.belongsTo(Imagen, { foreignKey: "idImagen" });

// Publicacion - Imagen
Publicacion.hasMany(Imagen, {
  as: "imagenes",
  foreignKey: "idPublicacion",
});
Imagen.belongsTo(Publicacion, { foreignKey: "idPublicacion" });

// Usuario - Interes
Usuario.hasMany(Interes, { foreignKey: "idUsuario" });
Interes.belongsTo(Usuario, { foreignKey: "idUsuario" });

// Imagen - Interes
Imagen.hasMany(Interes, { foreignKey: "idImagen" });
Interes.belongsTo(Imagen, { foreignKey: "idImagen" });

// Usuario - Rol
Usuario.belongsToMany(Rol, {
  through: UsuariosRoles,
  foreignKey: "idUsuario",
  otherKey: "idRol",
});

Rol.belongsToMany(Usuario, {
  through: UsuariosRoles,
  foreignKey: "idRol",
  otherKey: "idUsuario",
});

// Interes - Chat
Interes.hasOne(Chat, { foreignKey: "idInteres" });
Chat.belongsTo(Interes, { foreignKey: "idInteres" });

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
Chat.hasMany(Mensaje, { foreignKey: "idChat" });
Mensaje.belongsTo(Chat, { foreignKey: "idChat" });

// Usuario - Mensaje
Usuario.hasMany(Mensaje, { foreignKey: "idUsuario" });
Mensaje.belongsTo(Usuario, { foreignKey: "idUsuario" });

// Usuario - Valoracion
Usuario.hasMany(Valoracion, { foreignKey: "idUsuario" });
Valoracion.belongsTo(Usuario, { foreignKey: "idUsuario" });

// Imagen - Valoracion
Imagen.hasMany(Valoracion, { foreignKey: "idImagen" });
Valoracion.belongsTo(Imagen, { foreignKey: "idImagen" });

// Publicacion - Etiqueta
Publicacion.belongsToMany(Etiqueta, {
  through: "publicacionEtiqueta",
  foreignKey: "idPublicacion",
  otherKey: "idEtiqueta",
});

Etiqueta.belongsToMany(Publicacion, {
  through: "publicacionEtiqueta",
  foreignKey: "idEtiqueta",
  otherKey: "idPublicacion",
});

// Usuario - Coleccion
Usuario.hasMany(Coleccion, { foreignKey: "idUsuario" });
Coleccion.belongsTo(Usuario, { foreignKey: "idUsuario" });

// Coleccion - Publicacion
Coleccion.belongsToMany(Publicacion, {
  through: "coleccionPublicacion",
  foreignKey: "idColeccion",
  otherKey: "idPublicacion",
});

Publicacion.belongsToMany(Coleccion, {
  through: "coleccionPublicacion",
  foreignKey: "idPublicacion",
  otherKey: "idColeccion",
});

// Usuario - Seguimiento
Usuario.belongsToMany(Usuario, {
  through: Seguimiento,
  as: "seguidos",
  foreignKey: "idSeguidor",
  otherKey: "idSeguido",
});

Usuario.belongsToMany(Usuario, {
  through: Seguimiento,
  as: "seguidores",
  foreignKey: "idSeguido",
  otherKey: "idSeguidor",
});

// Usuario - Denuncia
Usuario.hasMany(Denuncia, {
  foreignKey: "idUsuario",
  as: "denunciasRealizadas",
});

Denuncia.belongsTo(Usuario, {
  foreignKey: "idUsuario",
  as: "denunciante",
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

// Publicacion - Denuncia
Publicacion.hasMany(Denuncia, {
  foreignKey: "idPublicacion",
});

Denuncia.belongsTo(Publicacion, {
  foreignKey: "idPublicacion",
  allowNull: true,
});

// Comentario - Denuncia
Comentario.hasMany(Denuncia, {
  foreignKey: "idComentario",
});

Denuncia.belongsTo(Comentario, {
  foreignKey: "idComentario",
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
