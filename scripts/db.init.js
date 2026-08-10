import "dotenv/config";
import { connectDatabase } from "../models/sync.js";
import { Usuario } from "../models/usuario.js";
import { Rol } from "../models/rol.js";
import { UsuariosRoles } from "../models/usuariosRoles.js";
import { Publicacion } from "../models/publicacion.js";
import { Imagen } from "../models/imagen.js";
import { Etiqueta } from "../models/etiqueta.js";
import { Comentario } from "../models/comentario.js";
import { Valoracion } from "../models/valoracion.js";
import { Seguimiento } from "../models/seguimiento.js";

console.log("Iniciando configuración de la base de datos...\n");

await connectDatabase();

// ─────────────────────────────────────────────
// ROLES
// ─────────────────────────────────────────────
console.log("Creando roles...");

const [rolUsuario] = await Rol.findOrCreate({ where: { nombre: "usuario" } });
const [rolValidador] = await Rol.findOrCreate({ where: { nombre: "validador" } });
const [rolAdmin] = await Rol.findOrCreate({ where: { nombre: "admin" } });

console.log("   Roles creados\n");

// ─────────────────────────────────────────────
// USUARIOS
// ─────────────────────────────────────────────
console.log("Creando usuarios de prueba...");

const [admin] = await Usuario.findOrCreate({
  where: { email: "admin@fotaza.com" },
  defaults: {
    name: "Admin",
    lastName: "Fotaza",
    username: "admin",
    password: "Admin1234",
    bio: "Administrador de la plataforma Fotaza.",
  },
});

const [validador] = await Usuario.findOrCreate({
  where: { email: "validador@fotaza.com" },
  defaults: {
    name: "Carlos",
    lastName: "Validador",
    username: "validador",
    password: "Validador1234",
    bio: "Validador de contenidos de la plataforma.",
  },
});

const [usuario1] = await Usuario.findOrCreate({
  where: { email: "juan@fotaza.com" },
  defaults: {
    name: "Juan",
    lastName: "Perez",
    username: "juanperez",
    password: "Usuario1234",
    bio: "Fotografo aficionado. Me encantan los paisajes y la naturaleza.",
  },
});

const [usuario2] = await Usuario.findOrCreate({
  where: { email: "maria@fotaza.com" },
  defaults: {
    name: "Maria",
    lastName: "Gonzalez",
    username: "mariagonzalez",
    password: "Usuario1234",
    bio: "Amante de la fotografia urbana y los retratos.",
  },
});

// Asignar roles
await UsuariosRoles.findOrCreate({ where: { idUsuario: admin.id, idRol: rolAdmin.id } });
await UsuariosRoles.findOrCreate({ where: { idUsuario: validador.id, idRol: rolValidador.id } });
await UsuariosRoles.findOrCreate({ where: { idUsuario: usuario1.id, idRol: rolUsuario.id } });
await UsuariosRoles.findOrCreate({ where: { idUsuario: usuario2.id, idRol: rolUsuario.id } });

console.log("   Usuarios creados y roles asignados\n");

// ─────────────────────────────────────────────
// ETIQUETAS
// ─────────────────────────────────────────────
console.log("Creando etiquetas...");

const etiquetasNombres = [
  "naturaleza", "paisaje", "ciudad", "retrato",
  "viaje", "arquitectura", "fotografia", "arte",
];

const etiquetas = {};
for (const nombre of etiquetasNombres) {
  const [etiqueta] = await Etiqueta.findOrCreate({ where: { nombre } });
  etiquetas[nombre] = etiqueta;
}

console.log("   Etiquetas creadas\n");

// ─────────────────────────────────────────────
// IMAGEN PLACEHOLDER (1x1 pixel JPEG válido)
// ─────────────────────────────────────────────
const imagenPlaceholder = Buffer.from(
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U" +
  "HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN" +
  "DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy" +
  "MjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAA" +
  "AAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA" +
  "/9oADAMBAAIRAxEAPwCwABmX/9k=",
  "base64",
);

// ─────────────────────────────────────────────
// PUBLICACIONES
// ─────────────────────────────────────────────
console.log("Creando publicaciones de ejemplo...");

// Publicacion 1 — usuario1
const [pub1, pub1Nueva] = await Publicacion.findOrCreate({
  where: { titulo: "Atardecer en las sierras" },
  defaults: {
    descripcion: "Una tarde perfecta entre las montañas de Córdoba.",
    idUsuario: usuario1.id,
    comentariosActivo: true,
  },
});

