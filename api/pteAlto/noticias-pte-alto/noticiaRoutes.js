const express = require('express');
const router = express.Router();
const noticiaController = require('./noticiaController');
const fileUpload = require('express-fileupload');

// Configurar express-fileupload
const fileUploadMiddleware = fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  abortOnLimit: true
});

// TODO: Agregar middleware de autenticación
// const { verifyToken, isAdmin } = require('../../../middleware/auth');

// ==================== RUTAS PÚBLICAS ====================

/**
 * GET /api/noticias-pte-alto/publicas
 * Obtener noticias públicas (sin autenticación)
 */
router.get('/publicas', noticiaController.getNoticiasPublicas);

/**
 * GET /api/noticias-pte-alto/destacadas
 * Obtener noticias destacadas
 */
router.get('/destacadas', noticiaController.getNoticiasDestacadas);

/**
 * GET /api/noticias-pte-alto/slug/:slug
 * Obtener noticia por slug (público)
 */
router.get('/slug/:slug', noticiaController.getNoticiaBySlug);

// ==================== RUTAS PROTEGIDAS (ADMIN) ====================

// TODO: Descomentar cuando tengas el middleware de autenticación
// router.use(verifyToken);
// router.use(isAdmin);

/**
 * GET /api/noticias-pte-alto
 * Obtener todas las noticias (Admin)
 * Query params:
 * - page: número de página (default: 1)
 * - limit: límite por página (default: 10)
 * - search: buscar por título o resumen
 * - estado: filtrar por estado (borrador, publicada, archivada)
 * - destacada: filtrar por destacada (true/false)
 * - categoria: filtrar por categoría
 */
router.get('/', noticiaController.getAllNoticias);

/**
 * GET /api/noticias-pte-alto/:id
 * Obtener noticia por ID
 */
router.get('/:id', noticiaController.getNoticiaById);

/**
 * POST /api/noticias-pte-alto
 * Crear nueva noticia
 * Body (form-data):
 * - titulo: string (requerido)
 * - slug: string (opcional, se genera automáticamente)
 * - resumen: string
 * - contenido: string (HTML) (requerido)
 * - imagenPrincipal: file (imagen)
 * - categoria: string (deportes, eventos, institucional, logros, comunidad, otro)
 * - estado: string (borrador, publicada, archivada)
 * - destacada: boolean
 * - publicada: boolean
 * - fechaPublicacion: date
 * - urlExterna: string
 * - redirigirExterna: boolean
 * - notificarUsuarios: boolean
 * - orden: number
 */
router.post('/', fileUploadMiddleware, noticiaController.createNoticia);

/**
 * PUT /api/noticias-pte-alto/:id
 * Actualizar noticia
 */
router.put('/:id', fileUploadMiddleware, noticiaController.updateNoticia);

/**
 * PATCH /api/noticias-pte-alto/:id/toggle-destacada
 * Toggle destacada (cambiar estado destacada)
 */
router.patch('/:id/toggle-destacada', noticiaController.toggleDestacada);

/**
 * POST /api/noticias-pte-alto/:id/imagenes
 * Agregar imágenes adicionales a una noticia
 */
router.post('/:id/imagenes', fileUploadMiddleware, noticiaController.addImagenes);

/**
 * DELETE /api/noticias-pte-alto/:id/imagenes/:imagenId
 * Eliminar imagen adicional
 */
router.delete('/:id/imagenes/:imagenId', noticiaController.deleteImagen);

/**
 * DELETE /api/noticias-pte-alto/:id
 * Eliminar noticia
 */
router.delete('/:id', noticiaController.deleteNoticia);

module.exports = router;
