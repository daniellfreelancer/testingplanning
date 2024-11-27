var express = require('express');
var router = express.Router();
const { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory   } = require('../controllers/sportCategoryController')


router.post('/create-category/:clubId', createCategory);
router.get('/get-categories', getCategories);
router.get('/get-category/:id', getCategoryById);
router.patch('/update-category/:categoryId', updateCategory);
router.delete('/delete-category/:categoryId/club/:clubId', deleteCategory);


module.exports = router