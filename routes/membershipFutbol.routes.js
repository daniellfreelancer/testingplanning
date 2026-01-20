var express = require('express');
var router = express.Router();
const membershipController = require('../controllers/membershipFutbolController')
const upload = require('../libs/docsStorage');

//router.post('/memberships/:year/:institutionId/price/:amount', membershipController.createMembership);
router.post('/memberships-update/:year/:clubId/price/:amount', membershipController.createMembershipNewMembers);
router.post('/new-membership-player/:clubId/:studentId', membershipController.createMembershipByPlayer)
router.patch('/update-status/:membershipId', membershipController.updateStatus)
router.patch('/update-payment',upload.single('recipe'), membershipController.updatePayment)
router.patch('/update-membership/:membershipId', membershipController.updateMemebership)
router.patch('/update-membership-amount/:clubId/:amount', membershipController.updateMembershipAmount)
router.get('/get-memberships-club/:clubId', membershipController.getMembershipByClub)
router.get('/get-memberships-student/:studentId', membershipController.getMembershipByStudent)
router.get('/get-memberships-active-clubs/:clubId/year/:year', membershipController.getMembershipsPlayersClub)

router.delete('/delete-membership/:membershipId', membershipController.deleteMembership)


// nuevo endpoint para crear ticket de pago para la membresía
router.post('/create-futbol-membership-ticket', membershipController.createFutbolMembershipTicket)
// nuevo endpoint para consultar el mes actual para poder pagar la membresia
router.get('/get-current-month-to-pay-membership/:rut', membershipController.getCurrentMonthtoPayMembership)
// nuevo endpoint para actualizar el mes de la membresia
router.patch('/update-membership-month', membershipController.updateMembershipMonth)
router.patch('/update-membership-amount/:membershipId', membershipController.updateMembershipAmount)


module.exports = router;