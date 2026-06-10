import "dotenv/config";
import { connectDatabase } from "../models/sync.js";
import { Usuario } from "../models/usuario.js";
import { Publicacion } from "../models/publicacion.js";
import { Imagen } from "../models/imagen.js";
import { Etiqueta } from "../models/etiqueta.js";
import { Comentario } from "../models/comentario.js";
import { Valoracion } from "../models/valoracion.js";
import { Seguimiento } from "../models/seguimiento.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("Iniciando configuración de la base de datos...\n");

await connectDatabase();

// USUARIOS DE PRUEBA
console.log("Creando usuarios de prueba...");

const [admin] = await Usuario.findOrCreate({
  where: { email: "admin@fotaza.com" },
  defaults: {
    name: "Admin",
    lastName: "Fotaza",
    username: "admin",
    password: "Admin1234",
    rol: "admin",
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
    rol: "validador",
    bio: "Validador de contenidos de la plataforma.",
  },
});

const [usuario1] = await Usuario.findOrCreate({
  where: { email: "juan@fotaza.com" },
  defaults: {
    name: "Juan",
    lastName: "Pérez",
    username: "juanperez",
    password: "Usuario1234",
    rol: "usuario",
    bio: "Fotógrafo aficionado. Me encantan los paisajes y la naturaleza.",
  },
});

const [usuario2] = await Usuario.findOrCreate({
  where: { email: "maria@fotaza.com" },
  defaults: {
    name: "María",
    lastName: "González",
    username: "mariagonzalez",
    password: "Usuario1234",
    rol: "usuario",
    bio: "Amante de la fotografía urbana y los retratos.",
  },
});

console.log("   ✓ Usuarios creados\n");

// ETIQUETAS
console.log("🏷️  Creando etiquetas...");

const etiquetasNombres = [
  "naturaleza",
  "paisaje",
  "ciudad",
  "retrato",
  "viaje",
  "arquitectura",
  "fotografia",
  "arte",
];

const etiquetas = {};
for (const nombre of etiquetasNombres) {
  const [etiqueta] = await Etiqueta.findOrCreate({ where: { nombre } });
  etiquetas[nombre] = etiqueta;
}

console.log("   ✓ Etiquetas creadas\n");

const imagenPlaceholder = Buffer.from(
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U" +
    "HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN" +
    "DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy" +
    "MjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAA" +
    "AAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA" +
    "/9oADAMBAAIRAxEAPwCwABmX/9k=",
  "base64",
);

// PUBLICACIONES DE EJEMPLO
console.log("📸 Creando publicaciones de ejemplo...");

// Publicación 1 — usuario1
const [pub1, pub1Nueva] = await Publicacion.findOrCreate({
  where: { titulo: "Atardecer en las sierras" },
  defaults: {
    descripcion: "Una tarde perfecta entre las montañas de Córdoba.",
    UsuarioId: usuario1.id,
    comentariosActivo: true,
  },
});

if (pub1Nueva) {
  const img1 = await Imagen.create({
    url: imagenPlaceholder,
    copyright: false,
    PublicacionId: pub1.id,
  });
  await pub1.addEtiqueta(etiquetas["naturaleza"]);
  await pub1.addEtiqueta(etiquetas["paisaje"]);

  // Comentario de usuario2 sobre pub1
  const com1 = await Comentario.create({ contenido: "¡Qué foto tan hermosa!" });
  await com1.setUsuario(usuario2.id);
  await com1.setImagen(img1.id);

  // Valoración de usuario2 sobre img1
  await Valoracion.create({
    puntaje: 5,
    UsuarioId: usuario2.id,
    ImagenId: img1.id,
  });

  // Valoración del admin sobre img1
  await Valoracion.create({
    puntaje: 4,
    UsuarioId: admin.id,
    ImagenId: img1.id,
  });
}

// Publicación 2 — usuario1
const [pub2, pub2Nueva] = await Publicacion.findOrCreate({
  where: { titulo: "Calles de Buenos Aires" },
  defaults: {
    descripcion: "El encanto de la ciudad a la hora dorada.",
    UsuarioId: usuario1.id,
    comentariosActivo: true,
  },
});

if (pub2Nueva) {
  const img2 = await Imagen.create({
    url: imagenPlaceholder,
    copyright: true,
    PublicacionId: pub2.id,
  });
  await pub2.addEtiqueta(etiquetas["ciudad"]);
  await pub2.addEtiqueta(etiquetas["viaje"]);

  const com2 = await Comentario.create({
    contenido: "Me encanta la luz de esta foto.",
  });
  await com2.setUsuario(admin.id);
  await com2.setImagen(img2.id);

  await Valoracion.create({
    puntaje: 4,
    UsuarioId: usuario2.id,
    ImagenId: img2.id,
  });
}

// Publicación 3 — usuario2
const [pub3, pub3Nueva] = await Publicacion.findOrCreate({
  where: { titulo: "Retrato urbano" },
  defaults: {
    descripcion: "Capturando expresiones en la ciudad.",
    UsuarioId: usuario2.id,
    comentariosActivo: true,
  },
});

if (pub3Nueva) {
  const img3 = await Imagen.create({
    url: imagenPlaceholder,
    copyright: false,
    PublicacionId: pub3.id,
  });
  await pub3.addEtiqueta(etiquetas["retrato"]);
  await pub3.addEtiqueta(etiquetas["arte"]);

  const com3 = await Comentario.create({ contenido: "Composición increíble." });
  await com3.setUsuario(usuario1.id);
  await com3.setImagen(img3.id);

  await Valoracion.create({
    puntaje: 5,
    UsuarioId: usuario1.id,
    ImagenId: img3.id,
  });
  await Valoracion.create({
    puntaje: 3,
    UsuarioId: admin.id,
    ImagenId: img3.id,
  });
}

console.log("Publicaciones creadas\n");

// SEGUIMIENTOS DE EJEMPLO
console.log("👥 Creando seguimientos de ejemplo...");

await Seguimiento.findOrCreate({
  where: { idSeguidor: usuario1.id, idSeguido: usuario2.id },
});
await Seguimiento.findOrCreate({
  where: { idSeguidor: usuario2.id, idSeguido: usuario1.id },
});
await Seguimiento.findOrCreate({
  where: { idSeguidor: admin.id, idSeguido: usuario1.id },
});

console.log("Seguimientos creados\n");
