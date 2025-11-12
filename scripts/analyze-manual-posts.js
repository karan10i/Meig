const { connectDB, closeDB } = require('./routes/db');

async function fixMigratedDates() {
  try {
    console.log('🔄 Fixing dates for manually migrated posts...\n');
    
    const db = await connectDB();
    
    // Get posts that were migrated (have source: manual and all have same date)
    const manualPosts = await db.collection('posts')
      .find({ 
        $or: [
          { source: 'manual' },
          { source: { $exists: false } }
        ]
      })
      .toArray();
    
    console.log(`Found ${manualPosts.length} manual posts\n`);
    
    // These are likely from your original blg.json - we should set them to older dates
    // or extract dates from their headings if they contain date info
    
    for (const post of manualPosts) {
      console.log(`"${post.heading.substring(0, 60)}..."`);
      
      // Try to extract date from heading
      const heading = post.heading;
      let extractedDate = null;
      
      // Check for patterns like "7th Oct", "10th 2:35pm", etc.
      const datePatterns = [
        /(\d{1,2})th\s+(\w+)/i,  // "7th Oct"
        /(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})/i,  // "12/11 20:22"
      ];
      
      // For now, just show what we have
      console.log(`  Current date: ${new Date(post.publishedDate).toLocaleString()}`);
      console.log('');
    }
    
    console.log('\n⚠️  These posts need proper dates assigned.');
    console.log('Would you like to:');
    console.log('1. Set them all to a specific past date (e.g., Jan 1, 2023)?');
    console.log('2. Keep them as today\'s date?');
    console.log('3. Extract dates from their headings if possible?');
    
    await closeDB();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixMigratedDates();
