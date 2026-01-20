const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { getDB } = require('./db');
const { GridFSBucket, ObjectId } = require('mongodb');
const axios = require('axios');
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

// GET all blog posts from MongoDB with pagination
router.get('/getData', async (req, res) => {
  try {
    const db = getDB();

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Only count and fetch posts where view is not 'private'
    const query = { $or: [ { view: { $ne: 'private' } }, { view: { $exists: false } } ] };

    // Get total count (excluding private)
    const total = await db.collection('posts').countDocuments(query);

    // Get paginated posts (excluding private)
    const posts = await db.collection('posts')
      .find(query)
      .sort({ publishedDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Transform MongoDB documents to match your frontend format
    const formattedPosts = posts.map(post => ({
      _id: post._id,
      Heading: post.heading,
      Text: post.text,
      image: post.imageId ? `/api/image/${post.imageId}` : null,
      publishedDate: post.publishedDate || post.createdAt,
      createdAt: post.createdAt,
      source: post.source || 'manual',
      sourceUrl: post.sourceUrl || null
    }));

    // Send response with pagination metadata
    res.json({
      posts: formattedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        postsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
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

// GET all private posts from Flask
router.get('/getPrivatePosts', async (req, res) => {
  try {
    console.log('Fetching private posts from Flask...');
    const flaskUrl = 'http://localhost:5001/entry/private/all';
    const flaskResponse = await axios.get(flaskUrl);
    console.log('Private posts fetched:', flaskResponse.data);
    res.json(flaskResponse.data);
  } catch (error) {
    console.error('Error fetching private posts from Flask:', error.message);
    res.status(500).json({ error: 'Error fetching private posts. Flask server may not be running.' });
  }
});

// GET a specific private post by ID
router.get('/getPrivatePost/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const flaskUrl = `http://localhost:5001/entry/private/${postId}`;
    const flaskResponse = await axios.get(flaskUrl);
    res.json(flaskResponse.data);
  } catch (error) {
    console.error('Error fetching private post from Flask:', error);
    res.status(500).json({ error: 'Error fetching private post' });
  }
});

// POST new blog post to MongoDB with image
router.post('/saveData', uploadFields, async (req, res) => {
  console.log('POST /api/saveData Content-Type:', req.headers['content-type']);
  console.log('Fields:', req.body);

  const file = (req.files && req.files.blogImage && req.files.blogImage[0]) ||
         (req.files && req.files.image && req.files.image[0]) || null;

  const { Heading, Text, viewing, postId } = req.body || {};
  if (!Heading || !Text) {
    return res.status(400).json({ error: 'Heading and Text are required.' });
  }

  if (viewing === 'private') {
    // Send data to Flask API
    try {
      const flaskData = {
        Heading,
        Text,
        view: 'private'
      };
      
      let flaskUrl;
      let method;
      
      // If postId exists, update; otherwise create
      if (postId) {
        flaskUrl = `http://localhost:5001/entry/private/${postId}`;
        method = 'put';
      } else {
        flaskUrl = 'http://localhost:5001/entry/private';
        method = 'post';
      }
      
      const flaskResponse = await axios({
        method: method,
        url: flaskUrl,
        data: flaskData
      });
      
      return res.send(flaskResponse.data);
    } catch (error) {
      console.error('Error sending data to Flask:', error);
      return res.status(500).send('Error sending data to Flask.');
    }
  }

  // Handle public as before
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

    // Save post with image reference and dates
    const newPost = {
      heading: Heading,
      text: Text,
      imageId: imageId,
      view : 'public',
      publishedDate: new Date(), // When post goes live
      createdAt: new Date()       // When post was created
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