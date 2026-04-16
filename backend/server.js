const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');

dotenv.config();

const connectDB = require('./config/database');
const { setCurrentUser } = require('./middleware/auth');
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 10000; 

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// FIXED SESSION CONFIG
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'blogpage_secure_secret_7722',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 7 * 24 * 60 * 60
    }),
    cookie: { 
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: false, 
      httpOnly: true
    },
  })
);

app.use(flash());

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Static files
app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use(setCurrentUser);
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', postRoutes);

// Error Handlers
app.use((req, res) => {
  res.status(404).render('error', { title: '404 Not Found', message: 'The page you are looking for does not exist.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: '500 Server Error', message: 'Something went wrong on our end.' });
});

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Database Connected & Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Critical Error: Could not start server", error);
    process.exit(1); 
  }
};

start();