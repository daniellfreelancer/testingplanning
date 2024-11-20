var express = require('express');
var router = express.Router();const upload = require('../libs/docsStorage');
const { createClub, getClubs, getClubById, updateClubLogo, deleteClub } = require('../controllers/clubController')

router.post('/create-club/:institutionId', createClub)
router.get('/get-clubs', getClubs)
router.get('/get-club/:id', getClubById)
router.patch('/update-club-logo/:id', upload.single('logo'), updateClubLogo)
router.delete('/delete-club/:clubId/institution/:institutionId', deleteClub)

module.exports = router;