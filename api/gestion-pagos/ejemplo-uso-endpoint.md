# Ejemplo de uso del endpoint getPagosByInstitucion

## Endpoints corregidos

### 1. getPagosByInstitucion
`GET /api/gestion-pagos/pagos-institucion/:institucionId`

**Funcionalidad:**
- **Sin query parameter**: Devuelve todos los pagos de la institución
- **Con query parameter `recepcion`**: Filtra los pagos por la recepción específica

### 2. getPagosToday
`GET /api/gestion-pagos/pagos-hoy`

**Funcionalidad:**
- **Sin query parameters**: Devuelve todos los pagos del día actual de todas las instituciones
- **Con query parameter `institucion`**: Filtra por institución específica
- **Con query parameter `recepcion`**: Filtra por recepción específica
- **Con ambos parámetros**: Filtra por institución y recepción del día actual

## Ejemplos de uso

### 1. Obtener todos los pagos de la institución
```http
GET http://localhost:4000/pagos-piscinas/pagos-institucion/6877f7f9c1f4bd360cce0496
```

**Respuesta esperada**: Todos los pagos de la institución "Institución Parque O'Higgins"

### 2. Filtrar por recepción específica
```http
GET http://localhost:4000/pagos-piscinas/pagos-institucion/6877f7f9c1f4bd360cce0496?recepcion=68c410962e7191fd7eb71371
```

**Respuesta esperada**: Solo los pagos recibidos por "Test Prueba" (ID: 68c410962e7191fd7eb71371)

### 3. Filtrar por otra recepción
```http
GET http://localhost:4000/pagos-piscinas/pagos-institucion/6877f7f9c1f4bd360cce0496?recepcion=6883988cc39c0f04380f04f8
```

**Respuesta esperada**: Solo los pagos recibidos por "Admin Piscina Santiago" (ID: 6883988cc39c0f04380f04f8)

## Ejemplos de uso para getPagosToday

### 1. Obtener todos los pagos del día actual
```http
GET http://localhost:4000/pagos-piscinas/pagos-hoy
```

**Respuesta esperada**: Todos los pagos del día actual de todas las instituciones

### 2. Filtrar por institución específica del día actual
```http
GET http://localhost:4000/pagos-piscinas/pagos-hoy?institucion=6877f7f9c1f4bd360cce0496
```

**Respuesta esperada**: Solo los pagos del día actual de "Institución Parque O'Higgins"

### 3. Filtrar por recepción específica del día actual
```http
GET http://localhost:4000/pagos-piscinas/pagos-hoy?recepcion=68dc42e5ad5e16bc7d338ed5
```

**Respuesta esperada**: Solo los pagos del día actual recibidos por "Giselle Palominos"

### 4. Filtrar por institución y recepción del día actual
```http
GET http://localhost:4000/pagos-piscinas/pagos-hoy?institucion=6877f7f9c1f4bd360cce0496&recepcion=68dc42e5ad5e16bc7d338ed5
```

**Respuesta esperada**: Solo los pagos del día actual de "Institución Parque O'Higgins" recibidos por "Giselle Palominos"

## Recepciones disponibles en los datos de ejemplo

Según el archivo `pagos.md`, hay 3 recepciones diferentes:

1. **Test Prueba** (ID: `68c410962e7191fd7eb71371`)
   - Email: daniellugofreelancer@gmail.com
   - RUT: 272101922

2. **Admin Piscina Santiago** (ID: `6883988cc39c0f04380f04f8`)
   - Email: adminpiscinastgo@vitalmoveglobal.com
   - RUT: 0

3. **Giselle Palominos** (ID: `68dc42e5ad5e16bc7d338ed5`)
   - Email: gpalominos@piscinatemperadastgo.cl
   - RUT: 192391415

## Logs de depuración

El controlador ahora incluye logs para depuración:
- `Institucion ID`: Muestra el ID de la institución recibido
- `Recepcion query`: Muestra el parámetro de recepción (si existe)
- `Filtro aplicado`: Muestra el filtro que se aplicará a MongoDB
- `Pagos encontrados`: Muestra cuántos pagos se encontraron

## Estructura de respuesta

```json
{
    "message": "Pagos obtenidos correctamente",
    "pagos": [
        {
            "_id": "68cae4c0e1ad578c3b2db341",
            "usuario": {
                "_id": "68ade7c194af76fa2b53719d",
                "nombre": "Karys Naelle Adaia",
                "apellido": "Barroso Rojas",
                "email": "KENIEL.BARROSO@GMAIL.COM",
                "rut": "269425202"
            },
            "institucion": {
                "_id": "6877f7f9c1f4bd360cce0496",
                "nombre": "Institución Parque O'Higgins"
            },
            "transaccion": "8585",
            "voucher": "52",
            "monto": 5000,
            "fechaPago": "2025-09-17T12:22:46.118Z",
            "recepcion": {
                "_id": "68c410962e7191fd7eb71371",
                "nombre": "Test",
                "apellido": "Prueba",
                "email": "daniellugofreelancer@gmail.com",
                "rut": "272101922"
            },
            "planCurso": {
                "_id": "68cab93e264d3edbb94d0123",
                "tipoPlan": "Curso Adulto 1",
                "plan": "1 dia / semana",
                "dias": ["sabado"],
                "valor": 30000
            },
            "createdAt": "2025-09-17T16:41:36.383Z",
            "updatedAt": "2025-09-17T16:41:36.383Z"
        }
    ],
    "success": true
}
```

## Cambios realizados

1. **Filtro dinámico**: Se construye el filtro solo con los parámetros necesarios
2. **Populate correcto**: Se aplica `populate` directamente en la consulta
3. **Logs de depuración**: Se agregaron logs para facilitar el debugging
4. **Manejo de errores mejorado**: Se incluye más información en los errores
5. **Eliminación de lógica redundante**: Se removió el filtrado manual innecesario
6. **⚠️ PROBLEMA RESUELTO**: Se eliminó la ruta duplicada que causaba el problema
7. **✅ getPagosToday actualizado**: Se aplicó la misma lógica de filtrado dinámico

## Problema identificado y solucionado

**El problema era que había DOS rutas diferentes:**
- `router.get('/pagos-institucion/:institucion', gestionPagosController.pagosInstitucion);` (SIN filtrado)
- `router.get('/pagos-institucion/:institucionId', gestionPagosController.getPagosByInstitucion);` (CON filtrado)

**La URL `/pagos-institucion/6877f7f9c1f4bd360cce0496` coincidía con la primera ruta** que llamaba a `pagosInstitucion`, una función que NO tenía filtrado por recepción.

**Solución aplicada:**
1. ✅ Eliminé la ruta duplicada (línea 7)
2. ✅ Eliminé la función `pagosInstitucion` obsoleta
3. ✅ Mantuve solo `getPagosByInstitucion` con filtrado correcto

**Ahora el endpoint funciona correctamente:**
- Sin query: Devuelve todos los pagos de la institución
- Con query `recepcion`: Filtra por recepción específica
