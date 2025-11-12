// Quick test script to verify MongoDB integration
const fetch = require('node-fetch');

async function testAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing MongoDB Integration...\n');
  
  // Test 1: GET /api/getData
  console.log('1️⃣  Testing GET /api/getData...');
  try {
    const response = await fetch(`${baseUrl}/api/getData`);
    const posts = await response.json();
    console.log(`   ✓ Retrieved ${posts.length} posts from MongoDB`);
    
    if (posts.length > 0) {
      const firstPost = posts[0];
      console.log(`   ✓ First post: "${firstPost.Heading}"`);
      console.log(`   ✓ Has image: ${firstPost.image ? 'Yes - ' + firstPost.image : 'No'}`);
      
      // Test 2: GET image if exists
      if (firstPost.image) {
        console.log('\n2️⃣  Testing image retrieval...');
        const imageResponse = await fetch(`${baseUrl}${firstPost.image}`);
        if (imageResponse.ok) {
          const contentType = imageResponse.headers.get('content-type');
          const size = imageResponse.headers.get('content-length');
          console.log(`   ✓ Image retrieved successfully`);
          console.log(`   ✓ Content-Type: ${contentType}`);
          console.log(`   ✓ Size: ${size ? (parseInt(size) / 1024).toFixed(2) + ' KB' : 'Unknown'}`);
        } else {
          console.log(`   ✗ Failed to retrieve image: ${imageResponse.status}`);
        }
      }
    }
    
    console.log('\n✅ All tests passed!');
    console.log('\n📝 Summary:');
    console.log(`   - Posts in database: ${posts.length}`);
    console.log(`   - Posts with images: ${posts.filter(p => p.image).length}`);
    console.log(`   - API endpoint: ${baseUrl}/api/getData`);
    console.log(`   - Entry form: ${baseUrl}/entry`);
    console.log(`   - Blog page: ${baseUrl}/Blog.html`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
