const express = require('express');
const router = express.Router();
const upload = require('../libs/docsStorage');
const postController = require('../controllers/postController');

// Rutas para los Posts
router.post('/posts/create', upload.single('postImage'), postController.createPost);
router.post('/posts/like', postController.likePost);
router.post('/posts/comment/add', postController.addComment);
router.put('/posts/comment/edit', postController.editComment);
router.delete('/posts/comment/delete', postController.deleteComment);
router.delete('/posts/:postId/delete', postController.deletePost);
router.get('/posts', postController.getAllPosts);
router.put('/posts/edit-text', postController.editPostText);
router.put('/posts/comment/reply/edit', postController.editReply); // Editar un reply de un comentario
router.delete('/posts/comment/reply/delete/:replyId/comment/:parentCommentId', postController.deleteReply); // Eliminar un reply de un comentario
router.get('/postsApp', postController.getPostsByFilter)


// Rutas para los Comentarios
// Si deseas manejar las rutas de los comentarios por separado, puedes hacerlo así:
// router.post('/comments/add', commentController.addComment);
// router.put('/comments/edit', commentController.editComment);
// router.delete('/comments/delete', commentController.deleteComment);

module.exports = router;
