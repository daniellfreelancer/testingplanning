const express = require('express');
const router = express.Router();
const accessController = require('./accessController')

router.post('/create', accessController.createRegisterAccessControl)
router.get('/all', accessController.getAllRegisterAccessControl)
router.get('/institution/:institutionId', accessController.getRegisterAccessControlByInstitution)

module.exports = router