const { connectDB, closeDB } = require('./routes/db');

async function updatePublishedDates() {
  try {
    console.log('🔄 Updating publishedDate for existing posts...\n');
    
    const db = await connectDB();
    
    // Find posts without publishedDate
    const postsWithoutDate = await db.collection('posts').find({ 
      publishedDate: { $exists: false } 
    }).toArray();
    
    console.log(`Found ${postsWithoutDate.length} posts without publishedDate\n`);
    
    if (postsWithoutDate.length === 0) {
      console.log('✓ All posts already have publishedDate!');
      await closeDB();
      return;
    }
    
    // Update each post to use createdAt as publishedDate
    for (const post of postsWithoutDate) {
      await db.collection('posts').updateOne(
        { _id: post._id },
        { 
          $set: { 
            publishedDate: post.createdAt || new Date() 
          } 
        }
      );
      console.log(`  ✓ Updated: "${post.heading.substring(0, 50)}..."`);
    }
    
    console.log(`\n✅ Updated ${postsWithoutDate.length} posts`);
    console.log('\nNow re-sorting all posts by publishedDate...');
    
    // Verify the update
    const allPosts = await db.collection('posts')
      .find({})
      .sort({ publishedDate: -1 })
      .limit(5)
      .toArray();
    
    console.log('\n📊 Top 5 latest posts:');
    allPosts.forEach((post, i) => {
      const date = new Date(post.publishedDate).toLocaleDateString();
      console.log(`  ${i + 1}. ${post.heading.substring(0, 40)}... (${date})`);
    });
    
    await closeDB();
    console.log('\n✨ Done! Restart your server to see the changes.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updatePublishedDates();
