# Fotaza 2 — Plataforma de fotografía

Trabajo Práctico Integrador — Programación Web II  
Desarrollador de Software — Universidad de La Punta  
Autor: **Leyes Leandro**

---

## Descripción

Fotaza 2 es una plataforma web de fotografía inspirada en Instagram. Permite a los usuarios publicar imágenes, comentar, valorar contenido, seguir a otros usuarios y buscar publicaciones. Construida con Node.js, Express, PUG y PostgreSQL.

---

## Tecnologías utilizadas

- **Backend:** Node.js + Express 5
- **Vistas:** PUG (server-side rendering)
- **Base de datos:** PostgreSQL + Sequelize ORM
- **Autenticación:** express-session + bcrypt
- **Procesamiento de imágenes:** Sharp + Multer
- **Estilos:** Bootstrap 5 + CSS personalizado

---

## Requisitos previos

- Node.js v18 o superior
- PostgreSQL 14 o superior
- npm

---

## Instalación y puesta en marcha

Seguí estos pasos en orden:

### 1. Clonar el repositorio

```bash
git clone https://github.com/LeandroLeyes/Tpi_Fotaza.git
cd Tpi_Fotaza
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiá el archivo de ejemplo y completá los valores:

```bash
cp .env.example .env
```

Editá `.env` con los datos de tu base de datos PostgreSQL:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fotaza
DB_USER=postgres
DB_PASSWORD=tu_password
SESSION_SECRET=un_string_largo_y_aleatorio
```

> **Nota:** la base de datos `fotaza` debe existir antes de correr el init. Podés crearla con:
>
> ```sql
> CREATE DATABASE fotaza;
> ```

### 4. Inicializar la base de datos

```bash
npm run db:init
```

Este comando crea todas las tablas y carga usuarios de prueba, publicaciones, comentarios, valoraciones y seguimientos de ejemplo.

### 5. Iniciar la aplicación

```bash
npm start
```

La aplicación queda disponible en: **http://localhost:3000**

---

## Usuarios de prueba

| Rol       | Email                | Password      |
| --------- | -------------------- | ------------- |
| admin     | admin@fotaza.com     | Admin1234     |
| validador | validador@fotaza.com | Validador1234 |
| usuario   | juan@fotaza.com      | Usuario1234   |
| usuario   | maria@fotaza.com     | Usuario1234   |

---

## Funcionalidades implementadas

### Autenticación

- Registro e inicio de sesión con email y contraseña
- Contraseñas encriptadas con bcrypt
- Sesiones con express-session
- Middleware de protección de rutas por autenticación y rol

### Publicaciones

- Creación con título, descripción, una o más imágenes y etiquetas
- Carrusel de imágenes cuando hay más de una
- Marca de agua con copyright procesada con Sharp
- El autor puede abrir o cerrar comentarios de su publicación

### Búsqueda

- Buscador accesible desde la barra superior
- Filtra por título, etiquetas y nombre de usuario simultáneamente
- Resultados agrupados: publicaciones, etiquetas y usuarios

### Comentarios

- Usuarios autenticados pueden comentar cualquier publicación
- Se muestra avatar y username del comentarista
- El autor puede cerrar los comentarios en cualquier momento

### Valoraciones

- Puntaje del 1 al 5 estrellas por imagen
- Un usuario solo puede valorar una vez (se actualiza si vuelve a votar)
- El autor no puede valorar su propia publicación
- Muestra promedio y cantidad de valoraciones

### Seguimiento de usuarios

- Seguir y dejar de seguir a otros usuarios
- El perfil muestra cantidad de seguidores y seguidos
- Sección "Usuarios que sigo" con el feed de publicaciones de seguidos
- Un usuario no puede seguirse a sí mismo ni seguir al mismo usuario dos veces

### Perfiles

- Edición de nombre, bio y avatar
- Vista del perfil ajeno con botón seguir/dejar de seguir

### Roles

- **usuario:** puede publicar, comentar, valorar, seguir y buscar
- **validador:** puede gestionar denuncias y dar de baja publicaciones
- **admin:** acceso completo a la plataforma

---

## Estructura del proyecto

```
Tpi_Fotaza/
├── app.js
├── package.json
├── .env.example
├── scripts/
│   └── db.init.js
├── controllers/
│   ├── auth.controller.js
│   ├── busqueda.controller.js
│   ├── publicacion.controller.js
│   └── usuario.controller.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── rol.midddleware.js
│   ├── sesion.middleware.js
│   └── upload.middleware.js
├── models/
│   ├── config.js
│   ├── sync.js
│   └── (resto de modelos)
├── routes/
│   ├── views.routes.js
│   ├── auth.routes.js
│   ├── busqueda.routes.js
│   ├── landing.routes.js
│   └── usuario.routes.js
├── views/
│   ├── auth/
│   ├── landing/
│   ├── partials/
│   ├── usuario/
│   ├── admin/
│   └── validador/
└── public/
    ├── css/
    └── images/
```

---

## Problemas encontrados y soluciones

### Imágenes como BLOB

PostgreSQL devuelve los campos BLOB como objetos Buffer de Node.js. Las vistas PUG no pueden usarlos directamente en `src=""`. Se creó una función helper `blobABase64(blob)` en cada controller que convierte el buffer al formato `data:image/jpeg;base64,...` antes de pasarlo a la vista.

### Datos faltantes en sesión

Al iniciar sesión solo se guardaban `id` y `avatar` en `req.session.usuario`. Varios controllers usaban `req.session.usuario.username` (para la marca de agua, entre otros), devolviendo `undefined`. Se amplió el objeto de sesión para incluir `username`, `name` y `rol`.

### Seguimiento con soft delete

Al implementar "dejar de seguir" con el modelo usando `paranoid: true`, el registro quedaba con `deletedAt` en lugar de eliminarse. Si el usuario volvía a seguir, `findOrCreate` no lo encontraba porque el registro borrado lógicamente no aparece por defecto. Se resolvió con `findOne({ paranoid: false })` y llamando a `restore()` si `deletedAt` estaba seteado.

### Múltiples imágenes por publicación

Originalmente el formulario permitía solo una imagen. Se migró a `upload.array("imagenes", 10)` con multer y se adaptó el controller para iterar `req.files` y crear una fila en `imagenes` por cada archivo.

---

## Servidor en producción

La aplicación está desplegada en: _(completar con la URL del servidor)_
