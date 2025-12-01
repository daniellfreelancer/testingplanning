# 🔧 Planificación Backend - SAAS Ligup Chile (MVP en 3 días)

## 🎯 Objetivo Backend
Desarrollar la API REST completa para el SAAS Ligup Chile, proporcionando endpoints seguros, validados y eficientes para autenticación, gestión de usuarios, reservas, talleres y administración.

---

## 📊 Estado Actual del Backend

### ✅ Módulos Existentes (Reutilizar)
- ✅ `api/pteAlto/usuarios-pte-alto` - Modelo de usuarios PTE Alto
- ✅ `api/reservas/` - Modelo base de reservas
- ✅ `api/espacios-deportivos/` - CRUD de espacios
- ✅ `api/centros-deportivos/` - CRUD de complejos
- ✅ `api/talleres/` - Modelo base de talleres
- ✅ `api/institucion/` - Gestión de instituciones
- ✅ `api/access/` - Sistema de autenticación base
- ✅ `config/database.js` - Conexión MongoDB configurada
- ✅ `libs/storageAWS.js` - Integración AWS S3 para archivos

### 🔄 Gaps a Implementar
1. ✅ ~~Sistema de validación de usuarios (estado pendiente/validado/rechazado)~~ **COMPLETADO**
2. ✅ ~~Endpoints de registro con subida de documentos~~ **COMPLETADO**
3. 🔄 Mejorar endpoints de complejos deportivos (validación, filtros, seguridad)
4. Endpoints de administración completos
5. Validación de disponibilidad de reservas
6. Sistema de reservas recurrentes/largas
7. Endpoints de métricas y reportes

---

## 🛠️ Stack Tecnológico Backend

- **Runtime**: Node.js >= 18.0.0
- **Framework**: Express.js
- **Base de Datos**: MongoDB + Mongoose
- **Autenticación**: JWT (jsonwebtoken)
- **Validación**: Joi
- **File Upload**: Multer / express-fileupload
- **Storage**: AWS S3 (usar `libs/storageAWS.js`)
- **Image Processing**: Sharp (ya instalado)
- **Error Handling**: Middleware personalizado
- **Logging**: Morgan (ya configurado)

---

## 📅 PLAN DE DESARROLLO BACKEND POR DÍAS

---

## 🔥 DÍA 1: Autenticación y Validación de Usuarios

### **Tarea 1.1: Actualizar Modelo de Usuarios**
**Archivo**: `backend/api/usuarios-complejos/usuariosComplejos.js`

**Checklist**:
- [ ] Agregar campo `estadoValidacion` al schema:
  ```javascript
  estadoValidacion: { 
    type: String, 
    enum: ['pendiente', 'validado', 'rechazado'], 
    default: 'pendiente' 
  }
  ```
- [ ] Agregar campo `documentoUrl`:
  ```javascript
  documentoUrl: { type: String } // URL del documento en S3
  ```
- [ ] Verificar que `fechaRegistro` ya existe (ya está en el modelo)
- [ ] Agregar campo `motivoRechazo` (opcional):
  ```javascript
  motivoRechazo: { type: String }
  ```
- [x] Agregar índice para búsquedas por estado:
  ```javascript
  usuariosComplejosSchema.index({ estadoValidacion: 1 });
  ```
- [x] Exportar modelo actualizado

**Criterios de Aceptación**:
- [x] Modelo se puede importar sin errores
- [x] Campos nuevos están en el schema
- [x] Índices creados correctamente

---

### **Tarea 1.2: Endpoint de Registro de Usuarios**
**Archivo**: `backend/api/pteAlto/usuarios-pte-alto/usuariosPteAltoController.js`

**Checklist**:
- [x] Crear función `registroUsuario` con validación Joi:
- [x] Validar: nombre, apellido, email, password, rut, telefono
- [x] Validar que email no exista
- [x] Validar formato de RUT chileno
- [x] Hash de password con bcryptjs
- [x] Implementar subida de documento:
- [x] Usar multer para recibir archivo
- [x] Validar tipo de archivo (PDF, JPG, PNG)
- [x] Validar tamaño máximo (5MB)
- [x] Subir a AWS S3 usando `libs/storageAWS.js`
- [x] Guardar URL en `certificadoDomicilio`
- [x] Crear usuario con estado `pendiente`
- [x] Retornar usuario creado (sin password)
- [x] Manejo de errores con try/catch

**Endpoint**: `POST /api/pteAlto/usuarios-pte-alto/crear-usuario-externo`

**Request Body**:
```json
{
  "nombre": "string",
  "apellido": "string",
  "email": "string",
  "password": "string",
  "rut": "string",
  "telefono": "string",
  "documento": "file" // multipart/form-data
}
```

**Response 201**:
```json
{
  "success": true,
  "usuario": {
    "id": "ObjectId",
    "nombre": "string",
    "email": "string",
    "estadoValidacion": "pendiente",
    "fechaRegistro": "Date"
  }
}
```

**Criterios de Aceptación**:
- [ x] Endpoint responde correctamente
- [x ] Validación funciona (email duplicado, RUT inválido)
- [ x] Archivo se sube a S3 correctamente
- [ x] Password está hasheado
- [ x] Usuario se crea con estado `pendiente`
- [ x] Email de bienvenida enviado correctamente

