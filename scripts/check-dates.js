const { connectDB, closeDB } = require('./routes/db');

async function checkDates() {
  try {
    const db = await connectDB();
    
    const posts = await db.collection('posts')
      .find({})
      .sort({ publishedDate: -1 })
      .toArray();
    
    console.log(`\n📊 All ${posts.length} posts sorted by publishedDate (newest first):\n`);
    
    posts.forEach((post, i) => {
      const pubDate = post.publishedDate ? new Date(post.publishedDate) : null;
      const createDate = post.createdAt ? new Date(post.createdAt) : null;
      
      console.log(`${i + 1}. "${post.heading.substring(0, 50)}..."`);
      console.log(`   Published: ${pubDate ? pubDate.toLocaleString() : 'N/A'}`);
      console.log(`   Created:   ${createDate ? createDate.toLocaleString() : 'N/A'}`);
      console.log(`   Source:    ${post.source || 'manual'}\n`);
    });
    
    await closeDB();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDates();
