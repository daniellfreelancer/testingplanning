const { addInstitucionDecentralizada, getInstitucionesDecentralizadas, getInstitucionDecentralizadaporID, deleteInstitutionDecentralizada, updateInstitutionDecentralizada } = require('../controllers/instiDeController')

var express = require('express');
var router = express.Router();


router.post('/create-institution', addInstitucionDecentralizada)
router.get('/get-list', getInstitucionesDecentralizadas)
router.get('/get-by-id/:id', getInstitucionDecentralizadaporID)
router.put('/update-institution/:id', updateInstitutionDecentralizada)
router.delete('/delete-institution', deleteInstitutionDecentralizada)

module.exports = router