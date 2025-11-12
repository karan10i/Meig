const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { getDB } = require('./db');
const { GridFSBucket, ObjectId } = require('mongodb');
const router = express.Router();

// Store files in memory for MongoDB upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadFields = upload.fields([
  { name: 'blogImage', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);

// GET all blog posts from MongoDB
router.get('/getData', async (req, res) => {
  try {
    const db = getDB();
    const posts = await db.collection('posts').find({}).sort({ createdAt: -1 }).toArray();
    
    // Transform MongoDB documents to match your frontend format
    const formattedPosts = posts.map(post => ({
      _id: post._id,
      Heading: post.heading,
      Text: post.text,
      image: post.imageId ? `/api/image/${post.imageId}` : null,
      createdAt: post.createdAt
    }));
    
    res.json(formattedPosts);
  } catch (error) {
    console.error('Error fetching posts from MongoDB:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// GET image from MongoDB GridFS
router.get('/image/:id', async (req, res) => {
  try {
    const db = getDB();
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    
    const downloadStream = bucket.openDownloadStream(new ObjectId(req.params.id));
    
    downloadStream.on('error', (error) => {
      console.error('Error streaming image:', error);
      res.status(404).json({ error: 'Image not found' });
    });
    
    downloadStream.on('file', (file) => {
      res.set('Content-Type', file.contentType || 'image/jpeg');
    });
    
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Error fetching image' });
  }
});

// POST new blog post to MongoDB with image
router.post('/saveData', uploadFields, async (req, res) => {
  console.log('POST /api/saveData Content-Type:', req.headers['content-type']);
  console.log('Fields:', req.body);
  
  const file = (req.files && req.files.blogImage && req.files.blogImage[0]) ||
         (req.files && req.files.image && req.files.image[0]) || null;

  const { Heading, Text } = req.body || {};
  if (!Heading || !Text) {
    return res.status(400).json({ error: 'Heading and Text are required.' });
  }

  try {
    const db = getDB();
    let imageId = null;

    // Upload image to GridFS if present
    if (file) {
      const bucket = new GridFSBucket(db, { bucketName: 'images' });
      const uploadStream = bucket.openUploadStream(file.originalname, {
        contentType: file.mimetype,
        metadata: {
          uploadedAt: new Date(),
          originalName: file.originalname
        }
      });

      // Write buffer to GridFS
      uploadStream.end(file.buffer);
      
      // Wait for upload to complete
      await new Promise((resolve, reject) => {
        uploadStream.on('finish', () => {
          imageId = uploadStream.id;
          resolve();
        });
        uploadStream.on('error', reject);
      });

      console.log('✓ Image uploaded to GridFS with ID:', imageId);
    }

    // Save post with image reference
    const newPost = {
      heading: Heading,
      text: Text,
      imageId: imageId,
      createdAt: new Date()
    };

    await db.collection('posts').insertOne(newPost);
    console.log('✓ Post saved to MongoDB');
    res.redirect('/entry');
  } catch (error) {
    console.error('Error saving post to MongoDB:', error);
    res.status(500).send('Error saving data.');
  }
});

module.exports = router;