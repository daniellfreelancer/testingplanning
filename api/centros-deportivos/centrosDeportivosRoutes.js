const express = require('express');
const router = express.Router();
const centrosDeportivosController = require('./centrosDeportivosController');

router.post('/crear-centro-deportivo/:id', centrosDeportivosController.crearCentroDeportivo); // tested
router.put('/actualizar-centro-deportivo/:id', centrosDeportivosController.actualizarCentroDeportivo); //tested
router.get('/obtener-centro-deportivo/:id', centrosDeportivosController.obtenerCentroDeportivo); //tested
router.get('/obtener-todos-los-centros-deportivos', centrosDeportivosController.obtenerTodosLosCentrosDeportivos); //tested
router.post('/agregar-admin-a-centro-deportivo/:id', centrosDeportivosController.agregarAdminACentroDeportivo);// tested
router.post('/eliminar-admin-de-centro-deportivo/:id', centrosDeportivosController.eliminarAdminDeCentroDeportivo); //tested
router.post('/agregar-institucion-a-centro-deportivo/:id', centrosDeportivosController.agregarInstitucionACentroDeportivo);//tested
router.post('/eliminar-institucion-de-centro-deportivo/:id', centrosDeportivosController.eliminarInstitucionDeCentroDeportivo);//tested
router.delete('/eliminar-centro-deportivo/:id', centrosDeportivosController.eliminarCentroDeportivo);

module.exports = router;