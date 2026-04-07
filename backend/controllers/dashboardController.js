const Post = require('../models/Post');
const User = require('../models/User');

// GET /dashboard
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.session.userId;

    const [myPosts, totalViews, totalLikes, draftCount, publishedCount] = await Promise.all([
      Post.find({ author: userId }).sort({ createdAt: -1 }).lean(),
      Post.aggregate([
        { $match: { author: require('mongoose').Types.ObjectId.createFromHexString(userId.toString()) } },
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]),
      Post.aggregate([
        { $match: { author: require('mongoose').Types.ObjectId.createFromHexString(userId.toString()) } },
        { $group: { _id: null, total: { $sum: { $size: '$likes' } } } },
      ]),
      Post.countDocuments({ author: userId, status: 'draft' }),
      Post.countDocuments({ author: userId, status: 'published' }),
    ]);

    const stats = {
      totalPosts: myPosts.length,
      publishedPosts: publishedCount,
      draftPosts: draftCount,
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
      totalComments: myPosts.reduce((acc, p) => acc + (p.comments?.length || 0), 0),
    };

    res.render('pages/dashboard', {
      title: 'My Dashboard',
      posts: myPosts,
      stats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: err.message });
  }
};

// GET /settings
exports.getSettings = (req, res) => {
  res.render('pages/settings', { title: 'Account Settings' });
};

// PUT /settings
exports.updateSettings = async (req, res) => {
  try {
    const { name, bio, website } = req.body;
    await User.findByIdAndUpdate(req.session.userId, { name, bio, website });
    req.flash('success', 'Profile updated successfully!');
    res.redirect('/settings');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/settings');
  }
};

// PUT /settings/password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      req.flash('error', 'New passwords do not match.');
      return res.redirect('/settings');
    }
    if (newPassword.length < 6) {
      req.flash('error', 'New password must be at least 6 characters.');
      return res.redirect('/settings');
    }

    const user = await User.findById(req.session.userId).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      req.flash('error', 'Current password is incorrect.');
      return res.redirect('/settings');
    }

    user.password = newPassword;
    await user.save();

    req.flash('success', 'Password changed successfully!');
    res.redirect('/settings');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/settings');
  }
};