---

### **Tarea 1.3: Endpoints de Validación de Usuarios (Admin)**
**Archivo**: `backend/api/usuarios-complejos/usuariosComplejosController.js`

**Checklist**:

#### **1.3.1: Listar Usuarios Pendientes**
- [ ] Crear función `obtenerTodosLosUsuariosPteAlto`
- [ ] Query: `rol: 'USER'`
- [ ] Ordenar por `createdAt` (más antiguos primero)
- [ ] Paginación (opcional para MVP)
- [ ] Retornar: id, nombre, apellido, email, rut, rol, status, institucion, estadoValidacion, certificadoDomicilio, createdAt, updatedAt

**Endpoint**: `GET /pte-alto/obtener-todos-los-usuarios`

#### **1.3.2: Validar Usuario**
- [x ] Crear función `validarUsuario`
- [ x] Validar que usuario existe
- [ x] Validar que estado es `pendiente`
- [ ] Actualizar `estadoValidacion: 'validado'`
- [ ] Guardar cambios
- [ ] Retornar usuario actualizado

**Endpoint**: `PUT /pte-alto/validar-usuario/:id`

**Response 200**:
```json
{
  "success": true,
  "usuario": {
    "id": "ObjectId",
    "estadoValidacion": "validado"
  }
}
```

#### **1.3.3: Asignar Admin PTE Alto**
- [x ] Crear función `asignarAdminPteAlto`
- [x ] Validar que usuario existe
- [x ] Validar que institucion existe
- [x ] Asignar admin PTE Alto a la institucion
- [x ] Retornar institucion actualizada

**Endpoint**: `PUT /pte-alto/asignar-admin-pte-alto/:id`

**Request Body** (opcional):
```json
{
  "institucion": "ObjectId"
}
```

**Response 200**:
```json
{
  "success": true,
  "usuario": {
    "id": "ObjectId",
    "institucion": "ObjectId"
  }
}
```

**Criterios de Aceptación**:
- [ x] Los 3 endpoints funcionan correctamente
- [ x] Solo usuarios con rol admin pueden acceder
- [ x] Validaciones funcionan (usuario no existe, estado incorrecto)
- [ x] Cambios se persisten en BD

---

### **Tarea 1.4: Sistema de Autenticación JWT**
**Archivos**: 
- `backend/api/access/accessController.js` (verificar/mejorar)
- `backend/middleware/auth.js` (crear si no existe)

**Checklist**:

#### **1.4.1: Verificar/Mejorar Endpoint de Login**
- [x ] Revisar endpoint de login existente
- [x ] Validar email y password con Joi
- [x ] Buscar usuario por email
- [x ] Verificar password con bcryptjs.compare
- [ x] Verificar que `estadoValidacion === 'validado'` (solo usuarios validados pueden login)
- [ x] Generar JWT token con payload:
  ```javascript
  {
    userId: usuario._id,
    email: usuario.email,
    rol: usuario.rol
  }
  ```
- [ ] Retornar token y datos básicos del usuario

**Endpoint**: `POST /pte-alto/login-usuario`

**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200**:
```json
{
  "success": true,
  "token": "jwt_token_string",
  "usuario": {
    "id": "ObjectId",
    "nombre": "string",
    "email": "string",
    "rol": "string"
  }
}
```

#### **1.4.2: Middleware de Autenticación**
- [ ] Crear `middleware/auth.js`
- [ ] Función `authenticateToken`:
  - [ ] Extraer token de header `Authorization: Bearer <token>`
  - [ ] Verificar token con jwt.verify
  - [ ] Agregar `req.user` con datos del usuario
  - [ ] Next() si es válido
  - [ ] Error 401 si no es válido

#### **1.4.3: Middleware de Roles**
- [ ] Crear función `requireAdmin`:
  - [ ] Verificar que `req.user` existe
  - [ ] Verificar que `req.user.rol === 'admin'`
  - [ ] Error 403 si no es admin
  - [ ] Next() si es admin

#### **1.4.4: Aplicar Middlewares a Rutas**
- [ ] Proteger rutas de admin con `requireAdmin`
- [ ] Proteger rutas de usuario con `authenticateToken`
- [ ] Actualizar rutas en `usuariosComplejosRoutes.js`

**Criterios de Aceptación**:
- [ ] Login funciona correctamente
- [ ] Solo usuarios validados pueden hacer login
- [ ] Token se genera y valida correctamente
- [ ] Middlewares protegen rutas correctamente
- [ ] Errores 401/403 se retornan apropiadamente

---

### **Tarea 1.5: Actualizar Rutas**
**Archivo**: `backend/api/usuarios-complejos/usuariosComplejosRoutes.js`

**Checklist**:
- [ ] Agregar ruta `POST /registro` → `registroUsuario`
- [ ] Agregar ruta `GET /pendientes` → `listarUsuariosPendientes` (con `requireAdmin`)
- [ ] Agregar ruta `PUT /:id/validar` → `validarUsuario` (con `requireAdmin`)
- [ ] Agregar ruta `PUT /:id/rechazar` → `rechazarUsuario` (con `requireAdmin`)
- [ ] Verificar que rutas existentes tienen middlewares apropiados
- [ ] Registrar rutas en `app.js` si no están registradas

