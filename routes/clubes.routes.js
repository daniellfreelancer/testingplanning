var express = require('express');
var router = express.Router();const upload = require('../libs/docsStorage');
const { createClub, getClubs, getClubById, updateClubLogo, deleteClub, getClubByInstitution, addPlayer, removePlayer } = require('../controllers/clubController')

router.post('/create-club/:institutionId', createClub)
router.get('/get-clubs', getClubs)
router.get('/get-club/:id', getClubById)
router.get('/get-clubs-institution/:institutionId', getClubByInstitution)
router.patch('/update-club-logo/:id', upload.single('logo'), updateClubLogo)
router.patch('/add-player/club/:clubId/player/:playerId', addPlayer)
router.patch('/remove-player/club/:clubId/player/:playerId', removePlayer)

router.delete('/delete-club/:clubId/institution/:institutionId', deleteClub)

module.exports = router;