# Planificación de Desarrollo - Backend

## Tecnologías
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Base de Datos:** MongoDB (usando Mongoose ODM)
*   **Autenticación:** JWT (JSON Web Tokens)

## Roadmap de Implementación (2 Días)

### DÍA 1: Estructura, Datos y Autenticación

#### 1. Configuración Inicial (09:00 - 10:30)
- [ ] Inicializar proyecto Node.js (`npm init -y`).
- [ ] Instalar dependencias: `express`, `mongoose`, `cors`, `dotenv`, `jsonwebtoken`, `bcryptjs`, `morgan`.
- [ ] Configurar conexión a MongoDB (Atlas o Local).
- [ ] Configurar servidor Express básico con CORS y middlewares.

#### 2. Definición de Modelos (Mongoose) (10:30 - 12:30)
- [ ] **User Model**:
    - `nombre`: String
    - `rut`: String (Unique)
    - `email`: String (Unique)
    - `password`: String (Hashed)
    - `rol`: Enum ['deportista', 'profesional', 'admin', 'colaborador']
    - `especialidad`: String (Solo para profesionales)
    - `foto_perfil`: String (URL opcional)
- [ ] **Box Model**:
    - `nombre`: String (ej. "Box 1", "Box 2")
    - `estado`: Enum ['disponible', 'ocupado', 'mantencion']
    - `reservas`: Array de referencias a Citas (opcional, para calendario rápido)
- [ ] **Cita Model**:
    - `deportista`: Ref 'User'
    - `profesional`: Ref 'User'
    - `box`: Ref 'Box'
    - `fecha_inicio`: Date
    - `fecha_fin`: Date
    - `estado`: Enum ['solicitada', 'confirmada', 'realizada', 'cancelada', 'derivada', 'ausente']
    - `motivo`: String
    - `notas`: String
    - `calificacion`: Number (1-5)

#### 3. Autenticación & Seeders (12:30 - 14:00)
- [ ] **Auth Controller**:
    - `POST /api/auth/register`: Registro de usuarios.
    - `POST /api/auth/login`: Login y retorno de JWT.
- [ ] **Middleware**:
    - `verifyToken`: Validar JWT en rutas protegidas.
- [ ] **Seeders** (Script para poblar BD):
    - Crear 1 Admin (`admin@car.cl`).
    - Crear 2 Profesionales (Psicólogo, Nutricionista).
    - Crear 2 Deportistas.
    - Crear 2 Boxes ("Box Alpha", "Box Beta").

#### 4. Endpoints de Lectura (15:00 - 18:00)
- [ ] **Citas Controller**:
    - `GET /api/citas`: 
        - Admin: ve todas. 
        - Prof: ve las suyas. 
        - Deportista: ve las suyas.
    - `GET /api/citas/:id`: Detalle de una cita.
- [ ] **User Controller**:
    - `GET /api/users/profile`: Obtener datos del usuario logueado.
- [ ] **Box Controller**:
    - `GET /api/boxes`: Listar boxes y disponibilidad.

---

### DÍA 2: Lógica de Negocio y Escritura

#### 1. Gestión de Citas (09:00 - 13:00)
- [ ] `POST /api/citas` (Crear Cita):
    - **Lógica de Asignación**: 
        1. Recibe fecha y profesional.
        2. Verifica si el Profesional está libre.
        3. Verifica Box disponible (Box 1 o Box 2).
        4. Asigna Box automáticamente.
        5. Guarda Cita.
- [ ] `PUT /api/citas/:id`: 
    - Modificar estado (ej. de 'solicitada' a 'confirmada' o 'realizada').
    - Agregar `notas` post-atención.

#### 2. Derivaciones y Feedback (14:00 - 17:00)
- [ ] **Derivación**: 
    - Endpoint especial o flag en `POST /citas` que vincule con una cita anterior (`cita_origen_id`).
- [ ] **Evaluación**:
    - `PUT /api/citas/:id/rate`: Deportista califica la atención.

#### 3. Notificaciones "Polling" (17:00 - 18:00)
- [ ] `GET /api/notifications`: (Simulado: Retornar las últimas 5 citas con cambios de estado recientes).

## Estructura de Proyecto Sugerida
```
/backend
  /src
    /config (db, env)
    /controllers (logic)
    /models (schemas)
    /routes (endpoints)
    /middleware (auth)
    index.js
```