**Criterios de Aceptación**:
- [ ] Todas las rutas están definidas
- [ ] Middlewares aplicados correctamente
- [ ] Rutas registradas en app.js

---

### **Checkpoint Día 1 Backend**
- [ x] Modelo de usuarios actualizado
- [ x] Registro de usuarios funcionando
- [ x] Subida de documentos a S3 funcionando
- [ x] Endpoints de validación funcionando
- [x] Autenticación JWT funcionando
- [x] Middlewares de seguridad aplicados
- [x] Testing manual de todos los endpoints

---

## 🏢 GESTIÓN DE COMPLEJOS DEPORTIVOS

### **Tarea CD.1: Revisar y Mejorar Modelo de Complejos Deportivos**
**Archivo**: `backend/api/centros-deportivos/centrosDeportivosModel.js`

**Estado Actual**: ✅ Modelo existe con campos básicos

**Checklist**:
- [x] Verificar que modelo tiene todos los campos necesarios:
  - [x] `nombre`, `descripcion`, `direccion`, `telefono`, `email`, `rut`
  - [x] `ciudad`, `comuna`
  - [x] `institucion` (array de referencias)
  - [x] `espaciosDeportivos` (array de referencias)
  - [x] `horarios` (array para horarios de apertura/cierre)
  - [x] `status` (boolean)
- [ ] Agregar validaciones al schema:
  - [ ] `nombre` requerido
  - [ ] `rut` único (ya validado en controller)
  - [ ] `email` formato válido (opcional)
- [ ] Agregar índices para performance:
  ```javascript
  centrosDeportivosSchema.index({ institucion: 1 });
  centrosDeportivosSchema.index({ status: 1 });
  centrosDeportivosSchema.index({ rut: 1 }, { unique: true });
  ```

**Criterios de Aceptación**:
- [ ] Modelo tiene validaciones
- [ ] Índices creados
- [ ] Compatible con datos existentes

---

### **Tarea CD.2: Mejorar Endpoints de Complejos Deportivos**
**Archivo**: `backend/api/centros-deportivos/centrosDeportivosController.js`

**Estado Actual**: ✅ CRUD básico existe, necesita mejoras

**Checklist**:

#### **CD.2.1: Mejorar Crear Complejo Deportivo**
- [ ] Agregar validación con Joi:
  - [ ] `nombre`: string requerido, min 3 caracteres
  - [ ] `descripcion`: string opcional
  - [ ] `direccion`: string requerido
  - [ ] `telefono`: string/number, formato válido
  - [ ] `email`: string, formato email válido (opcional)
  - [ ] `rut`: string, formato RUT chileno válido, único
  - [ ] `ciudad`: string requerido
  - [ ] `comuna`: string requerido
  - [ ] `institucion`: ObjectId válido (requerido)
  - [ ] `horarios`: array opcional con estructura válida
- [ ] Verificar que institución existe antes de crear
- [ ] Verificar que RUT no existe (ya está implementado)
- [ ] Mejorar respuesta: incluir complejo con populate de institución
- [ ] Agregar manejo de errores más descriptivo

**Endpoint Actual**: `POST /vm-centros-deportivos/crear-centro-deportivo/:id`

**Mejora Sugerida**: Cambiar a `POST /vm-centros-deportivos` y obtener adminId del token JWT

**Request Body**:
```json
{
  "nombre": "Complejo Deportivo Central",
  "descripcion": "Complejo con canchas de fútbol y básquetbol",
  "direccion": "Av. Principal 123",
  "telefono": "+56912345678",
  "email": "contacto@complejo.cl",
  "rut": "12345678-9",
  "ciudad": "Santiago",
  "comuna": "Providencia",
  "institucion": "ObjectId",
  "horarios": [
    {
      "dia": "lunes",
      "apertura": "08:00",
      "cierre": "22:00"
    }
  ]
}
```

**Response 201**:
```json
{
  "success": true,
  "message": "Centro deportivo creado correctamente",
  "centroDeportivo": {
    "id": "ObjectId",
    "nombre": "string",
    "institucion": {
      "id": "ObjectId",
      "nombre": "string"
    },
    "status": true,
    "createdAt": "Date"
  }
}
```

#### **CD.2.2: Mejorar Listar Complejos Deportivos**
- [ ] Agregar filtros (query params):
  - [ ] `institucion`: filtrar por institución
  - [ ] `status`: filtrar por status (true/false)
  - [ ] `ciudad`: filtrar por ciudad
  - [ ] `comuna`: filtrar por comuna
- [ ] Agregar populate de `institucion` y `espaciosDeportivos`
- [ ] Agregar paginación (opcional para MVP):
  - [ ] `page`: número de página (default: 1)
  - [ ] `limit`: elementos por página (default: 10)
- [ ] Ordenar por `nombre` o `createdAt`
- [ ] Retornar total de resultados

