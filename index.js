if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// DEBUG: Log environment variables
console.log('=== ENV DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('BASE_URL:', process.env.BASE_URL);
console.log('AUTH0_SECRET exists?', !!process.env.AUTH0_SECRET);
console.log('AUTH0_SECRET length:', process.env.AUTH0_SECRET?.length || 0);
console.log('AUTH0_SECRET first 10 chars:', process.env.AUTH0_SECRET?.substring(0, 10));
console.log('==================');

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { connectDB } = require('./routes/db');
const { requiresAuth } = require('express-openid-connect');

// Import route modules
const dataRoutes = require('./routes/getdata');
const contactRoutes = require('./routes/contact');
const imageRoutes = require('./routes/imageroutes');

const app = express();
app.set('trust proxy', 1);

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

// Protect the entry page
app.get('/entry', requiresAuth(), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'entry.html'));
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

// Start server after DB connection
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
