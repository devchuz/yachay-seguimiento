# yachay-seguimiento 🔎

> Página pública de seguimiento de solicitudes — UNCP.
> Parte del sistema Yachay · **Hackatón Transformagob 2026**

**Desarrollado por [devchuz](https://github.com/devchuz) · jhonrinconroman@gmail.com**

---

## ¿Qué hace este repo?

Es la página que recibe el comunero después de registrar su solicitud por WhatsApp. Con su código `UNCP-2026-XXXXX` puede ver en tiempo real en qué estado está su trámite, sin login, desde el celular.

Es el único punto de contacto visual del solicitante con el sistema (además del chat de WhatsApp).

---

## Funcionalidad

- Consulta por código `UNCP-2026-XXXXX` (sin login, público)
- **Timeline visual** con todos los cambios de estado del trámite
- Estado final destacado:
  - ✅ Verde → `admitido`
  - ❌ Rojo → `rechazado`
  - 🔄 En proceso → estados intermedios
- Muestra: nombre del solicitante, comunidad, facultad asignada, encargado (si hay), y cada entrada del historial con fecha y comentario
- Diseño responsive optimizado para celular (el comunero lo abre desde WhatsApp)

---

## Stack

| | |
|---|---|
| Framework | Remix (React Router v7) |
| Base de datos | Turso (libSQL) vía `@libsql/client` |
| Auth | Sin autenticación (público) |
| Deploy | Vercel |

---

## Estructura

```
yachay-seguimiento/
├── app/
│   ├── lib/
│   │   └── turso.server.ts        ← cliente Turso
│   ├── routes/
│   │   ├── _index.tsx             ← formulario de búsqueda por código
│   │   └── seguimiento.$codigo.tsx ← detalle + timeline del trámite
│   ├── root.tsx
│   └── app.css
└── .env
```

---

## Variables de entorno

Crear `.env` en la raíz del repo:

```env
# Turso (misma base que los otros repos)
TURSO_DATABASE_URL=libsql://yachay-uncp-<usuario>.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN=<token>
```

> La URL de Turso debe reemplazar `libsql://` → `https://` en el cliente (ya aplicado en `turso.server.ts`).

---

## Correr en local

```bash
# Instalar dependencias
npm install

# Arrancar en modo desarrollo
npm run dev -- --port 5174
# → http://localhost:5174
```

Usar el puerto `5174` para no colisionar con el dashboard en `:5173`.

---

## Despliegue en Vercel

```bash
# 1. Push al repo de GitHub
git push origin main

# 2. En Vercel: importar el repo, framework Remix/Vite
# 3. Agregar variables de entorno:
#    TURSO_DATABASE_URL
#    TURSO_AUTH_TOKEN
# 4. Deploy → copiar la URL pública
```

Después del deploy, actualizar `SEGUIMIENTO_URL` en el `.env` del backend (`yachay-app`) con la URL de Vercel. Esta URL es la que el bot incluye en el mensaje de confirmación al solicitante:

```
👉 Sigue tu solicitud aquí:
https://yachay-seguimiento.vercel.app/seguimiento/UNCP-2026-00042
```

---

## Conexión con los otros repos

Este repo **solo lee** de Turso. No escribe nada. Las escrituras las hace `yachay-app` (backend).

```
yachay-app  →  INSERT/UPDATE Turso  ←─ yachay-seguimiento (solo SELECT)
                                    ←─ yachay-dashboard   (SELECT + UPDATE)
```

---

## Repos relacionados

| Repo | Descripción |
|---|---|
| [`yachay-app`](https://github.com/devchuz/yachay-app) | Backend Python (FastAPI + LangGraph + clasificador) |
| [`yachay-dashboard`](https://github.com/devchuz/yachay-dashboard) | Panel interno para la secretaría (Remix + Clerk) |

Los 3 repos comparten la misma base Turso (`TURSO_DATABASE_URL`).