**Endpoint**: `GET /vm-centros-deportivos/obtener-todos-los-centros-deportivos`

**Query Params** (opcionales):
```
?institucion=ObjectId&status=true&ciudad=Santiago&page=1&limit=10
```

**Response 200**:
```json
{
  "success": true,
  "centrosDeportivos": [
    {
      "id": "ObjectId",
      "nombre": "string",
      "direccion": "string",
      "institucion": {
        "id": "ObjectId",
        "nombre": "string"
      },
      "espaciosDeportivos": [
        {
          "id": "ObjectId",
          "nombre": "string"
        }
      ],
      "status": true
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 10
}
```

#### **CD.2.3: Mejorar Obtener Complejo por ID**
- [ ] Agregar populate completo:
  - [ ] `institucion`
  - [ ] `espaciosDeportivos`
  - [ ] `admins` (opcional)
- [ ] Validar que complejo existe
- [ ] Retornar error 404 si no existe

**Endpoint**: `GET /vm-centros-deportivos/obtener-centro-deportivo/:id`

#### **CD.2.4: Mejorar Actualizar Complejo**
- [ ] Agregar validación con Joi (misma que crear, pero todos opcionales)
- [ ] Validar que complejo existe
- [ ] Validar que RUT no está duplicado (si se actualiza)
- [ ] Permitir actualizar solo campos enviados
- [ ] Retornar complejo actualizado con populate

**Endpoint**: `PUT /vm-centros-deportivos/actualizar-centro-deportivo/:id`

#### **CD.2.5: Mejorar Eliminar Complejo**
- [ ] Validar que complejo existe
- [ ] Verificar que no tiene espacios deportivos activos (opcional, o solo deshabilitar)
- [ ] Verificar que no tiene reservas activas (opcional)
- [ ] Opción: Soft delete (cambiar `status: false` en lugar de eliminar)
- [ ] Limpiar referencias en institución
- [ ] Retornar confirmación

**Endpoint**: `DELETE /vm-centros-deportivos/eliminar-centro-deportivo/:id`

**Criterios de Aceptación**:
- [ ] Todos los endpoints tienen validación Joi
- [ ] Filtros funcionan correctamente
- [ ] Populate funciona en listados
- [ ] Manejo de errores es descriptivo
- [ ] Respuestas son consistentes

---

### **Tarea CD.3: Agregar Endpoints Adicionales**
**Archivo**: `backend/api/centros-deportivos/centrosDeportivosController.js`

**Checklist**:

#### **CD.3.1: Listar Complejos por Institución**
- [ ] Crear función `obtenerComplejosPorInstitucion`
- [ ] Filtrar por `institucion: req.params.institucionId`
- [ ] Populate `espaciosDeportivos`
- [ ] Filtrar solo activos (`status: true`)

**Endpoint**: `GET /vm-centros-deportivos/por-institucion/:institucionId`

#### **CD.3.2: Habilitar/Deshabilitar Complejo**
- [ ] Crear función `toggleStatusComplejo`
- [ ] Validar que complejo existe
- [ ] Cambiar `status: !status`
- [ ] Retornar complejo actualizado

**Endpoint**: `PUT /vm-centros-deportivos/:id/toggle-status`

#### **CD.3.3: Obtener Estadísticas del Complejo**
- [ ] Crear función `obtenerEstadisticasComplejo`
- [ ] Calcular:
  - [ ] Total de espacios deportivos
  - [ ] Total de reservas (último mes)
  - [ ] Espacios más usados
- [ ] Retornar estadísticas

**Endpoint**: `GET /vm-centros-deportivos/:id/estadisticas`

**Criterios de Aceptación**:
- [ ] Endpoints funcionan correctamente
- [ ] Respuestas son útiles para frontend

---

### **Tarea CD.4: Agregar Middlewares de Seguridad**
**Archivo**: `backend/api/centros-deportivos/centrosDeportivosRoutes.js`

**Checklist**:
- [ ] Importar middlewares de autenticación
- [ ] Proteger todas las rutas con `authenticateToken`
- [ ] Proteger rutas de creación/edición/eliminación con `requireAdmin` o verificar que usuario pertenece a la institución
- [ ] Permitir lectura a usuarios validados
- [ ] Actualizar rutas en `app.js` si es necesario

**Criterios de Aceptación**:
- [ ] Rutas protegidas correctamente
- [ ] Solo admins pueden crear/editar/eliminar
- [ ] Usuarios validados pueden leer

---

### **Tarea CD.5: Actualizar Rutas**
**Archivo**: `backend/api/centros-deportivos/centrosDeportivosRoutes.js`

**Checklist**:
- [ ] Revisar rutas existentes
- [ ] Agregar nuevas rutas:
  - [ ] `GET /por-institucion/:institucionId` → `obtenerComplejosPorInstitucion`
  - [ ] `PUT /:id/toggle-status` → `toggleStatusComplejo`
  - [ ] `GET /:id/estadisticas` → `obtenerEstadisticasComplejo`
- [ ] Aplicar middlewares a cada ruta
- [ ] Documentar rutas con comentarios

