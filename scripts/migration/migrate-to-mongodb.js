const fs = require('fs');
const path = require('path');
const { connectDB, closeDB } = require('./routes/db');
const { GridFSBucket } = require('mongodb');

async function migrate() {
  try {
    console.log('Starting migration from blg.json to MongoDB...');
    
    // Read existing JSON file
    const filePath = path.join(__dirname, 'blg.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const posts = JSON.parse(data);
    
    console.log(`Found ${posts.length} posts in blg.json`);
    
    // Connect to MongoDB
    const db = await connectDB();
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    
    // Clear existing posts and images (optional - remove if you want to keep old data)
    await db.collection('posts').deleteMany({});
    console.log('Cleared existing posts in MongoDB');
    
    // Drop existing GridFS files
    try {
      await db.collection('images.files').deleteMany({});
      await db.collection('images.chunks').deleteMany({});
      console.log('Cleared existing images in GridFS');
    } catch (err) {
      console.log('No existing images to clear');
    }
    
    // Transform and insert posts with images
    for (const post of posts) {
      let imageId = null;
      
      // Upload image to GridFS if it exists
      if (post.image && post.image !== '') {
        const imagePath = path.join(__dirname, 'photos', path.basename(post.image));
        
        if (fs.existsSync(imagePath)) {
          try {
            const imageBuffer = fs.readFileSync(imagePath);
            const uploadStream = bucket.openUploadStream(path.basename(post.image), {
              contentType: getContentType(imagePath),
              metadata: {
                uploadedAt: new Date(),
                originalName: path.basename(post.image),
                migratedFrom: 'blg.json'
              }
            });

            uploadStream.end(imageBuffer);
            
            await new Promise((resolve, reject) => {
              uploadStream.on('finish', () => {
                imageId = uploadStream.id;
                resolve();
              });
              uploadStream.on('error', reject);
            });
            
            console.log(`  ✓ Uploaded image: ${path.basename(post.image)}`);
          } catch (err) {
            console.error(`  ✗ Failed to upload image ${post.image}:`, err.message);
          }
        } else {
          console.log(`  ⚠ Image file not found: ${imagePath}`);
        }
      }
      
      // Insert post with image reference
      const transformedPost = {
        heading: post.Heading,
        text: post.Text,
        imageId: imageId,
        createdAt: new Date()
      };
      
      await db.collection('posts').insertOne(transformedPost);
    }
    
    const count = await db.collection('posts').countDocuments();
    console.log(`✓ Successfully migrated ${count} posts to MongoDB`);
    
    await closeDB();
    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };
  return types[ext] || 'application/octet-stream';
}

migrate();
