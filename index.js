const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { connectDB } = require('./routes/db');
const dataRoutes = require('./routes/getdata');
const contactRoutes = require('./routes/contact');
const imageRoutes = require('./routes/imageroutes');
const { auth, requiresAuth } = require('./routes/auth0');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Auth0 middleware - must be before routes
app.use(auth);

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
