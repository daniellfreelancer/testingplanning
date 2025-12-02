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
router.get('/admin/todas', reservasPteAltoController.listarTodasReservas);

// Obtener reserva por ID
router.get('/admin/:id', reservasPteAltoController.obtenerReservaPorId);

// Cancelar reserva (admin)
router.put('/admin/:id/cancelar', reservasPteAltoController.cancelarReservaAdmin);

module.exports = router;

