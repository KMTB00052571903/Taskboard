# Task Board — Evaluación Parcial

## Instrucciones

Aplicación de tablero de tareas colaborativo en tiempo real. El sistema permite crear boards con tareas que pueden estar en estado **TODO**, **IN_PROGRESS** o **COMPLETED**.

### Configuración de variables de entorno

Cada carpeta (`server/` y `client/`) tiene su propio archivo `.env.example`. Debes crear un `.env` en cada una con los valores reales:

```bash
# En server/
cp server/.env.example server/.env
# Editar server/.env con los valores de Supabase

# En client/
cp client/.env.example client/.env
# Editar client/.env con los valores de Supabase
```

### Cómo ejecutar

```bash
npm run install:all
npm run dev
```

- Client: http://localhost:3001
- Server: http://localhost:3000

### Cómo ejecutar los tests

```bash
npm run test
```

---

## Requerimientos

### 1. Broadcast `task-created` al crear una tarea

Cuando se crea una tarea a través de `POST /api/boards/:boardId/tasks`, el servidor debe hacer un **broadcast** al canal `board:{boardId}` con el evento `task-created` y el objeto de la tarea como payload.

**Comportamiento esperado:**

- El servidor debe enviar el broadcast usando Supabase Realtime después de insertar la tarea
- El canal debe ser `board:{boardId}` donde `boardId` es el ID del board al que pertenece la tarea
- El evento debe ser `task-created`
- El payload debe contener el objeto de la tarea creada

---

### 2. Broadcast `task-deleted` al eliminar una tarea

Cuando se elimina una tarea a través de `DELETE /api/boards/:boardId/tasks/:taskId`, el servidor debe hacer un **broadcast** al canal `board:{boardId}` con el evento `task-deleted`.

**Comportamiento esperado:**

- El servidor debe enviar el broadcast después de eliminar la tarea
- El canal debe ser `board:{boardId}`
- El evento debe ser `task-deleted`
- El payload debe contener `{ taskId }` con el ID de la tarea eliminada

---

### 3. Broadcast `task-updated` al cambiar el estado de una tarea

Cuando se actualiza el estado de una tarea a través de `PATCH /api/boards/:boardId/tasks/:taskId`, el servidor debe hacer un **broadcast** al canal `board:{boardId}` con el evento `task-updated`.

**Comportamiento esperado:**

- El servidor debe enviar el broadcast después de actualizar la tarea
- El canal debe ser `board:{boardId}`
- El evento debe ser `task-updated`
- El payload debe contener el objeto de la tarea actualizada
