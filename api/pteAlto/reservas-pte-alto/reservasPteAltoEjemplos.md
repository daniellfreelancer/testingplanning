# 📚 Documentación de API - Sistema de Reservas PTE Alto

## 🔐 Autenticación

Todas las rutas que requieren autenticación necesitan el token JWT en el header:

```
Authorization: Bearer <token>
```

Para obtener el token, usar el endpoint de login:
```
POST /pte-alto/login-usuario
```

---

## 📋 Índice de Endpoints

### Consulta de Disponibilidad (Públicas)
1. [Consultar Disponibilidad por Deporte](#1-consultar-disponibilidad-por-deporte)
2. [Consultar Disponibilidad por Fecha](#2-consultar-disponibilidad-por-fecha)
3. [Verificar Disponibilidad de Rango](#3-verificar-disponibilidad-de-rango)

### Reservas de Usuario (Requieren Autenticación)
4. [Crear Reserva de Espacio](#4-crear-reserva-de-espacio)
5. [Inscribirse en Taller](#5-inscribirse-en-taller)
6. [Listar Mis Reservas](#6-listar-mis-reservas)
7. [Cancelar Reserva](#7-cancelar-reserva)

### Administración (Requieren Rol Admin)
8. [Listar Todas las Reservas](#8-listar-todas-las-reservas-admin)
9. [Obtener Reserva por ID](#9-obtener-reserva-por-id-admin)
10. [Cancelar Reserva (Admin)](#10-cancelar-reserva-admin)

---

## 🔍 Endpoints de Consulta de Disponibilidad

### 1. Consultar Disponibilidad por Deporte

**Endpoint:** `GET /reservas-pte-alto/disponibilidad-por-deporte`

**Descripción:** Consulta espacios disponibles filtrados por deporte en un rango de fechas.

**Query Parameters:**
- `deporte` (requerido): Nombre del deporte (ej: "futbol", "basquetbol")
- `fechaInicio` (opcional): Fecha de inicio (ISO 8601). Default: hoy
- `fechaFin` (opcional): Fecha de fin (ISO 8601). Default: +30 días

**Ejemplo Request (Postman):**
```
GET http://localhost:3000/reservas-pte-alto/disponibilidad-por-deporte?deporte=futbol&fechaInicio=2025-01-15&fechaFin=2025-01-30
```

**Ejemplo Request (cURL):**
```bash
curl -X GET "http://localhost:3000/reservas-pte-alto/disponibilidad-por-deporte?deporte=futbol&fechaInicio=2025-01-15&fechaFin=2025-01-30"
```

**Response 200 (Success):**
```json
{
  "success": true,
  "espacios": [
    {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "nombre": "Cancha de Fútbol 1",
      "descripcion": "Cancha de fútbol 11 con césped sintético",
      "deporte": "futbol",
      "complejoDeportivo": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "nombre": "Complejo Deportivo Central"
      },
      "disponibilidad": {
        "total": 360,
        "ocupados": 45,
        "disponibles": 315,
        "porcentaje": "87.50"
      },
      "proximosDisponibles": [
        {
          "fecha": "2025-01-15T00:00:00.000Z",
          "horarios": []
        }
      ]
    }
  ]
}
```

**Response 400 (Error):**
```json
{
  "success": false,
  "message": "El parámetro 'deporte' es requerido"
}
```

---

### 2. Consultar Disponibilidad por Fecha

**Endpoint:** `GET /reservas-pte-alto/disponibilidad-por-fecha`

**Descripción:** Consulta espacios disponibles para una fecha específica, mostrando slots horarios disponibles.

**Query Parameters:**
- `fecha` (requerido): Fecha a consultar (YYYY-MM-DD)
- `deporte` (opcional): Filtrar por deporte
- `complejoDeportivo` (opcional): Filtrar por complejo deportivo (ObjectId)

**Ejemplo Request (Postman):**
```
GET http://localhost:3000/reservas-pte-alto/disponibilidad-por-fecha?fecha=2025-01-15&deporte=futbol
```

**Ejemplo Request (cURL):**
```bash
curl -X GET "http://localhost:3000/reservas-pte-alto/disponibilidad-por-fecha?fecha=2025-01-15&deporte=futbol"
```

**Response 200 (Success):**
```json
{
  "success": true,
  "fecha": "2025-01-15",
  "espacios": [
    {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "nombre": "Cancha de Fútbol 1",
      "deporte": "futbol",
      "slotsDisponibles": [
        {
          "inicio": "08:00",
          "fin": "09:00",
          "disponible": true
        },
        {
          "inicio": "09:00",
          "fin": "10:00",
          "disponible": true
        },
        {
          "inicio": "10:00",
          "fin": "11:00",
          "disponible": false
        },
        {
          "inicio": "11:00",
          "fin": "12:00",
          "disponible": false
        },
        {
          "inicio": "12:00",
          "fin": "13:00",
          "disponible": true
        }
      ],
      "horariosOcupados": [
        {
          "inicio": "2025-01-15T10:00:00.000Z",
          "fin": "2025-01-15T12:00:00.000Z",
          "tipo": "reserva",
          "nombre": "Juan Pérez"
        },
        {
          "inicio": "2025-01-15T14:00:00.000Z",
          "fin": "2025-01-15T16:00:00.000Z",
          "tipo": "taller",
          "nombre": "Taller de Fútbol Juvenil"
        }
      ]
    }
  ]
}
```

**Response 400 (Error):**
```json
{
  "success": false,
  "message": "El parámetro 'fecha' es requerido"
}
```

---

### 3. Verificar Disponibilidad de Rango

**Endpoint:** `GET /reservas-pte-alto/verificar-disponibilidad`

**Descripción:** Verifica si un espacio está disponible en un rango de fechas/horas específico antes de crear la reserva.

**Query Parameters:**
- `espacioDeportivo` (requerido): ID del espacio deportivo (ObjectId)
- `fechaInicio` (requerido): Fecha y hora de inicio (ISO 8601)
- `fechaFin` (requerido): Fecha y hora de fin (ISO 8601)

**Ejemplo Request (Postman):**
```
GET http://localhost:3000/reservas-pte-alto/verificar-disponibilidad?espacioDeportivo=65a1b2c3d4e5f6g7h8i9j0k1&fechaInicio=2025-01-15T10:00:00Z&fechaFin=2025-01-15T12:00:00Z
```

**Ejemplo Request (cURL):**
```bash
curl -X GET "http://localhost:3000/reservas-pte-alto/verificar-disponibilidad?espacioDeportivo=65a1b2c3d4e5f6g7h8i9j0k1&fechaInicio=2025-01-15T10:00:00Z&fechaFin=2025-01-15T12:00:00Z"
```

**Response 200 (Disponible):**
```json
{
  "success": true,
  "disponible": true,
  "espacioDeportivo": "65a1b2c3d4e5f6g7h8i9j0k1",
  "fechaInicio": "2025-01-15T10:00:00.000Z",
  "fechaFin": "2025-01-15T12:00:00.000Z",
  "conflictos": []
}
```

**Response 200 (No Disponible):**
```json
{
  "success": true,
  "disponible": false,
  "espacioDeportivo": "65a1b2c3d4e5f6g7h8i9j0k1",
  "fechaInicio": "2025-01-15T10:00:00.000Z",
  "fechaFin": "2025-01-15T12:00:00.000Z",
  "conflictos": [
    {
      "tipo": "reserva",
      "id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "fechaInicio": "2025-01-15T10:30:00.000Z",
      "fechaFin": "2025-01-15T11:30:00.000Z",
      "nombre": "Juan Pérez"
    },
    {
      "tipo": "taller",
      "id": "65a1b2c3d4e5f6g7h8i9j0k4",
      "fechaInicio": "2025-01-15T14:00:00.000Z",
      "fechaFin": "2025-01-15T16:00:00.000Z",
      "nombre": "Taller de Fútbol Juvenil"
    }
  ]
}
```

**Response 400 (Error):**
```json
{
  "success": false,
  "message": "Los parámetros 'espacioDeportivo', 'fechaInicio' y 'fechaFin' son requeridos"
}
```

---

## 👤 Endpoints de Usuario (Requieren Autenticación)

### 4. Crear Reserva de Espacio

**Endpoint:** `POST /reservas-pte-alto/crear-reserva-espacio`

**Descripción:** Crea una reserva de espacio deportivo para el usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "espacioDeportivo": "65a1b2c3d4e5f6g7h8i9j0k1",
  "fechaInicio": "2025-01-15T10:00:00Z",
  "fechaFin": "2025-01-15T12:00:00Z",
  "notas": "Reserva para partido amistoso"
}
```

**Campos:**
- `espacioDeportivo` (requerido): ID del espacio deportivo (ObjectId)
- `fechaInicio` (requerido): Fecha y hora de inicio (ISO 8601)
- `fechaFin` (requerido): Fecha y hora de fin (ISO 8601)
- `notas` (opcional): Observaciones sobre la reserva

**Ejemplo Request (Postman):**
```
POST http://localhost:3000/reservas-pte-alto/crear-reserva-espacio
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json

Body (raw JSON):
{
  "espacioDeportivo": "65a1b2c3d4e5f6g7h8i9j0k1",
  "fechaInicio": "2025-01-15T10:00:00Z",
  "fechaFin": "2025-01-15T12:00:00Z",
  "notas": "Reserva para partido amistoso"
}
```

**Ejemplo Request (cURL):**
```bash
curl -X POST "http://localhost:3000/reservas-pte-alto/crear-reserva-espacio" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "espacioDeportivo": "65a1b2c3d4e5f6g7h8i9j0k1",
    "fechaInicio": "2025-01-15T10:00:00Z",
    "fechaFin": "2025-01-15T12:00:00Z",
    "notas": "Reserva para partido amistoso"
  }'
```

**Response 201 (Success):**
```json
{
  "success": true,
  "message": "Reserva creada correctamente",
  "reserva": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "usuario": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k6",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan.perez@example.com"
    },
    "espacioDeportivo": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "nombre": "Cancha de Fútbol 1",
      "deporte": "futbol"
    },
    "fechaInicio": "2025-01-15T10:00:00.000Z",
    "fechaFin": "2025-01-15T12:00:00.000Z",
    "tipoReserva": "espacio",
    "estado": "activa",
    "notas": "Reserva para partido amistoso",
    "createdAt": "2025-01-10T08:30:00.000Z",
    "updatedAt": "2025-01-10T08:30:00.000Z"
  }
}
```

**Response 409 (Conflict - Espacio no disponible):**
```json
{
  "success": false,
  "message": "El espacio no está disponible en el rango solicitado",
  "conflictos": [
    {
      "tipo": "reserva",
      "id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "fechaInicio": "2025-01-15T10:30:00.000Z",
      "fechaFin": "2025-01-15T11:30:00.000Z",
      "nombre": "María González"
    }
  ]
}
```

**Response 403 (Usuario no validado):**
```json
{
  "success": false,
  "message": "Usuario no validado. Debe esperar la validación de un administrador"
}
```

---

### 5. Inscribirse en Taller

**Endpoint:** `POST /reservas-pte-alto/inscribirse-taller`

**Descripción:** Inscribe al usuario autenticado en un taller deportivo.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "taller": "65a1b2c3d4e5f6g7h8i9j0k7"
}
```

**Campos:**
- `taller` (requerido): ID del taller deportivo (ObjectId)

**Ejemplo Request (Postman):**
```
POST http://localhost:3000/reservas-pte-alto/inscribirse-taller
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json

Body (raw JSON):
{
  "taller": "65a1b2c3d4e5f6g7h8i9j0k7"
}
```

**Ejemplo Request (cURL):**
```bash
curl -X POST "http://localhost:3000/reservas-pte-alto/inscribirse-taller" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "taller": "65a1b2c3d4e5f6g7h8i9j0k7"
  }'
```

**Response 201 (Success):**
```json
{
  "success": true,
  "message": "Inscripción al taller realizada correctamente",
  "reserva": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k8",
    "usuario": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k6",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan.perez@example.com"
    },
    "taller": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k7",
      "nombre": "Taller de Fútbol Juvenil",
      "fechaInicio": "2025-01-20T14:00:00.000Z",
      "fechaFin": "2025-03-20T16:00:00.000Z"
    },
    "espacioDeportivo": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "nombre": "Cancha de Fútbol 1",
      "deporte": "futbol"
    },
    "fechaInicio": "2025-01-20T14:00:00.000Z",
    "fechaFin": "2025-03-20T16:00:00.000Z",
    "tipoReserva": "taller",
    "estado": "activa",
    "createdAt": "2025-01-10T08:35:00.000Z",
    "updatedAt": "2025-01-10T08:35:00.000Z"
  }
}
```

**Response 409 (Ya inscrito):**
```json
{
  "success": false,
  "message": "Ya estás inscrito en este taller"
}
```

**Response 409 (Capacidad máxima):**
```json
{
  "success": false,
  "message": "El taller ha alcanzado su capacidad máxima"
}
```

---

### 6. Listar Mis Reservas

**Endpoint:** `GET /reservas-pte-alto/mis-reservas`

**Descripción:** Lista todas las reservas del usuario autenticado con filtros opcionales.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (todos opcionales):**
- `estado`: 'activa' | 'cancelada'
- `tipoReserva`: 'espacio' | 'taller'
- `fechaDesde`: Fecha de inicio (YYYY-MM-DD)
- `fechaHasta`: Fecha de fin (YYYY-MM-DD)

**Ejemplo Request (Postman):**
```
GET http://localhost:3000/reservas-pte-alto/mis-reservas?estado=activa&tipoReserva=espacio
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ejemplo Request (cURL):**
```bash
curl -X GET "http://localhost:3000/reservas-pte-alto/mis-reservas?estado=activa&tipoReserva=espacio" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response 200 (Success):**
```json
{
  "success": true,
  "reservas": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
      "tipoReserva": "espacio",
      "espacioDeportivo": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "nombre": "Cancha de Fútbol 1",
        "deporte": "futbol"
      },
      "fechaInicio": "2025-01-15T10:00:00.000Z",
      "fechaFin": "2025-01-15T12:00:00.000Z",
      "estado": "activa",
      "notas": "Reserva para partido amistoso",
      "createdAt": "2025-01-10T08:30:00.000Z"
    },
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k8",
      "tipoReserva": "taller",
      "taller": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k7",
        "nombre": "Taller de Fútbol Juvenil",
        "fechaInicio": "2025-01-20T14:00:00.000Z",
        "fechaFin": "2025-03-20T16:00:00.000Z"
      },
      "fechaInicio": "2025-01-20T14:00:00.000Z",
      "fechaFin": "2025-03-20T16:00:00.000Z",
      "estado": "activa",
      "createdAt": "2025-01-10T08:35:00.000Z"
    }
  ],
  "total": 2
}
```

---

### 7. Cancelar Reserva

**Endpoint:** `PUT /reservas-pte-alto/:id/cancelar`

**Descripción:** Cancela una reserva del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `id`: ID de la reserva a cancelar (ObjectId)

**Body (JSON - opcional):**
```json
{
  "motivoCancelacion": "Cambio de planes"
}
```

**Ejemplo Request (Postman):**
```
PUT http://localhost:3000/reservas-pte-alto/65a1b2c3d4e5f6g7h8i9j0k5/cancelar
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json

Body (raw JSON):
{
  "motivoCancelacion": "Cambio de planes"
}
```

**Ejemplo Request (cURL):**
```bash
curl -X PUT "http://localhost:3000/reservas-pte-alto/65a1b2c3d4e5f6g7h8i9j0k5/cancelar" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "motivoCancelacion": "Cambio de planes"
  }'
```

**Response 200 (Success):**
```json
{
  "success": true,
  "message": "Reserva cancelada correctamente",
  "reserva": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "estado": "cancelada",
    "canceladoPor": "USER",
    "notas": "Cambio de planes",
    "updatedAt": "2025-01-10T09:00:00.000Z"
  }
}
```

**Response 400 (Menos de 2 horas):**
```json
{
  "success": false,
  "message": "No se puede cancelar una reserva con menos de 2 horas de anticipación"
}
```

**Response 403 (No es tu reserva):**
```json
{
  "success": false,
  "message": "No tienes permiso para cancelar esta reserva"
}
```

---

## 🔧 Endpoints de Administración (Requieren Rol Admin)

### 8. Listar Todas las Reservas (Admin)

**Endpoint:** `GET /reservas-pte-alto/admin/todas`

**Descripción:** Lista todas las reservas del sistema con filtros avanzados (solo para administradores).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (todos opcionales):**
- `espacioDeportivo`: ID del espacio deportivo (ObjectId)
- `taller`: ID del taller (ObjectId)
- `usuario`: ID del usuario (ObjectId)
- `estado`: 'activa' | 'cancelada'
- `tipoReserva`: 'espacio' | 'taller'
- `fechaDesde`: Fecha de inicio (YYYY-MM-DD)
- `fechaHasta`: Fecha de fin (YYYY-MM-DD)

**Ejemplo Request (Postman):**
```
GET http://localhost:3000/reservas-pte-alto/admin/todas?estado=activa&tipoReserva=espacio&fechaDesde=2025-01-01
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ejemplo Request (cURL):**
```bash
curl -X GET "http://localhost:3000/reservas-pte-alto/admin/todas?estado=activa&tipoReserva=espacio&fechaDesde=2025-01-01" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response 200 (Success):**
```json
{
  "success": true,
  "reservas": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
      "usuario": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k6",
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "juan.perez@example.com"
      },
      "espacioDeportivo": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "nombre": "Cancha de Fútbol 1",
        "deporte": "futbol"
      },
      "fechaInicio": "2025-01-15T10:00:00.000Z",
      "fechaFin": "2025-01-15T12:00:00.000Z",
      "tipoReserva": "espacio",
      "estado": "activa",
      "createdAt": "2025-01-10T08:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

### 9. Obtener Reserva por ID (Admin)

**Endpoint:** `GET /reservas-pte-alto/admin/:id`

**Descripción:** Obtiene los detalles completos de una reserva específica (solo para administradores).

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: ID de la reserva (ObjectId)

**Ejemplo Request (Postman):**
```
GET http://localhost:3000/reservas-pte-alto/admin/65a1b2c3d4e5f6g7h8i9j0k5
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ejemplo Request (cURL):**
```bash
curl -X GET "http://localhost:3000/reservas-pte-alto/admin/65a1b2c3d4e5f6g7h8i9j0k5" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response 200 (Success):**
```json
{
  "success": true,
  "reserva": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "usuario": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k6",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan.perez@example.com",
      "rut": "12345678-9",
      "telefono": "+56912345678"
    },
    "espacioDeportivo": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "nombre": "Cancha de Fútbol 1",
      "deporte": "futbol",
      "direccion": "Av. Principal 123"
    },
    "fechaInicio": "2025-01-15T10:00:00.000Z",
    "fechaFin": "2025-01-15T12:00:00.000Z",
    "tipoReserva": "espacio",
    "estado": "activa",
    "notas": "Reserva para partido amistoso",
    "createdAt": "2025-01-10T08:30:00.000Z",
    "updatedAt": "2025-01-10T08:30:00.000Z"
  }
}
```

**Response 404 (No encontrada):**
```json
{
  "success": false,
  "message": "Reserva no encontrada"
}
```

---

### 10. Cancelar Reserva (Admin)

**Endpoint:** `PUT /reservas-pte-alto/admin/:id/cancelar`

**Descripción:** Cancela una reserva como administrador (solo para administradores).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `id`: ID de la reserva a cancelar (ObjectId)

**Body (JSON - opcional):**
```json
{
  "motivoCancelacion": "Espacio cerrado por mantenimiento"
}
```

**Ejemplo Request (Postman):**
```
PUT http://localhost:3000/reservas-pte-alto/admin/65a1b2c3d4e5f6g7h8i9j0k5/cancelar
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json

Body (raw JSON):
{
  "motivoCancelacion": "Espacio cerrado por mantenimiento"
}
```

**Ejemplo Request (cURL):**
```bash
curl -X PUT "http://localhost:3000/reservas-pte-alto/admin/65a1b2c3d4e5f6g7h8i9j0k5/cancelar" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "motivoCancelacion": "Espacio cerrado por mantenimiento"
  }'
```

**Response 200 (Success):**
```json
{
  "success": true,
  "message": "Reserva cancelada correctamente por administrador",
  "reserva": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "estado": "cancelada",
    "canceladoPor": "ADMIN",
    "notas": "Espacio cerrado por mantenimiento",
    "updatedAt": "2025-01-10T09:15:00.000Z"
  }
}
```

---

## 📝 Notas Importantes

### Códigos de Estado HTTP

- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **400**: Error en la solicitud (parámetros faltantes o inválidos)
- **401**: No autenticado (token faltante o inválido)
- **403**: No autorizado (usuario no validado o sin permisos)
- **404**: Recurso no encontrado
- **409**: Conflicto (espacio no disponible, ya inscrito, etc.)
- **500**: Error interno del servidor

### Formato de Fechas

Todas las fechas deben estar en formato **ISO 8601**:
- Fecha completa: `2025-01-15T10:00:00Z`
- Solo fecha: `2025-01-15`

### Autenticación

El token JWT se obtiene del endpoint de login:
```
POST /pte-alto/login-usuario
Body: { "email": "usuario@example.com", "password": "password123" }
```

El token debe incluirse en todas las peticiones que requieren autenticación:
```
Authorization: Bearer <token>
```

### Validaciones Importantes

1. **Usuario debe estar validado**: Solo usuarios con `estadoValidacion: 'validado'` pueden crear reservas
2. **Espacios deben estar activos**: Solo espacios con `status: true` pueden ser reservados
3. **No solapamiento**: No se pueden crear reservas que se solapen con reservas o talleres existentes
4. **Cancelación anticipada**: Los usuarios no pueden cancelar reservas con menos de 2 horas de anticipación (opcional)

---

## 🧪 Colección de Postman

Para importar en Postman, puedes crear una colección con estos endpoints. Asegúrate de:

1. Crear una variable de entorno `base_url` con el valor: `http://localhost:3000`
2. Crear una variable `token` para almacenar el JWT después del login
3. Configurar un script de pre-request para agregar el token automáticamente:

```javascript
// En Pre-request Script de la colección
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('token')
});
```

---

**Última actualización**: 2025-01-10
**Versión API**: 1.0