**Criterios de Aceptación**:
- [ ] Todas las rutas están definidas
- [ ] Middlewares aplicados
- [ ] Rutas registradas en app.js

---

### **Checkpoint Complejos Deportivos**
- [ ] Modelo mejorado con validaciones e índices
- [ ] Endpoints CRUD mejorados con validación Joi
- [ ] Filtros y paginación funcionando
- [ ] Endpoints adicionales implementados
- [ ] Middlewares de seguridad aplicados
- [ ] Testing manual completo

---

## 🚀 DÍA 2: Reservas y Administración

### **Tarea 2.1: Actualizar Modelo de Reservas**
**Archivo**: `backend/api/reservas/reservasModel.js`

**Checklist**:
- [ ] Actualizar schema para incluir:
  - [ ] `usuario: { type: ObjectId, ref: 'usuariosComplejos' }` (ya existe pero verificar referencia)
  - [ ] `espacioDeportivo: { type: ObjectId, ref: 'espacioDeportivo' }` (ya existe)
  - [ ] `fechaInicio: { type: Date }` (nuevo, más preciso que dia/mes/anio)
  - [ ] `fechaFin: { type: Date }` (nuevo)
  - [ ] `estado: { type: String, enum: ['activa', 'cancelada'], default: 'activa' }` (mejor que status boolean)
  - [ ] `esRecurrente: { type: Boolean, default: false }`
  - [ ] `reservaPadre: { type: ObjectId, ref: 'reserva' }` (para reservas recurrentes)
  - [ ] `motivoCancelacion: { type: String }`
- [ ] Mantener campos existentes (dia, hora, mes, anio) para compatibilidad
- [ ] Agregar índices:
  ```javascript
  reservasSchema.index({ espacioDeportivo: 1, fechaInicio: 1 });
  reservasSchema.index({ usuario: 1 });
  reservasSchema.index({ estado: 1 });
  ```

**Criterios de Aceptación**:
- [ ] Modelo actualizado sin errores
- [ ] Índices creados
- [ ] Compatibilidad con datos existentes

---

### **Tarea 2.2: Endpoints de Reservas**
**Archivo**: `backend/api/reservas/reservasController.js` (crear si no existe)

**Checklist**:

#### **2.2.1: Crear Reserva**
- [ ] Crear función `crearReserva`
- [ ] Validar con Joi:
  - [ ] `espacioDeportivo` (ObjectId válido)
  - [ ] `fechaInicio` (Date válida, no en el pasado)
  - [ ] `fechaFin` (Date válida, después de fechaInicio)
  - [ ] Duración mínima/máxima (ej: 1 hora mín, 4 horas máx)
- [ ] **Validar disponibilidad**:
  - [ ] Buscar reservas existentes en el mismo espacio
  - [ ] Verificar que no hay solapamiento de fechas
  - [ ] Retornar error si hay conflicto
- [ ] Verificar que usuario está validado (`estadoValidacion === 'validado'`)
- [ ] Crear reserva con estado `activa`
- [ ] Retornar reserva creada

**Endpoint**: `POST /api/reservas`

**Request Body**:
```json
{
  "espacioDeportivo": "ObjectId",
  "fechaInicio": "2025-01-15T10:00:00Z",
  "fechaFin": "2025-01-15T12:00:00Z"
}
```

**Response 201**:
```json
{
  "success": true,
  "reserva": {
    "id": "ObjectId",
    "usuario": "ObjectId",
    "espacioDeportivo": "ObjectId",
    "fechaInicio": "Date",
    "fechaFin": "Date",
    "estado": "activa"
  }
}
```

#### **2.2.2: Listar Reservas del Usuario**
- [ ] Crear función `misReservas`
- [ ] Filtrar por `usuario: req.user.userId`
- [ ] Filtrar por `estado` (query param opcional)
- [ ] Ordenar por `fechaInicio` descendente
- [ ] Populate `espacioDeportivo` con nombre
- [ ] Retornar lista de reservas

**Endpoint**: `GET /api/reservas/mis-reservas`

**Query Params** (opcionales):
- `estado`: 'activa' | 'cancelada'
- `fechaDesde`: Date
- `fechaHasta`: Date

**Response 200**:
```json
{
  "success": true,
  "reservas": [
    {
      "id": "ObjectId",
      "espacioDeportivo": {
        "id": "ObjectId",
        "nombre": "string"
      },
      "fechaInicio": "Date",
      "fechaFin": "Date",
      "estado": "string"
    }
  ]
}
```

#### **2.2.3: Cancelar Reserva (Usuario)**
- [ ] Crear función `cancelarReserva`
- [ ] Validar que reserva existe
- [ ] Validar que reserva pertenece al usuario (`reserva.usuario === req.user.userId`)
- [ ] Validar que reserva está activa
- [ ] Validar que no se cancela muy cerca de la fecha (ej: máximo 2 horas antes)
- [ ] Actualizar `estado: 'cancelada'`
- [ ] Guardar `motivoCancelacion` (opcional)
- [ ] Retornar reserva actualizada

**Endpoint**: `PUT /api/reservas/:id/cancelar`

**Request Body** (opcional):
```json
{
  "motivoCancelacion": "string"
}
```

