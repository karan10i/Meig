const express = require('express');
const router = express.Router();
const { getDB } = require('./db');

// POST /api/contact - save contact message to MongoDB
router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    const db = getDB();
    await db.collection('contacts').insertOne({
      name,
      email,
      message,
      createdAt: new Date()
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving contact:', err);
    res.status(500).json({ error: 'Failed to save contact.' });
  }
});

module.exports = router;
