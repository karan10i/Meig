const express = require('express');
const path = require('path');
const bodyparser = require('body-parser');
const { connectDB } = require('./routes/db');
const app = express();
const imageroutes = require('./routes/imageroutes');
const dataRoutes = require('./routes/getdata');

// Middleware setup
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use('/photos', express.static(path.join(__dirname, 'photos')));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', imageroutes);
app.use('/api', dataRoutes);

app.get('/entry', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'entry.html')); 
});

// Connect to MongoDB before starting the server
connectDB()
  .then(() => {
    app.listen(3000, () => {
      console.log("✓ Server running on http://localhost:3000");
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
