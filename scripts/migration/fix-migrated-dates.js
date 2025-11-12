const { connectDB, closeDB } = require('./routes/db');

async function fixMigratedPostDates() {
  try {
    console.log('🔄 Setting old dates for migrated posts...\n');
    
    const db = await connectDB();
    
    // These posts should be older - set them to early 2024
    const oldPosts = [
      "Can be deleted right",
      "AuthOver in my Sever side",
      "LeetCode-1 7th Oct",
      "TO = Turn on 4:59am",
      "Base",
      "Kon kho 9:55 pm",
      "And my god",
      "vussh ha 14:13",
      "ZUp, zip 19:17",
      "Kels",
      "nom 10th 2:35pm"
    ];
    
    // Set these to January 2024 (older than new posts, newer than Blogspot posts)
    for (const headingStart of oldPosts) {
      const result = await db.collection('posts').updateOne(
        { heading: { $regex: `^${headingStart}` } },
        { 
          $set: { 
            publishedDate: new Date('2024-01-15T00:00:00Z')
          } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✓ Updated: "${headingStart}..."`);
      }
    }
    
    console.log('\n✅ Done! Now your latest posts will show first.');
    console.log('\nCurrent order will be:');
    console.log('1. "chumma, 12/11 20:22" (Nov 12, 2025) ← NEWEST');
    console.log('2. "TEST" (Nov 12, 2025)');
    console.log('3. [Old migrated posts] (Jan 15, 2024)');
    console.log('4. [Blogspot posts] (2022-2023) ← OLDEST');
    
    await closeDB();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixMigratedPostDates();