**Response 200**:
```json
{
  "success": true,
  "reserva": {
    "id": "ObjectId",
    "estado": "cancelada"
  }
}
```

#### **2.2.4: Obtener Reserva por ID**
- [ ] Crear función `obtenerReserva`
- [ ] Validar que reserva existe
- [ ] Verificar permisos (usuario o admin)
- [ ] Populate relaciones (usuario, espacioDeportivo)
- [ ] Retornar reserva completa

**Endpoint**: `GET /api/reservas/:id`

**Criterios de Aceptación**:
- [ ] Todos los endpoints funcionan
- [ ] Validación de disponibilidad funciona correctamente
- [ ] Permisos aplicados correctamente
- [ ] Errores manejados apropiadamente

---

### **Tarea 2.3: Endpoints de Administración**
**Archivo**: `backend/api/admin/adminController.js` (crear nuevo)

**Checklist**:

#### **2.3.1: Listar Todas las Reservas (Admin)**
- [ ] Crear función `listarTodasReservas`
- [ ] Filtros opcionales (query params):
  - [ ] `espacioDeportivo`: ObjectId
  - [ ] `usuario`: ObjectId
  - [ ] `estado`: 'activa' | 'cancelada'
  - [ ] `fechaDesde`: Date
  - [ ] `fechaHasta`: Date
- [ ] Ordenar por `fechaInicio` descendente
- [ ] Populate `usuario` y `espacioDeportivo`
- [ ] Paginación (opcional para MVP)

**Endpoint**: `GET /api/admin/reservas`

**Response 200**:
```json
{
  "success": true,
  "reservas": [...],
  "total": 100
}
```

#### **2.3.2: Cancelar Reserva (Admin)**
- [ ] Crear función `cancelarReservaAdmin`
- [ ] Validar que reserva existe
- [ ] Validar que reserva está activa
- [ ] Actualizar `estado: 'cancelada'`
- [ ] Guardar `motivoCancelacion` (opcional)
- [ ] Retornar reserva actualizada

**Endpoint**: `PUT /api/admin/reservas/:id/cancelar`

#### **2.3.3: Listar Todos los Usuarios (Admin)**
- [ ] Crear función `listarTodosUsuarios`
- [ ] Filtros opcionales:
  - [ ] `estadoValidacion`: 'pendiente' | 'validado' | 'rechazado'
  - [ ] `rol`: 'usuario' | 'admin'
- [ ] Ordenar por `fechaRegistro` descendente
- [ ] No retornar passwords
- [ ] Paginación (opcional)

**Endpoint**: `GET /api/admin/usuarios`

#### **2.3.4: Inhabilitar Usuario (Admin)**
- [ ] Crear función `inhabilitarUsuario`
- [ ] Validar que usuario existe
- [ ] Actualizar `status: false`
- [ ] Retornar usuario actualizado

**Endpoint**: `PUT /api/admin/usuarios/:id/inhabilitar`

**Criterios de Aceptación**:
- [ ] Todos los endpoints requieren rol admin
- [ ] Filtros funcionan correctamente
- [ ] Permisos aplicados

---

### **Tarea 2.4: Reservas Recurrentes/Largas**
**Archivo**: `backend/api/reservas/reservasController.js`

**Checklist**:
- [ ] Crear función `crearReservaRecurrente`
- [ ] Validar con Joi:
  - [ ] `espacioDeportivo`: ObjectId
  - [ ] `fechaInicio`: Date (primera reserva)
  - [ ] `fechaFin`: Date (fin de cada sesión)
  - [ ] `frecuencia`: 'diaria' | 'semanal' | 'mensual'
  - [ ] `duracion`: Number (días o semanas, ej: 6 meses = 24 semanas)
  - [ ] `diaSemana`: Number (0-6, solo para semanal)
- [ ] **Lógica de creación**:
  - [ ] Calcular todas las fechas según frecuencia
  - [ ] Para cada fecha, validar disponibilidad
  - [ ] Si alguna fecha no está disponible, retornar error con detalles
  - [ ] Crear reserva "padre" con `esRecurrente: true`
  - [ ] Crear todas las reservas hijas con `reservaPadre` apuntando a la padre
  - [ ] Retornar todas las reservas creadas
- [ ] Manejo de errores: si falla alguna, hacer rollback

**Endpoint**: `POST /api/reservas/recurrente`

**Request Body**:
```json
{
  "espacioDeportivo": "ObjectId",
  "fechaInicio": "2025-01-15T10:00:00Z",
  "fechaFin": "2025-01-15T12:00:00Z",
  "frecuencia": "semanal",
  "duracion": 24,
  "diaSemana": 1
}
```

**Response 201**:
```json
{
  "success": true,
  "reservaPadre": "ObjectId",
  "reservasCreadas": 24,
  "reservas": [...]
}
```

**Criterios de Aceptación**:
- [ ] Crea todas las reservas correctamente
- [ ] Valida disponibilidad para todas las fechas
- [ ] Maneja errores y rollback apropiadamente

---

### **Tarea 2.5: Endpoints de Talleres**
**Archivo**: `backend/api/talleres/talleresController.js` (crear si no existe)

