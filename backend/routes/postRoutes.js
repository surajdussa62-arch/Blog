const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const postController = require('../controllers/postController');
const { protect } = require('../middleware/auth');

const postValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }).withMessage('Title too long.'),
  body('content').trim().notEmpty().withMessage('Content is required.'),
];

// Public routes
router.get('/', postController.getHome);

// Protected routes — MUST come before /posts/:id so "new" isn't treated as an ObjectId
router.get('/posts/new', protect, postController.getCreatePost);
router.post('/posts', protect, postValidation, postController.createPost);
router.get('/posts/:id', postController.getPost);
router.get('/posts/:id/edit', protect, postController.getEditPost);
router.put('/posts/:id', protect, postValidation, postController.updatePost);
router.delete('/posts/:id', protect, postController.deletePost);

// Like & comment (protected)
router.post('/posts/:id/like', protect, postController.toggleLike);
router.post('/posts/:id/comments', protect, postController.addComment);

module.exports = router;