if (pub1Nueva) {
  const img1 = await Imagen.create({
    url: imagenPlaceholder,
    copyright: false,
    idPublicacion: pub1.id,
  });
  await pub1.addEtiqueta(etiquetas["naturaleza"]);
  await pub1.addEtiqueta(etiquetas["paisaje"]);

  await Comentario.create({
    contenido: "¡Qué foto tan hermosa!",
    idImagen: img1.id,
    idUsuario: usuario2.id,
  });

  await Valoracion.create({ puntaje: 5, idUsuario: usuario2.id, idImagen: img1.id });
  await Valoracion.create({ puntaje: 4, idUsuario: admin.id, idImagen: img1.id });
}

// Publicacion 2 — usuario1
const [pub2, pub2Nueva] = await Publicacion.findOrCreate({
  where: { titulo: "Calles de Buenos Aires" },
  defaults: {
    descripcion: "El encanto de la ciudad a la hora dorada.",
    idUsuario: usuario1.id,
    comentariosActivo: true,
  },
});

if (pub2Nueva) {
  const img2 = await Imagen.create({
    url: imagenPlaceholder,
    copyright: true,
    idPublicacion: pub2.id,
  });
  await pub2.addEtiqueta(etiquetas["ciudad"]);
  await pub2.addEtiqueta(etiquetas["viaje"]);

  await Comentario.create({
    contenido: "Me encanta la luz de esta foto.",
    idImagen: img2.id,
    idUsuario: usuario2.id,
  });

  await Valoracion.create({ puntaje: 4, idUsuario: usuario2.id, idImagen: img2.id });
}

// Publicacion 3 — usuario2
const [pub3, pub3Nueva] = await Publicacion.findOrCreate({
  where: { titulo: "Retrato urbano" },
  defaults: {
    descripcion: "Capturando expresiones en la ciudad.",
    idUsuario: usuario2.id,
    comentariosActivo: true,
  },
});

if (pub3Nueva) {
  const img3 = await Imagen.create({
    url: imagenPlaceholder,
    copyright: false,
    idPublicacion: pub3.id,
  });
  await pub3.addEtiqueta(etiquetas["retrato"]);
  await pub3.addEtiqueta(etiquetas["arte"]);

  await Comentario.create({
    contenido: "Composición increíble.",
    idImagen: img3.id,
    idUsuario: usuario1.id,
  });

  await Valoracion.create({ puntaje: 5, idUsuario: usuario1.id, idImagen: img3.id });
  await Valoracion.create({ puntaje: 3, idUsuario: usuario2.id, idImagen: img3.id });
}

// Publicacion 4 — usuario2
const [pub4, pub4Nueva] = await Publicacion.findOrCreate({
  where: { titulo: "Arquitectura moderna" },
  defaults: {
    descripcion: "Líneas y formas del diseño contemporáneo.",
    idUsuario: usuario2.id,
    comentariosActivo: true,
  },
});

if (pub4Nueva) {
  const img4 = await Imagen.create({
    url: imagenPlaceholder,
    copyright: false,
    idPublicacion: pub4.id,
  });
  await pub4.addEtiqueta(etiquetas["arquitectura"]);
  await pub4.addEtiqueta(etiquetas["fotografia"]);

  await Valoracion.create({ puntaje: 4, idUsuario: usuario1.id, idImagen: img4.id });
}

console.log("   Publicaciones creadas\n");

// ─────────────────────────────────────────────
// SEGUIMIENTOS
// ─────────────────────────────────────────────
console.log("Creando seguimientos de ejemplo...");

await Seguimiento.findOrCreate({
  where: { idSeguidor: usuario1.id, idSeguido: usuario2.id },
});
await Seguimiento.findOrCreate({
  where: { idSeguidor: usuario2.id, idSeguido: usuario1.id },
});

console.log("   Seguimientos creados\n");

// ─────────────────────────────────────────────
// RESUMEN
// ─────────────────────────────────────────────
console.log("═══════════════════════════════════════════");
console.log("✅ Base de datos inicializada correctamente");
console.log("═══════════════════════════════════════════\n");
console.log("Usuarios de prueba:\n");
console.log("  Rol: admin       | admin@fotaza.com       | Admin1234");
console.log("  Rol: validador   | validador@fotaza.com   | Validador1234");
console.log("  Rol: usuario     | juan@fotaza.com        | Usuario1234");
console.log("  Rol: usuario     | maria@fotaza.com       | Usuario1234\n");

process.exit(0);
