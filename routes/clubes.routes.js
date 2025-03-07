var express = require('express');
var router = express.Router();const upload = require('../libs/docsStorage');
const { createClub, getClubs, getClubById, updateClubLogo, deleteClub, getClubByInstitution, addPlayer, removePlayer, addTeacherToClub, removeTeacherFromClub } = require('../controllers/clubController')

router.post('/create-club/:institutionId', createClub)
router.get('/get-clubs', getClubs)
router.get('/get-club/:id', getClubById)
router.get('/get-clubs-institution/:institutionId', getClubByInstitution)
router.patch('/update-club-logo/:id', upload.single('logo'), updateClubLogo)
router.patch('/add-player/club/:clubId/player/:playerId', addPlayer)
router.patch('/remove-player/club/:clubId/player/:playerId', removePlayer)
router.patch('/add-teacher/club/:clubId/teacher/:teacherId', addTeacherToClub)
router.patch('/remove-teacher/club/:clubId/teacher/:teacherId', removeTeacherFromClub)


router.delete('/delete-club/:clubId/institution/:institutionId', deleteClub)

module.exports = router;