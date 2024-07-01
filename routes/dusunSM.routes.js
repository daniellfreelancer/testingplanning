let express = require('express');
const { registerData, getAllData, getBleAddress, deleteData, getDataFromResume } = require('../controllers/dusunSMController');
const router = express.Router();

router.post('/register', registerData)
router.get('/get-all', getAllData)
router.get('/device-addr', getBleAddress)
router.get('/resume/:start/:end', getDataFromResume )
router.delete('/delete-data', deleteData)


module.exports = router