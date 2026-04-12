/**
 * meta.js — Books & Spotify management routes
 * Collections:
 *   books   : { _id, title, url, category: 'reading'|'mustread', linkedPostIds: [] }
 *   spotify : { _id: 'playlist', songs: [{title, artist, url}] }
 */

const express = require('express');
const { getDB } = require('./db');
const { ObjectId } = require('mongodb');
const { requiresAuth } = require('express-openid-connect');
const router = express.Router();

/* ── BOOKS ─────────────────────────────────────────────────── */

// GET all books (public)
router.get('/books', async (req, res) => {
  try {
    const db = getDB();
    const books = await db.collection('books').find().sort({ category: 1, _id: 1 }).toArray();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load books' });
  }
});

// POST add a book (protected)
router.post('/books', requiresAuth(), async (req, res) => {
  const { title, url, category } = req.body;
  if (!title || !category) return res.status(400).json({ error: 'title and category required' });
  try {
    const db = getDB();
    const result = await db.collection('books').insertOne({
      title,
      url: url || '',
      category,         // 'reading' | 'mustread'
      linkedPostIds: [],
      createdAt: new Date()
    });
    res.json({ _id: result.insertedId, title, url, category, linkedPostIds: [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// PUT update a book (protected)
router.put('/books/:id', requiresAuth(), async (req, res) => {
  const { title, url, category, linkedPostIds } = req.body;
  try {
    const db = getDB();
    const update = {};
    if (title !== undefined) update.title = title;
    if (url !== undefined) update.url = url;
    if (category !== undefined) update.category = category;
    if (linkedPostIds !== undefined) update.linkedPostIds = linkedPostIds;
    await db.collection('books').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: update }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// DELETE a book (protected)
router.delete('/books/:id', requiresAuth(), async (req, res) => {
  try {
    const db = getDB();
    await db.collection('books').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

/* ── SPOTIFY ───────────────────────────────────────────────── */

// GET playlist (public)
router.get('/spotify', async (req, res) => {
  try {
    const db = getDB();
    const doc = await db.collection('spotify').findOne({ _id: 'playlist' });
    res.json(doc ? doc.songs : []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load playlist' });
  }
});

// PUT replace full playlist (protected)
router.put('/spotify', requiresAuth(), async (req, res) => {
  const { songs } = req.body;
  if (!Array.isArray(songs)) return res.status(400).json({ error: 'songs array required' });
  try {
    const db = getDB();
    await db.collection('spotify').updateOne(
      { _id: 'playlist' },
      { $set: { songs, updatedAt: new Date() } },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save playlist' });
  }
});

module.exports = router;
