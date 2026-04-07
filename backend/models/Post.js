const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please add content'],
    },
    excerpt: {
      type: String,
      maxlength: 500,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Business', 'Entertainment', 'Education', 'Other'],
      default: 'Other',
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [commentSchema],
    coverImage: {
      type: String,
      default: '',
    },
    readTime: {
      type: Number, // in minutes
      default: 1,
    },
  },
  { timestamps: true }
);

// Auto-generate excerpt and readTime before saving
postSchema.pre('save', function (next) {
  if (this.content) {
    this.excerpt = this.content.substring(0, 200).replace(/<[^>]*>/g, '');
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }
  next();
});

// Increment views
postSchema.methods.incrementViews = async function () {
  this.views += 1;
  await this.save();
};

// Toggle like
postSchema.methods.toggleLike = async function (userId) {
  const idx = this.likes.indexOf(userId);
  if (idx === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(idx, 1);
  }
  await this.save();
  return this.likes.length;
};

module.exports = mongoose.model('Post', postSchema);