**Checklist**:

#### **2.5.1: Crear Taller**
- [ ] Crear función `crearTaller`
- [ ] Validar con Joi:
  - [ ] `nombre`: String (requerido)
  - [ ] `descripcion`: String
  - [ ] `espacioDeportivo`: ObjectId (opcional, se asigna después)
  - [ ] `fechaInicio`: Date
  - [ ] `fechaFin`: Date
  - [ ] `capacidadMaxima`: Number
- [ ] Crear taller
- [ ] Retornar taller creado

**Endpoint**: `POST /api/talleres` (solo admin)

#### **2.5.2: Listar Talleres**
- [ ] Crear función `listarTalleres`
- [ ] Filtros opcionales:
  - [ ] `espacioDeportivo`: ObjectId
- [ ] Populate `espacioDeportivo`
- [ ] Retornar lista

**Endpoint**: `GET /api/talleres`

#### **2.5.3: Asignar Taller a Espacio**
- [ ] Crear función `asignarTallerEspacio`
- [ ] Validar que taller existe
- [ ] Validar que espacio existe
- [ ] Validar disponibilidad del espacio en las fechas del taller
- [ ] Actualizar `taller.espacioDeportivo`
- [ ] Retornar taller actualizado

**Endpoint**: `PUT /api/talleres/:id/asignar-espacio`

**Request Body**:
```json
{
  "espacioDeportivo": "ObjectId"
}
```

**Criterios de Aceptación**:
- [ ] CRUD de talleres funciona
- [ ] Asignación valida disponibilidad
- [ ] Solo admin puede crear/modificar

---

### **Tarea 2.6: Crear Rutas de Admin**
**Archivo**: `backend/routes/adminRoutes.js` (crear nuevo)

**Checklist**:
- [ ] Crear archivo de rutas
- [ ] Importar `requireAdmin` middleware
- [ ] Definir rutas:
  - [ ] `GET /reservas` → `listarTodasReservas`
  - [ ] `PUT /reservas/:id/cancelar` → `cancelarReservaAdmin`
  - [ ] `GET /usuarios` → `listarTodosUsuarios`
  - [ ] `PUT /usuarios/:id/inhabilitar` → `inhabilitarUsuario`
- [ ] Registrar en `app.js`:
  ```javascript
  app.use('/api/admin', requireAdmin, adminRoutes);
  ```

**Criterios de Aceptación**:
- [ ] Rutas creadas y registradas
- [ ] Middleware aplicado correctamente

---

### **Checkpoint Día 2 Backend**
- [ ] Modelo de reservas actualizado
- [ ] Endpoints de reservas funcionando
- [ ] Validación de disponibilidad funcionando
- [ ] Endpoints de admin funcionando
- [ ] Reservas recurrentes funcionando
- [ ] Endpoints de talleres funcionando
- [ ] Testing manual completo

---

## 🎨 DÍA 3: Métricas y Optimización

### **Tarea 3.1: Endpoint de Disponibilidad**
**Archivo**: `backend/api/reservas/reservasController.js`

**Checklist**:
- [ ] Crear función `obtenerDisponibilidad`
- [ ] Validar query params:
  - [ ] `espacioDeportivo`: ObjectId (requerido)
  - [ ] `fechaInicio`: Date (requerido)
  - [ ] `fechaFin`: Date (requerido)
- [ ] **Lógica**:
  - [ ] Buscar todas las reservas activas del espacio en el rango
  - [ ] Calcular slots disponibles (ej: cada hora)
  - [ ] Marcar slots ocupados
  - [ ] Retornar array de slots con estado

**Endpoint**: `GET /api/reservas/disponibilidad`

**Query Params**:
- `espacioDeportivo`: ObjectId
- `fechaInicio`: Date
- `fechaFin`: Date

**Response 200**:
```json
{
  "success": true,
  "disponibilidad": [
    {
      "fechaInicio": "2025-01-15T10:00:00Z",
      "fechaFin": "2025-01-15T11:00:00Z",
      "disponible": true
    },
    {
      "fechaInicio": "2025-01-15T11:00:00Z",
      "fechaFin": "2025-01-15T12:00:00Z",
      "disponible": false,
      "reservaId": "ObjectId"
    }
  ]
}
```

**Criterios de Aceptación**:
- [ ] Retorna disponibilidad correcta
- [ ] Maneja rangos de fechas grandes eficientemente

---

### **Tarea 3.2: Endpoint de Métricas**
**Archivo**: `backend/api/admin/adminController.js`

**Checklist**:
- [ ] Crear función `obtenerMetricas`
- [ ] **Métricas a calcular**:
  - [ ] Total de reservas (último mes)
  - [ ] Reservas activas vs canceladas
  - [ ] Usuarios activos (con al menos 1 reserva)
  - [ ] Espacios más usados (top 5)
  - [ ] Reservas por día de la semana
  - [ ] Tasa de cancelación
- [ ] Usar agregaciones de MongoDB para eficiencia
- [ ] Retornar objeto con todas las métricas

**Endpoint**: `GET /api/admin/metricas`

