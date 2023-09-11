const Post = require('../models/post')
const Comment = require('../models/comments')
const { S3Client, PutObjectCommand, PutObjectRetentionCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto')
const sharp = require('sharp');
const mongoose = require('mongoose');

const bucketRegion = process.env.AWS_BUCKET_REGION
const bucketName = process.env.AWS_BUCKET_NAME
const publicKey = process.env.AWS_PUBLIC_KEY
const privateKey = process.env.AWS_SECRET_KEY

const clientAWS = new S3Client({
    region: bucketRegion,
    credentials: {
        accessKeyId: publicKey,
        secretAccessKey: privateKey,
    },
})

const quizIdentifier = () => crypto.randomBytes(32).toString('hex')


const PostQueryPopulate = [
    {
        path: 'user',
        select: 'name lastName role imgUrl',
    },
    {
        path: 'comments',
        select: 'name lastName role imgUrl user text replies',
        populate: {
            path: 'user',
            select: 'name lastName imgUrl role',
        },
        populate: {
            path: 'replies',
            select: 'name lastName role imgUrl user text',
            populate: {
                path: 'user',
                select: 'name lastName imgUrl role',
            },
        },
    },
];

const postController = {
    // createPost: async (req, res) => {
    //     try {
    //         const { user, postImage, commentsAllow } = req.body;
    //         const newPost = new Post({
    //             user,
    //             likes: [],
    //             commentsAllow,
    //             comments: [],
    //         });


    //         const imageResized = await sharp(req.file.buffer).resize({
    //             width: 1080,
    //             height: 1920,
    //          }).toBuffer()

    //           const fileContent = imageResized;
    //           const extension = req.file.originalname.split('.').pop();
    //           const fileName = `post-image-${quizIdentifier()}.${extension}`;

    //           const uploadParams = {
    //             Bucket: bucketName,
    //             Key: fileName,
    //             Body: imageResized,
    //           };

    //           // Subir la imagen a S3
    //           const uploadCommand = new PutObjectCommand(uploadParams);
    //           await clientAWS.send(uploadCommand);

    //           await  newPost.postImage = filename


    //           await newPost.save();

    //         return res.status(201).json({ message: 'Post created successfully', post: newPost });
    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).json({ message: 'Error creating post' });
    //     }
    // },

    createPost: async (req, res) => {
        try {
            const { user, commentsAllow, text, videoPost } = req.body;

            if (!req.file) {
                return res.status(400).json({ message: 'Sin imagen cargada' });
            }

            const fileContent = req.file.buffer;
            const extension = req.file.originalname.split('.').pop();
            const fileName = `post-image-${quizIdentifier()}.${extension}`;

            const uploadParams = {
                Bucket: bucketName,
                Key: fileName,
                Body: fileContent,
            };

            // Subir la imagen a S3
            const uploadCommand = new PutObjectCommand(uploadParams);
            await clientAWS.send(uploadCommand);

            const newPost = new Post({
                user,
                postImage: fileName, // Asigna el nombre del archivo a la propiedad postImage
                likes: [],
                commentsAllow,
                comments: [],
                text,
                videoPost
            });

            await newPost.save();

            return res.status(201).json({ message: 'Post creado correctamente', post: newPost });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error creating post' });
        }
    },
    likePost: async (req, res) => {
        try {
            const { postId, userId } = req.body;
            const post = await Post.findById(postId);

            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            if (post.likes.includes(userId)) {
                // Usuario ya dio like, entonces eliminamos el like
                post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
            } else {
                // Usuario no dio like previamente, agregamos el like
                post.likes.push(userId);
            }

            await post.save();
            return res.status(200).json({ message: 'Like/dislike updated', post });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error updating like/dislike' });
        }
    },

    addComment: async (req, res) => {
        try {
            const { postId, userId, text, parentCommentId } = req.body;

            //busco el post
            const post = await Post.findById(postId);

            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            const newComment = new Comment({
                user: userId,
                text,
            });

            if (parentCommentId) {
                // Este es un comentario de respuesta, lo adjuntamos al comentario padre
                const parentComment = await Comment.findById(parentCommentId);
                if (!parentComment) {
                    return res.status(404).json({ message: 'Parent comment not found' });
                }
                parentComment.replies.push(newComment);
                await parentComment.save();
            } else {
                // Este es un comentario principal del post
                post.comments.push(newComment);
                await newComment.save()
                await post.save();
            }

            return res.status(201).json({ message: 'Comment added successfully', comment: newComment });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error adding comment' });
        }
    },
    editComment: async (req, res) => {
        try {
            const { commentId, userId, text } = req.body;
            const comment = await Comment.findById(commentId);

            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            if (comment.user.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'Permission denied' });
            }

            comment.text = text;
            await comment.save();
            return res.status(200).json({ message: 'Comment edited successfully', comment });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error editing comment' });
        }
    },

    deleteComment: async (req, res) => {
        try {
            const { postId, commentId, userId } = req.body;
    
            // Buscar el post y actualizar el array comments para eliminar el comentario
            const updatedPost = await Post.findByIdAndUpdate(
                postId,
                { $pull: { comments: commentId } },
                { new: true }
            );
    
            if (!updatedPost) {
                return res.status(404).json({ message: 'Post not found' });
            }
    
            const comment = await Comment.findById(commentId);
    
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found in Comment collection' });
            }
    
            if (comment.user.toString() === userId.toString()) {
                // El usuario creador del comentario puede borrarlo
    
                // Eliminar el comentario de la colección Comment
                await Comment.findByIdAndDelete(commentId);
            } else {
                // Otros usuarios solo pueden editar su propio comentario
                return res.status(403).json({ message: 'Permission denied' });
            }
    
            return res.status(200).json({ message: 'Comment deleted successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error deleting comment' });
        }
    }

    ,
    deletePost: async (req, res) => {
        try {
            const { postId } = req.params;

            // Buscar el post por su _id
            const post = await Post.findById(postId);

            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            // Eliminar el archivo asociado en S3
            const fileName = post.postImage // Dependiendo de tu modelo
            if (fileName) {
                const deleteParams = {
                    Bucket: bucketName,
                    Key: fileName,
                };
                const deleteCommand = new DeleteObjectCommand(deleteParams);
                await clientAWS.send(deleteCommand);
            }

            // Eliminar el post en la base de datos
            await Post.findByIdAndDelete(postId);

            return res.status(200).json({ message: 'Post eliminado correctamente' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error deleting post' });
        }
    },
    getAllPosts: async (req, res) => {
        try {
            // Obtener todos los posts ordenados por fecha de creación descendente
            const posts = await Post.find().sort({ createdAt: -1 }).populate(PostQueryPopulate)

            return res.status(200).json({ response: posts, message: "Posts", success: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error fetching posts' });
        }
    },
    editPostText: async (req, res) => {
        try {
            const { postId, text } = req.body;

            // Buscar el post por su _id
            const post = await Post.findById(postId);

            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            // Actualizar el texto del post
            post.text = text;
            await post.save();

            return res.status(200).json({ message: 'Post text updated successfully', post });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error updating post text' });
        }
    },
    editReply: async (req, res) => {
        try {
            const { replyId, newText } = req.body;
    
            // Buscar el comentario que contiene el reply
            const parentComment = await Comment.findOne({ 'replies._id': replyId });
    
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
    
            // Encontrar y actualizar el reply dentro del comentario
            const reply = parentComment.replies.find(r => r._id.toString() === replyId);
    
            if (!reply) {
                return res.status(404).json({ message: 'Reply not found' });
            }
    
            reply.text = newText;
            await parentComment.save();
    
            return res.status(200).json({ message: 'Reply updated successfully', reply });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error updating reply' });
        }
    },
    // deleteReply: async (req, res) => {
    //     try {
    //         const { replyId } = req.params;
    
    //         // Buscar el comentario que contiene el reply
    //         const parentComment = await Comment.findOne({ 'replies._id': replyId });
    
    //         if (!parentComment) {
    //             return res.status(404).json({ message: 'Parent comment not found' });
    //         }
    
    //         // Eliminar el reply del comentario
    //         parentComment.replies = parentComment.replies.filter(r => r._id.toString() !== replyId);
    //         await parentComment.save();
    
    //         return res.status(200).json({ message: 'Reply deleted successfully' });
    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).json({ message: 'Error deleting reply' });
    //     }
    // }
    deleteReply: async (req, res) => {
        try {
            const { parentCommentId, replyId } = req.params;
    
            // Buscar el comentario principal por su _id
            const parentComment = await Comment.findById(parentCommentId);
    
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
    
            // Encontrar el reply dentro de las respuestas del comentario principal
            const replyToDeleteIndex = parentComment.replies.findIndex(reply => reply._id.toString() === replyId);
    
            if (replyToDeleteIndex === -1) {
                return res.status(404).json({ message: 'Reply not found in parent comment' });
            }
    
            // Eliminar el reply del comentario principal
            parentComment.replies.splice(replyToDeleteIndex, 1);
            await parentComment.save();
    
            return res.status(200).json({ message: 'Reply deleted successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error deleting reply' });
        }
    }
};

module.exports = postController;
