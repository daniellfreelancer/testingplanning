var express = require('express');
var router = express.Router();
const membershipController = require('../controllers/membershipFutbolController')
const upload = require('../libs/docsStorage');

router.post('/memberships/:year/:institutionId/price/:amount', membershipController.createMembership);
router.post('/memberships-update/:year/:clubId/price/:amount', membershipController.createMembershipNewMembers);
router.post('/new-membership-player/:clubId/:studentId', membershipController.createMembershipByPlayer)
router.patch('/update-status/:membershipId', membershipController.updateStatus)
router.patch('/update-payment',upload.single('recipe'), membershipController.updatePayment)
router.patch('/update-membership/:membershipId', membershipController.updateMemebership)
router.get('/get-memberships-club/:clubId', membershipController.getMembershipByClub)
router.get('/get-memberships-student/:studentId', membershipController.getMembershipByStudent)
router.delete('/delete-membership/:membershipId', membershipController.deleteMembership)



module.exports = router;