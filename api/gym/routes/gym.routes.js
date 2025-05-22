const express = require('express');
const router = express.Router();
const gymController = require('../controllers/gym.controller')

router.post('/create', gymController.createGym)
router.get('/all', gymController.getAllGyms)
router.get('/gym/:id', gymController.getGymById)    
router.put('/update/:id', gymController.updateGym)
router.delete('/delete/:id', gymController.deleteGym)

module.exports = router