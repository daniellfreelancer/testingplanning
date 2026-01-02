const Post = require('../models/post');
const Institution = require('../models/institution');
const Program = require('../models/program');
const Comment = require('../models/comments');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const sharp = require('sharp');
const mongoose = require('mongoose');


const {
  s3Client,
  uploadMulterFile,
} = require('../utils/s3Client');

const bucketName = process.env.AWS_BUCKET_NAME;
const cloudfrontUrl = process.env.AWS_ACCESS_CLOUD_FRONT;

const quizIdentifier = () =>
  crypto.randomBytes(32).toString('hex');

const PostQueryPopulate = [
  {
    path: 'user',
    select: 'name lastName role imgUrl',
  },
  {
    path: 'comments',
    select: 'user replies text',
    populate: [
      {
        path: 'user',
        select: 'name lastName imgUrl role',
      },
      {
        path: 'replies',
        select: 'name lastName role imgUrl user text',
        populate: {
          path: 'user',
          select: 'name lastName imgUrl role',
        },
      },
    ],
  },
];

// helper para obtener URL de la imagen del post (imagen o video)
// Si ya es una URL completa (CloudFront), la devuelve tal cual
// Si es un key antiguo, genera la URL de CloudFront
async function attachSignedPostUrl(postDoc) {
  if (!postDoc || !postDoc.postImage) return postDoc;

  const plain = postDoc.toObject
    ? postDoc.toObject()
    : postDoc;

  try {
    // Si ya es una URL completa (contiene http:// o https://), la devolvemos tal cual
    if (plain.postImage && (plain.postImage.startsWith('http://') || plain.postImage.startsWith('https://'))) {
      return plain;
    }
    
    // Si es un key antiguo, generamos la URL de CloudFront
    plain.postImage = `${cloudfrontUrl}/${plain.postImage}`;
  } catch (err) {
    console.error(
      'Error generando URL para postImage:',
      err
    );
  }
  return plain;
}

