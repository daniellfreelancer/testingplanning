const express = require('express');
const router = express.Router();
const reservasPteAltoController = require('./reservasPteAltoController');

// ============================================
// RUTAS PÚBLICAS / CONSULTA (Sin autenticación requerida)
// ============================================

// Consultar disponibilidad por deporte
router.get('/disponibilidad-por-deporte', reservasPteAltoController.consultarDisponibilidadPorDeporte);

// Consultar disponibilidad por fecha específica
router.get('/disponibilidad-por-fecha', reservasPteAltoController.consultarDisponibilidadPorFecha);

// Verificar disponibilidad de un rango específico
router.get('/verificar-disponibilidad', reservasPteAltoController.verificarDisponibilidadRango);

// ============================================
// RUTAS DE USUARIO (Requieren autenticación)
// ============================================

// Crear reserva de espacio deportivo
router.post('/crear-reserva-espacio', reservasPteAltoController.crearReservaEspacio);

// Inscribirse en un taller
router.post('/inscribirse-taller', reservasPteAltoController.inscribirseEnTaller);

// Listar reservas del usuario autenticado
router.get('/mis-reservas', reservasPteAltoController.misReservas);

// Cancelar reserva del usuario
router.put('/:id/cancelar', reservasPteAltoController.cancelarReserva);

// ============================================
// RUTAS DE ADMINISTRACIÓN (Requieren rol admin)
// ============================================

// Listar todas las reservas
router.get('/obtener-todas-las-reservas', reservasPteAltoController.listarTodasReservas);

// Listar reservas pobladas para el calendario
router.get('/reservas-calendario', reservasPteAltoController.listarReservasCalendario);

// Listar reservas por nombre de organización (reservadoPara)
router.post('/reservas-por-organizacion', reservasPteAltoController.listarReservasPorOrganizacion);

// Obtener reserva por ID
router.get('/obtener-reserva-por-id/:id', reservasPteAltoController.obtenerReservaPorId);

// Cancelar reserva (admin)
router.put('/cancelar-reserva/:id', reservasPteAltoController.cancelarReservaAdmin);

// Cancelación masiva (admin) — una notificación por email destinatario único
router.put('/admin/cancelar-reservas-masivo', reservasPteAltoController.cancelacionesMasivasReservasAdmin);

// Obtener complejo con espacios disponibles
router.get('/admin/complejo/:complejoId/espacios-disponibles', reservasPteAltoController.obtenerComplejoConEspaciosDisponibles);

// Crear reserva interna (admin)
router.post('/admin/crear-reserva-interna', reservasPteAltoController.crearReservaInterna);

// Validar reserva
router.get('/validar-reserva/:idReserva', reservasPteAltoController.validarReserva);

// Consultar disponibilidad de espacios para talleres (bloques de 15 minutos)
router.post('/disponibilidad-espacios-taller', reservasPteAltoController.consultarDisponibilidadEspaciosTaller);

module.exports = router;

