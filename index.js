if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}


const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { connectDB } = require('./routes/db');
const { requiresAuth } = require('express-openid-connect');

// Import route modules
const dataRoutes = require('./routes/getdata');
const contactRoutes = require('./routes/contact');
const imageRoutes = require('./routes/imageroutes');
const metaRoutes = require('./routes/meta');

const app = express();
app.set('trust proxy', 1);

// Set up EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Auth0 middleware - must be before routes
const auth = require('./routes/auth0');
app.use(auth);

const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/photos', express.static(path.join(__dirname, 'photos')));

// API routes
app.use('/api', dataRoutes);
app.use('/api', contactRoutes);
app.use('/api', imageRoutes);
app.use('/api', metaRoutes);

// Protect the entry page
app.get('/entry', requiresAuth(), (req, res) => {
  res.render('entry', { tinymceApiKey: process.env.TINYMCE_API_KEY });
});

// Protected profile route - shows user information
app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user, null, 2));
});

// Custom logout route that redirects to blog page
app.get('/logout', (req, res) => {
  res.oidc.logout({
    returnTo: process.env.BASE_URL || 'http://localhost:3000'
  });
});

// Other routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Blog.html'));
});

app.get('/Blog.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Blog.html'));
});

app.get('/contact.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Ensure DB is connected on every request (safe to call repeatedly — cached internally)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection failed:', err);
    res.status(500).send('Database connection failed');
  }
});

// Local dev: start the server normally
if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(port, () => {
        console.log(`✓ Server running on http://localhost:${port}`);
      });
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB:', err);
      process.exit(1);
    });
}

module.exports = app;
