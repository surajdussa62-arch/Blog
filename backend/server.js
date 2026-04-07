const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');

dotenv.config();

const connectDB = require('./config/database');
connectDB();

const { setCurrentUser } = require('./middleware/auth');
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Session & flash
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days
  })
);
app.use(flash());

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Static files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Set currentUser & flash messages for all views
app.use(setCurrentUser);

// Routes
app.use('/auth', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', postRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { title: '404 Not Found', message: 'The page you are looking for does not exist.' });
});

// 500 handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: '500 Server Error', message: 'Something went wrong on our end.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
