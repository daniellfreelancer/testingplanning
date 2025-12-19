# Sistema de Citas con Profesionales de la UCAD

## Objetivo
Crear un sistema de citas con profesionales de la UCAD, donde los profesionales puedan ver las citas agendadas y los deportistas puedan agendar citas con los profesionales.

## Arquitectura del Sistema

### Modelos de Datos

#### 1. Agenda UCAD (`agenda-ucad.js`)
Define la disponibilidad base de un profesional:
- `profesional`: Referencia al usuario con rol 'profesional'
- `dias`: Array de días de la semana (ej: ['lunes', 'martes', 'miércoles'])
- `horaInicio`: Hora de inicio de disponibilidad (formato: "HH:mm")
- `horaFin`: Hora de fin de disponibilidad (formato: "HH:mm")
- `status`: Estado activo/inactivo de la agenda

#### 2. Citas UCAD (`citas-ucad.js`) - **A CREAR**
Define las citas agendadas:
- `deportista`: Referencia al usuario con rol 'deportista'
- `profesional`: Referencia al usuario con rol 'profesional'
- `especialidad`: Tipo de especialidad (Nutrición Deportiva, Medicina del Deporte, Psicología del Deporte)
- `tipoCita`: Tipo de cita (consulta, emergencia)
- `fecha`: Fecha y hora de la cita (Date)
- `duracion`: Duración en minutos (default: 30)
- `estado`: Estado de la cita (pendiente, confirmada, completada, cancelada)
- `notas`: Notas adicionales
- `motivoCancelacion`: Motivo si fue cancelada

## Flujos del Sistema

### Flujo para Deportistas

1. **Solicitar cita con un profesional**
   - Selecciona especialidad (Nutrición Deportiva, Medicina del Deporte, Psicología del Deporte)
   - Selecciona el profesional (filtrado por especialidad)
   - Selecciona el tipo de cita (consulta, emergencia)
   - Selecciona la fecha
   - El sistema muestra las horas disponibles (en bloques de 30 minutos)
   - Selecciona la hora
   - Presiona confirmar reserva

**Frontend**: `/VitalMoveCar/app/pages/vm/Appointments.jsx`

### Flujo para Profesionales

1. **Configuración inicial**
   - Se crea un usuario-ucad con rol 'profesional'
   - Se le asigna una agenda (disponibilidad de horarios)
   - La agenda define días de la semana, hora inicio y hora fin

2. **Gestión de citas**
   - Ver citas agendadas (pendientes, confirmadas, completadas)
   - Confirmar o rechazar citas pendientes
   - Marcar citas como completadas
   - Ver disponibilidad de horarios

## Endpoints Requeridos

### Agenda UCAD (`/api/car/ucad-agenda`)

#### 1. Crear/Actualizar Agenda
- **POST** `/crear-agenda` - Crear nueva agenda para un profesional
- **PUT** `/actualizar-agenda/:id` - Actualizar agenda existente
- **GET** `/agenda-profesional/:profesionalId` - Obtener agenda de un profesional

#### 2. Disponibilidad
- **GET** `/disponibilidad/:profesionalId/:fecha` - Obtener horarios disponibles de un profesional en una fecha específica
  - Retorna array de horarios disponibles en bloques de 30 minutos
  - Excluye horarios ya ocupados por citas existentes

### Citas UCAD (`/api/car/ucad-citas`) - **A CREAR**

#### 1. Gestión de Citas
- **POST** `/crear-cita` - Crear nueva cita (deportista)
- **GET** `/mis-citas/:deportistaId` - Obtener citas de un deportista
- **GET** `/citas-profesional/:profesionalId` - Obtener citas de un profesional
- **GET** `/cita/:citaId` - Obtener detalle de una cita
- **PUT** `/confirmar-cita/:citaId` - Confirmar cita (profesional)
- **PUT** `/cancelar-cita/:citaId` - Cancelar cita (deportista o profesional)
- **PUT** `/completar-cita/:citaId` - Marcar cita como completada (profesional)

#### 2. Disponibilidad
- **GET** `/horarios-disponibles/:profesionalId/:fecha` - Obtener horarios disponibles para agendar

## Plan de Desarrollo

### Fase 1: Modelos y Estructura Base ✅
- [x] Modelo `agenda-ucad.js` (ya existe)
- [ ] Modelo `citas-ucad.js` (crear)
- [ ] Validar estructura de datos

### Fase 2: Controladores de Agenda
- [ ] `crearAgenda` - Crear agenda para profesional
- [ ] `actualizarAgenda` - Actualizar agenda existente
- [ ] `obtenerAgendaProfesional` - Obtener agenda de un profesional
- [ ] `obtenerDisponibilidad` - Calcular horarios disponibles en una fecha

### Fase 3: Controladores de Citas
- [ ] `crearCita` - Crear nueva cita con validaciones
- [ ] `obtenerCitasDeportista` - Listar citas de un deportista
- [ ] `obtenerCitasProfesional` - Listar citas de un profesional
- [ ] `obtenerCita` - Obtener detalle de una cita
- [ ] `confirmarCita` - Confirmar cita pendiente
- [ ] `cancelarCita` - Cancelar cita
- [ ] `completarCita` - Marcar cita como completada
- [ ] `obtenerHorariosDisponibles` - Calcular horarios disponibles para agendar

