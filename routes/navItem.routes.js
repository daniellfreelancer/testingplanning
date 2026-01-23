const express = require('express');
const router = express.Router();
const navItemController = require('../controllers/navItemController');

// Rutas públicas
router.get('/activos', navItemController.getNavItemsActivos);

// Rutas protegidas (requieren autenticación)
router.post('/initialize', navItemController.initializeDefaultNavItems);
router.post('/', navItemController.createNavItem);
router.get('/', navItemController.getAllNavItems);
router.get('/:id', navItemController.getNavItemById);
router.put('/:id', navItemController.updateNavItem);
router.delete('/:id', navItemController.deleteNavItem);
router.post('/reorder', navItemController.reorderNavItems);

module.exports = router;
