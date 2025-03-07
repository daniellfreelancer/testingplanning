var express = require('express');
var router = express.Router();
const { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory, addTeacherToCategory, addPlayerToCategory, removePlayerFromCategory,    } = require('../controllers/sportCategoryController')


router.post('/create-category/:clubId', createCategory);
router.get('/get-categories', getCategories);
router.get('/get-category/:categoryId', getCategoryById);
router.patch('/update-category/:categoryId', updateCategory);
router.put('/add-teacher/:categoryId/teacher/:teacherId', addTeacherToCategory );
router.patch('/add-player/:categoryId/player/:playerId', addPlayerToCategory );
router.patch('/remove-player/:categoryId/player/:playerId', removePlayerFromCategory );
router.delete('/delete-category/:categoryId/club/:clubId', deleteCategory);



module.exports = router