var express = require('express');
const upload = require('../libs/storage');
const { createRequeriment, getRequerimentById, getRequeriments, updateRequeriment, deleteRequeriment, getAllRequeriments } = require('../controllers/requerimentController');

var router = express.Router();


router.post('/create', upload.fields([
    { name: 'imgFirstVMClass', maxCount: 1 },
    { name: 'imgSecondVMClass', maxCount: 1 },
    { name: 'imgThirdVMClass', maxCount: 1 }
  ]), createRequeriment  );
  router.get('/get-all', getAllRequeriments);
router.get('/get-by-id/:id', getRequerimentById );

router.put('/update/:id', updateRequeriment);
router.delete('/delete', deleteRequeriment)



module.exports = router;