const postController = {
  createPost: async (req, res) => {
    try {
      const {
        user,
        commentsAllow,
        text,
        videoPost,
        classroom,
        workshop,
      } = req.body;

      if (!req.file) {
        return res
          .status(400)
          .json({ message: 'Sin imagen cargada' });
      }

      const fileContent = req.file.buffer;
      const extension = req.file.originalname
        .split('.')
        .pop();
      const isVideo =
        extension.toLowerCase() === 'mp4';

      let key;
      let fileUrl;

      if (isVideo) {
        // video: subimos el buffer tal cual
        key = await uploadMulterFile(
          req.file,
          `post-video-${quizIdentifier()}.${extension}`
        );
        // Generamos la URL de CloudFront
        fileUrl = `${cloudfrontUrl}/${key}`;
      } else {
        // imagen: corregimos orientación + resize a 16:9 con sharp
        const exif = await sharp(fileContent).metadata();
        console.log('Información EXIF:', exif);

        const orientation = exif ? exif.orientation : 1;

        // Dimensiones en proporción 16:9 (1920x1080 Full HD)
        const targetWidth = 1920;
        const targetHeight = 1080;

        let optimizedImageBuffer;
        if (orientation === 6 || orientation === 8) {
          // Rotar imágenes de Samsung (orientación 6 u 8) y redimensionar a 16:9
          optimizedImageBuffer = await sharp(fileContent)
            .rotate(90)
            .resize(targetWidth, targetHeight, {
              fit: 'cover', // Llena el área manteniendo proporción, recortando si es necesario
              position: 'center'
            })
            .toBuffer();
        } else {
          // Redimensionar a 16:9 sin rotación
          optimizedImageBuffer = await sharp(fileContent)
            .resize(targetWidth, targetHeight, {
              fit: 'cover', // Llena el área manteniendo proporción, recortando si es necesario
              position: 'center'
            })
            .toBuffer();
        }

        const fakeFile = {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          fieldname:
            req.file.fieldname || 'postImage',
          buffer: optimizedImageBuffer,
        };

        key = await uploadMulterFile(
          fakeFile,
          `post-image-${quizIdentifier()}.${extension}`
        );
        // Generamos la URL de CloudFront
        fileUrl = `${cloudfrontUrl}/${key}`;
      }

      const newPost = new Post({
        user,
        postImage: fileUrl, // guardamos la URL completa de CloudFront
        likes: [],
        commentsAllow,
        comments: [],
        text,
        videoPost,
        classroom,
        workshop,
      });

      await newPost.save();

      return res.status(201).json({
        message: 'Post creado correctamente',
        post: newPost,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error creating post' });
    }
  },

  likePost: async (req, res) => {
    try {
      const { postId, userId } = req.body;
      const post = await Post.findById(postId);

      if (!post) {
        return res
          .status(404)
          .json({ message: 'Post not found' });
      }

      if (post.likes.includes(userId)) {
        post.likes = post.likes.filter(
          id => id.toString() !== userId.toString()
        );
      } else {
        post.likes.push(userId);
      }

      await post.save();
      return res.status(200).json({
        message: 'Like/dislike updated',
        post,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: 'Error updating like/dislike',
      });
    }
  },

  addComment: async (req, res) => {
    try {
      const {
        postId,
        userId,
        studentId,
        text,
        parentCommentId,
      } = req.body;

      const post = await Post.findById(postId);

      if (!post) {
        return res
          .status(404)
          .json({ message: 'Post not found' });
      }

      let newComment;

      if (userId) {
        newComment = new Comment({
          user: userId,
          text,
        });
      } else if (studentId) {
        newComment = new Comment({
          student: studentId,
          text,
        });
      } else {
        return res.status(400).json({
          message:
            'Debe proporcionar userId o studentId',
        });
      }

      if (parentCommentId) {
        const parentComment =
          await Comment.findById(parentCommentId);
        if (!parentComment) {
          return res.status(404).json({
            message: 'Parent comment not found',
          });
        }
        parentComment.replies.push(newComment);
        await parentComment.save();
      } else {
        post.comments.push(newComment);
        await newComment.save();
        await post.save();
      }

      return res.status(201).json({
        message: 'Comment added successfully',
        comment: newComment,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error adding comment' });
    }
  },

  editComment: async (req, res) => {
    try {
      const {
        commentId,
        userId,
        studentId,
        text,
      } = req.body;

      const comment = await Comment.findById(commentId);

      if (!comment) {
        return res
          .status(404)
          .json({ message: 'Comment not found' });
      }

      if (
        comment.user?.toString() === userId ||
        (studentId &&
          comment.student?.toString() ===
            studentId)
      ) {
        comment.text = text;
        await comment.save();
        return res.status(200).json({
          message: 'Comment edited successfully',
          comment,
        });
      } else {
        return res
          .status(403)
          .json({ message: 'Permission denied' });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error editing comment' });
    }
  },

  deleteComment: async (req, res) => {
    try {
      const { postId, commentId } = req.body;

      const updatedPost =
        await Post.findByIdAndUpdate(
          postId,
          { $pull: { comments: commentId } },
          { new: true }
        );

      if (!updatedPost) {
        return res
          .status(404)
          .json({ message: 'Post not found' });
      }

      const comment = await Comment.findById(commentId);

      if (!comment) {
        return res.status(404).json({
          message:
            'Comment not found in Comment collection',
        });
      }

      await Comment.findByIdAndDelete(commentId);

      return res.status(200).json({
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error deleting comment' });
    }
  },

  deletePost: async (req, res) => {
    try {
      const { postId } = req.params;

      const post = await Post.findById(postId);

      if (!post) {
        return res
          .status(404)
          .json({ message: 'Post not found' });
      }

      const postImage = post.postImage;
      if (postImage) {
        // Si es una URL completa de CloudFront, extraemos el key
        // Si es un key antiguo, lo usamos tal cual
        let key;
        if (postImage.startsWith('http://') || postImage.startsWith('https://')) {
          // Extraer el key de la URL de CloudFront
          key = postImage.replace(`${cloudfrontUrl}/`, '');
        } else {
          key = postImage;
        }

        const deleteParams = {
          Bucket: bucketName,
          Key: key,
        };
        const deleteCommand = new DeleteObjectCommand(
          deleteParams
        );
        await s3Client.send(deleteCommand);
      }

      await Post.findByIdAndDelete(postId);

      return res.status(200).json({
        message: 'Post eliminado correctamente',
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error deleting post' });
    }
  },

  getAllPosts: async (req, res) => {
    try {
      let posts = await Post.find()
        .sort({ createdAt: -1 })
        .populate({
          path: 'user',
          select: 'name lastName role imgUrl',
        })
        .populate({
          path: 'comments',
          select: 'user replies text student',
          populate: [
            {
              path: 'user student',
              select: 'name lastName imgUrl role',
            },
            {
              path: 'replies',
              select:
                'name lastName role imgUrl user text student',
              populate: {
                path: 'user student',
                select:
                  'name lastName imgUrl role',
              },
            },
          ],
        });

      // firmar URL de imagen/video del post
      posts = await Promise.all(
        posts.map(p => attachSignedPostUrl(p))
      );

      return res.status(200).json({
        response: posts,
        message: 'Posts',
        success: true,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error fetching posts' });
    }
  },

  editPostText: async (req, res) => {
    try {
      const { postId, text } = req.body;

      const post = await Post.findById(postId);

      if (!post) {
        return res
          .status(404)
          .json({ message: 'Post not found' });
      }

      post.text = text;
      await post.save();

      return res.status(200).json({
        message: 'Post text updated successfully',
        post,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error updating post text' });
    }
  },

  editReply: async (req, res) => {
    try {
      const { replyId, newText } = req.body;

      const parentComment =
        await Comment.findOne({
          'replies._id': replyId,
        });

      if (!parentComment) {
        return res.status(404).json({
          message: 'Parent comment not found',
        });
      }

      const reply = parentComment.replies.find(
        r => r._id.toString() === replyId
      );

      if (!reply) {
        return res
          .status(404)
          .json({ message: 'Reply not found' });
      }

      reply.text = newText;
      await parentComment.save();

      return res.status(200).json({
        message: 'Reply updated successfully',
        reply,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error updating reply' });
    }
  },

  deleteReply: async (req, res) => {
    try {
      const { parentCommentId, replyId } = req.params;

      const parentComment =
        await Comment.findById(parentCommentId);

      if (!parentComment) {
        return res.status(404).json({
          message: 'Parent comment not found',
        });
      }

      const replyToDeleteIndex =
        parentComment.replies.findIndex(
          reply =>
            reply._id.toString() === replyId
        );

      if (replyToDeleteIndex === -1) {
        return res.status(404).json({
          message:
            'Reply not found in parent comment',
        });
      }

      parentComment.replies.splice(
        replyToDeleteIndex,
        1
      );
      await parentComment.save();

      return res.status(200).json({
        message: 'Reply deleted successfully',
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error deleting reply' });
    }
  },

  getPostsByFilter: async (req, res) => {
    try {
      const filterType = req.query.filterType;
      const filterValue = req.query.filterValue;
      const limit =
        parseInt(req.query.limit) || 0;

      let filter = {};
      if (filterType && filterValue) {
        filter[filterType] = filterValue;
      }

      let posts = await Post.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate({
          path: 'user',
          select: 'name lastName role imgUrl',
        })
        .populate({
          path: 'comments',
          select: 'user replies text student',
          populate: [
            {
              path: 'user student',
              select: 'name lastName imgUrl role',
            },
            {
              path: 'replies',
              select:
                'name lastName role imgUrl user text student',
              populate: {
                path: 'user student',
                select:
                  'name lastName imgUrl role',
              },
            },
          ],
        });

      posts = await Promise.all(
        posts.map(p => attachSignedPostUrl(p))
      );

      return res.status(200).json({
        response: posts,
        message: 'Posts',
        success: true,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error fetching posts' });
    }
  },

  getPostsByInstitucion: async (req, res) => {
    const { institucionId } = req.params;

    try {
      const institution =
        await Institution.findById(institucionId);
      if (!institution) {
        return res.status(404).json({
          message: 'Institution not found',
        });
      }

      const programsIds = institution.programs;

      const programsFound = await Program.find({
        _id: { $in: programsIds },
      });

      let workshops = [];
      programsFound.forEach(program => {
        workshops.push(...program.workshops);
      });

      let postsFound = await Post.find({
        workshop: { $in: workshops },
      })
        .sort({ createdAt: -1 })
        .populate({
          path: 'user',
          select: 'name lastName role imgUrl',
        })
        .populate({
          path: 'comments',
          select: 'user replies text student',
          populate: [
            {
              path: 'user student',
              select:
                'name lastName imgUrl role',
            },
            {
              path: 'replies',
              select:
                'name lastName role imgUrl user text student',
              populate: {
                path: 'user student',
                select:
                  'name lastName imgUrl role',
              },
            },
          ],
        });

      postsFound = await Promise.all(
        postsFound.map(p => attachSignedPostUrl(p))
      );

      return res.status(200).json({
        response: postsFound,
        message: 'Posts',
        success: true,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error fetching posts' });
    }
  },
};

module.exports = postController;
