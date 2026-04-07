const Post = require('../models/Post');
const { validationResult } = require('express-validator');

const CATEGORIES = ['Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Business', 'Entertainment', 'Education', 'Other'];

// GET / - Public home page with all published posts
exports.getHome = async (req, res) => {
  try {
    const { search, category, tag, sort = 'newest' } = req.query;
    const filter = { status: 'published' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (tag) filter.tags = tag;

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { views: -1 },
      liked: { 'likes': -1 },
    };
    const sortOrder = sortMap[sort] || sortMap.newest;

    const posts = await Post.find(filter)
      .populate('author', 'name')
      .sort(sortOrder)
      .lean();

    // Get all unique tags for filtering
    const allTags = await Post.distinct('tags', { status: 'published' });

    res.render('pages/index', {
      title: 'Home',
      posts,
      categories: CATEGORIES,
      allTags,
      search: search || '',
      selectedCategory: category || '',
      selectedTag: tag || '',
      selectedSort: sort,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: err.message });
  }
};

// GET /posts/:id - View single post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name bio avatar')
      .populate('comments.user', 'name');

    if (!post || post.status !== 'published') {
      return res.status(404).render('error', { title: '404', message: 'Post not found.' });
    }

    await post.incrementViews();

    // Related posts by same category
    const related = await Post.find({
      status: 'published',
      category: post.category,
      _id: { $ne: post._id },
    })
      .populate('author', 'name')
      .limit(3)
      .lean();

    const isLiked = req.session.userId
      ? post.likes.some((id) => id.toString() === req.session.userId.toString())
      : false;

    res.render('pages/show', {
      title: post.title,
      post,
      related,
      isLiked,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: err.message });
  }
};

// GET /posts/new - Create post form
exports.getCreatePost = (req, res) => {
  res.render('pages/create', { title: 'Create Post', categories: CATEGORIES });
};

// POST /posts - Create post
exports.createPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/posts/new');
  }

  try {
    const { title, content, category, tags, status } = req.body;
    const tagArray = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

    const post = await Post.create({
      title,
      content,
      category: category || 'Other',
      tags: tagArray,
      status: status || 'published',
      author: req.session.userId,
    });

    req.flash('success', 'Post created successfully!');
    res.redirect(`/posts/${post._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', err.message);
    res.redirect('/posts/new');
  }
};

// GET /posts/:id/edit
exports.getEditPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).render('error', { title: '404', message: 'Post not found.' });

    // Only author can edit
    if (post.author.toString() !== req.session.userId.toString()) {
      req.flash('error', 'You are not authorized to edit this post.');
      return res.redirect(`/posts/${post._id}`);
    }

    res.render('pages/edit', { title: 'Edit Post', post, categories: CATEGORIES });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: err.message });
  }
};

// PUT /posts/:id - Update post
exports.updatePost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect(`/posts/${req.params.id}/edit`);
  }

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).render('error', { title: '404', message: 'Post not found.' });

    if (post.author.toString() !== req.session.userId.toString()) {
      req.flash('error', 'You are not authorized to edit this post.');
      return res.redirect(`/posts/${post._id}`);
    }

    const { title, content, category, tags, status } = req.body;
    const tagArray = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

    post.title = title;
    post.content = content;
    post.category = category || 'Other';
    post.tags = tagArray;
    post.status = status || 'published';
    await post.save();

    req.flash('success', 'Post updated successfully!');
    res.redirect(`/posts/${post._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', err.message);
    res.redirect(`/posts/${req.params.id}/edit`);
  }
};

// DELETE /posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).render('error', { title: '404', message: 'Post not found.' });

    if (post.author.toString() !== req.session.userId.toString()) {
      req.flash('error', 'You are not authorized to delete this post.');
      return res.redirect(`/posts/${post._id}`);
    }

    await Post.findByIdAndDelete(req.params.id);
    req.flash('success', 'Post deleted successfully.');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: err.message });
  }
};

// POST /posts/:id/like - Toggle like (AJAX)
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const count = await post.toggleLike(req.session.userId);
    const isLiked = post.likes.some((id) => id.toString() === req.session.userId.toString());
    res.json({ likes: count, isLiked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /posts/:id/comments - Add comment
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).render('error', { title: '404', message: 'Post not found.' });

    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      req.flash('error', 'Comment cannot be empty.');
      return res.redirect(`/posts/${post._id}`);
    }

    post.comments.push({
      user: req.session.userId,
      userName: res.locals.currentUser.name,
      text: text.trim(),
    });
    await post.save();

    req.flash('success', 'Comment added!');
    res.redirect(`/posts/${post._id}#comments`);
  } catch (err) {
    console.error(err);
    req.flash('error', err.message);
    res.redirect(`/posts/${req.params.id}`);
  }
};