**Query Params** (opcionales):
- `fechaDesde`: Date (default: último mes)
- `fechaHasta`: Date (default: hoy)

**Response 200**:
```json
{
  "success": true,
  "metricas": {
    "totalReservas": 150,
    "reservasActivas": 120,
    "reservasCanceladas": 30,
    "usuariosActivos": 45,
    "espaciosMasUsados": [
      {
        "espacio": "ObjectId",
        "nombre": "Cancha 1",
        "totalReservas": 50
      }
    ],
    "reservasPorDia": {
      "lunes": 20,
      "martes": 25,
      ...
    },
    "tasaCancelacion": 0.2
  }
}
```

**Criterios de Aceptación**:
- [ ] Métricas calculadas correctamente
- [ ] Consultas optimizadas (usar agregaciones)
- [ ] Respuesta rápida (< 1 segundo)

---

### **Tarea 3.3: Optimización y Mejoras**
**Checklist**:
- [ ] **Índices de BD**:
  - [ ] Verificar índices en reservas (espacioDeportivo + fechaInicio)
  - [ ] Verificar índices en usuarios (email, estadoValidacion)
  - [ ] Agregar índices faltantes si es necesario
- [ ] **Validación de datos**:
  - [ ] Revisar todas las validaciones Joi
  - [ ] Agregar mensajes de error descriptivos
- [ ] **Manejo de errores**:
  - [ ] Middleware de manejo de errores centralizado
  - [ ] Errores consistentes (mismo formato)
- [ ] **Logging**:
  - [ ] Agregar logs importantes (creación de reservas, validaciones)
  - [ ] Usar niveles apropiados (info, warn, error)

---

### **Tarea 3.4: Documentación de API**
**Checklist**:
- [ ] Crear/actualizar `backend/doc/api-endpoints.md`
- [ ] Documentar todos los endpoints nuevos:
  - [ ] Método HTTP
  - [ ] URL
  - [ ] Headers requeridos
  - [ ] Body/Query params
  - [ ] Response format
  - [ ] Códigos de error
- [ ] Incluir ejemplos de requests/responses
- [ ] Documentar autenticación (cómo obtener token)

---

### **Tarea 3.5: Testing y Validación Final**
**Checklist**:
- [ ] **Testing Manual de Endpoints**:
  - [ ] Registro de usuario
  - [ ] Login
  - [ ] Validación de usuario (admin)
  - [ ] Crear reserva
  - [ ] Cancelar reserva
  - [ ] Reserva recurrente
  - [ ] Endpoints de admin
  - [ ] Disponibilidad
  - [ ] Métricas
- [ ] **Validación de Seguridad**:
  - [ ] Tokens expiran correctamente
  - [ ] Rutas protegidas no accesibles sin token
  - [ ] Rutas de admin no accesibles sin rol admin
  - [ ] Usuarios no pueden acceder a datos de otros usuarios
- [ ] **Validación de Performance**:
  - [ ] Endpoints responden en < 500ms (excepto métricas)
  - [ ] No hay consultas N+1
  - [ ] Índices funcionan correctamente

---

### **Checkpoint Día 3 Backend**
- [ ] Endpoint de disponibilidad funcionando
- [ ] Endpoint de métricas funcionando
- [ ] Optimizaciones aplicadas
- [ ] Documentación actualizada
- [ ] Testing completo realizado
- [ ] Backend listo para producción (MVP)

---

## ✅ Criterios de Aceptación Final Backend

### Funcionalidad
- [ ] Todos los endpoints funcionan correctamente
- [ ] Autenticación y autorización funcionan
- [ ] Validación de datos funciona
- [ ] Manejo de errores es consistente

### Seguridad
- [ ] Passwords están hasheados
- [ ] Tokens JWT funcionan correctamente
- [ ] Rutas protegidas correctamente
- [ ] Validación de permisos funciona

### Performance
- [ ] Endpoints responden rápidamente
- [ ] Índices de BD optimizados
- [ ] Consultas eficientes

### Calidad
- [ ] Código sigue buenas prácticas
- [ ] Manejo de errores apropiado
- [ ] Logging implementado
- [ ] Documentación actualizada

---

## 📝 Notas Técnicas Importantes

1. **Reutilizar código existente**: Aprovechar modelos y controladores ya creados
2. **Validación con Joi**: Todas las entradas deben validarse
3. **Manejo de archivos**: Usar `libs/storageAWS.js` para S3
4. **Errores consistentes**: Usar formato estándar para errores
5. **Índices de BD**: Agregar índices para consultas frecuentes
6. **Seguridad primero**: Nunca exponer passwords, validar permisos siempre

---

## 🚀 Comandos Útiles

```bash
# Iniciar servidor en desarrollo
cd backend
npm run dev

# Verificar conexión a MongoDB
# Revisar logs en consola

# Probar endpoints (usar Postman o curl)
curl -X POST http://localhost:3000/api/usuarios-complejos/registro \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","email":"test@test.com",...}'
```

---

**Última actualización**: Plan backend para desarrollo acelerado MVP
**Versión**: 1.0
**Estado**: 🟢 Listo para ejecución