### Fase 4: Rutas y Middleware
- [ ] Rutas de agenda (`agenda-ucad.routes.js`)
- [ ] Rutas de citas (`citas-ucad.routes.js`)
- [ ] Middleware de validación (Joi schemas)
- [ ] Middleware de autenticación
- [ ] Registrar rutas en `app.js`

### Fase 5: Validaciones y Lógica de Negocio
- [ ] Validar que el profesional tenga agenda configurada
- [ ] Validar que el horario esté dentro del rango de disponibilidad
- [ ] Validar que no haya conflictos de horarios
- [ ] Validar que la fecha no sea en el pasado
- [ ] Validar duración de bloques (30 minutos)
- [ ] Validar que el profesional esté activo

### Fase 6: Integración Frontend
- [ ] Actualizar `Appointments.jsx` para usar nuevos endpoints
- [ ] Implementar carga de profesionales por especialidad
- [ ] Implementar carga de horarios disponibles dinámicamente
- [ ] Implementar confirmación de citas

### Fase 7: Notificaciones (Opcional)
- [ ] Email de confirmación de cita
- [ ] Email de recordatorio de cita
- [ ] Notificación de cancelación

## Consideraciones Técnicas

### Bloques de Tiempo
- Las citas se agendan en bloques de 30 minutos
- El sistema debe calcular automáticamente los bloques disponibles
- Ejemplo: Si agenda es 09:00 - 17:00, los bloques serían:
  - 09:00 - 09:30
  - 09:30 - 10:00
  - 10:00 - 10:30
  - ... hasta 16:30 - 17:00

### Validaciones Importantes
1. **Horario dentro de disponibilidad**: La cita debe estar dentro del rango horaInicio - horaFin
2. **Día de la semana**: La fecha debe coincidir con uno de los días configurados en la agenda
3. **Sin conflictos**: No puede haber dos citas en el mismo horario con el mismo profesional
4. **Fecha futura**: No se pueden agendar citas en el pasado
5. **Profesional activo**: El profesional debe tener estadoValidacion = 'validado'

### Índices de Base de Datos
- Índice en `citas-ucad.profesional` + `citas-ucad.fecha` para búsquedas rápidas
- Índice en `citas-ucad.deportista` + `citas-ucad.fecha` para listar citas del deportista
- Índice en `citas-ucad.estado` para filtrar por estado

## Estructura de Archivos

```
backend/api/car/
├── ucad-agenda/
│   ├── agenda-ucad.js (✅ existe)
│   ├── agenda-ucad-controller.js (📝 crear)
│   └── agenda-ucad.routes.js (📝 crear)
├── ucad-citas/
│   ├── citas-ucad.js (📝 crear)
│   ├── citas-ucad-controller.js (📝 crear)
│   └── citas-ucad.routes.js (📝 crear)
└── sistema-citas-ucad.md (✅ este archivo)
```

## Estado del Desarrollo

### ✅ Completado

1. **Modelo `citas-ucad.js`** - Creado con todos los campos necesarios e índices
2. **Controladores de agenda** - Implementados:
   - `crearAgenda` - Crear agenda para profesional
   - `actualizarAgenda` - Actualizar agenda existente
   - `obtenerAgendaProfesional` - Obtener agenda de un profesional
   - `obtenerDisponibilidad` - Calcular horarios disponibles
3. **Controladores de citas** - Implementados:
   - `crearCita` - Crear nueva cita con validaciones completas
   - `obtenerCitasDeportista` - Listar citas de un deportista
   - `obtenerCitasProfesional` - Listar citas de un profesional
   - `obtenerCita` - Obtener detalle de una cita
   - `confirmarCita` - Confirmar cita pendiente
   - `cancelarCita` - Cancelar cita
   - `completarCita` - Marcar cita como completada
   - `obtenerHorariosDisponibles` - Calcular horarios disponibles para agendar
4. **Rutas creadas y registradas en app.js**:
   - `/ucad-agenda/*` - Rutas de agenda
   - `/ucad-citas/*` - Rutas de citas

### 📋 Próximos Pasos

1. **Probar endpoints con Postman/Thunder Client**
   - Probar creación de agenda
   - Probar creación de citas
   - Probar obtención de disponibilidad
   - Probar cancelación y confirmación

2. **Integrar con frontend**
   - Actualizar `Appointments.jsx` para usar nuevos endpoints
   - Implementar carga de profesionales por especialidad desde backend
   - Implementar carga dinámica de horarios disponibles
   - Implementar confirmación de citas

3. **Mejoras opcionales**
   - Agregar notificaciones por email
   - Agregar recordatorios de citas
   - Agregar historial de citas
   - Agregar estadísticas para profesionales

## Endpoints Disponibles

### Agenda UCAD (`/ucad-agenda`)

- `POST /crear-agenda` - Crear agenda para profesional
- `PUT /actualizar-agenda/:id` - Actualizar agenda
- `GET /agenda-profesional/:profesionalId` - Obtener agenda
- `GET /disponibilidad/:profesionalId/:fecha` - Obtener horarios disponibles

### Citas UCAD (`/ucad-citas`)

- `POST /crear-cita` - Crear nueva cita
- `GET /mis-citas/:deportistaId` - Citas de deportista
- `GET /citas-profesional/:profesionalId` - Citas de profesional
- `GET /cita/:citaId` - Detalle de cita
- `PUT /confirmar-cita/:citaId` - Confirmar cita
- `PUT /cancelar-cita/:citaId` - Cancelar cita
- `PUT /completar-cita/:citaId` - Completar cita
- `GET /horarios-disponibles/:profesionalId/:fecha` - Horarios disponibles
