import { z } from "zod";

// REGISTRO DE USUARIO
export const registroSchema = z
  .object({
    username: z
      .string()
      .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
      .max(30, "El nombre de usuario no puede superar los 30 caracteres")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "El nombre de usuario solo puede contener letras, números y guiones bajos",
      ),

    name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(50, "El nombre no puede superar los 50 caracteres")
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "El nombre solo puede contener letras"),

    lastName: z
      .string()
      .min(2, "El apellido debe tener al menos 2 caracteres")
      .max(50, "El apellido no puede superar los 50 caracteres")
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "El apellido solo puede contener letras"),

    email: z
      .string()
      .email("El correo electrónico no es válido")
      .max(100, "El correo no puede superar los 100 caracteres"),

    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(72, "La contraseña no puede superar los 72 caracteres")
      .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
      .regex(/[0-9]/, "La contraseña debe contener al menos un número"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// LOGIN
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("El correo electrónico no es válido"),

  password: z.string().min(1, "La contraseña es obligatoria"),
});

// CREAR PUBLICACIÓN
export const publicacionSchema = z.object({
  titulo: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(100, "El título no puede superar los 100 caracteres"),

  descripcion: z
    .string()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .optional()
    .or(z.literal("")),

  etiquetas: z
    .string()
    .max(200, "Las etiquetas no pueden superar los 200 caracteres")
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val) return true;
      const tags = val
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      return tags.length <= 10;
    }, "No podés agregar más de 10 etiquetas")
    .refine((val) => {
      if (!val) return true;
      const tags = val
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      return tags.every((t) => t.length <= 30);
    }, "Cada etiqueta puede tener hasta 30 caracteres"),

  copyright: z.string().optional(),
});

// EDITAR PUBLICACIÓN
export const editarPublicacionSchema = z.object({
  titulo: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(100, "El título no puede superar los 100 caracteres"),

  descripcion: z
    .string()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .optional()
    .or(z.literal("")),

  etiquetas: z
    .string()
    .max(200, "Las etiquetas no pueden superar los 200 caracteres")
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val) return true;
      const tags = val
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      return tags.length <= 10;
    }, "No podés agregar más de 10 etiquetas")
    .refine((val) => {
      if (!val) return true;
      const tags = val
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      return tags.every((t) => t.length <= 30);
    }, "Cada etiqueta puede tener hasta 30 caracteres"),
});

export const editarPerfilSchema = z.object({
  username: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(30, "El nombre de usuario no puede superar los 30 caracteres")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "El nombre de usuario solo puede contener letras, números y guiones bajos",
    ),

  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede superar los 50 caracteres"),

  lastName: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede superar los 50 caracteres"),

  email: z
    .string()
    .email("El correo electrónico no es válido")
    .max(100, "El correo no puede superar los 100 caracteres"),

  bio: z
    .string()
    .max(200, "La biografía no puede superar los 200 caracteres")
    .optional()
    .or(z.literal("")),
});

// COMENTARIO
export const comentarioSchema = z.object({
  contenido: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(1, "El comentario no puede estar vacío")
        .max(300, "El comentario no puede superar los 300 caracteres"),
    ),
});

export function formatearErrores(zodError) {
  const errores = {};
  for (const issue of zodError.issues) {
    const campo = issue.path[issue.path.length - 1] ?? "general";
    if (!errores[campo]) {
      errores[campo] = issue.message;
    }
  }
  return errores;
}
