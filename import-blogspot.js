const axios = require('axios');
const cheerio = require('cheerio');
const { connectDB, closeDB } = require('./routes/db');

const BLOGSPOT_URL = 'https://philiphia.blogspot.com';
const BLOGGER_API_KEY = process.env.BLOGGER_API_KEY; // Optional: Get from Google Console
const BLOG_ID = '3499750733997706801'; // Extracted from your blog

async function scrapeBlogspotFeed() {
  try {
    console.log('🔍 Scraping Blogspot using Atom feed...\n');
    
    // Use Blogspot's Atom feed (more reliable than scraping HTML)
    const feedUrl = `${BLOGSPOT_URL}/feeds/posts/default?max-results=500&alt=json`;
    const response = await axios.get(feedUrl);
    
    const feed = response.data.feed;
    const posts = [];
    
    if (feed.entry) {
      for (const entry of feed.entry) {
        const post = {
          title: entry.title.$t,
          content: entry.content ? entry.content.$t : (entry.summary ? entry.summary.$t : ''),
          publishedDate: new Date(entry.published.$t),
          updatedDate: new Date(entry.updated.$t),
          url: entry.link.find(l => l.rel === 'alternate')?.href || '',
          author: entry.author?.[0]?.name?.$t || 'Unknown'
        };
        
        // Clean HTML from content
        post.content = cleanHTML(post.content);
        
        posts.push(post);
      }
    }
    
    console.log(`✓ Found ${posts.length} posts from Blogspot feed\n`);
    return posts;
    
  } catch (error) {
    console.error('❌ Error scraping Blogspot feed:', error.message);
    console.log('\n⚠️  Falling back to HTML scraping...\n');
    return await scrapeBlogspotHTML();
  }
}

async function scrapeBlogspotHTML() {
  try {
    const posts = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore && page <= 10) { // Limit to 10 pages
      console.log(`  Scraping page ${page}...`);
      
      const url = page === 1 ? BLOGSPOT_URL : `${BLOGSPOT_URL}?m=${page}`;
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      
      const pagePosts = [];
      
      $('.post').each((i, elem) => {
        const $post = $(elem);
        
        const title = $post.find('.post-title').text().trim() || 
                      $post.find('h3').first().text().trim();
        const content = $post.find('.post-body').text().trim() ||
                       $post.find('.entry-content').text().trim();
        const dateStr = $post.find('.published').attr('title') ||
                       $post.find('.timestamp-link').text().trim();
        
        if (title && content) {
          pagePosts.push({
            title,
            content,
            publishedDate: parseBlogDate(dateStr),
            updatedDate: parseBlogDate(dateStr),
            url: $post.find('.post-title a').attr('href') || '',
            author: 'Karan'
          });
        }
      });
      
      if (pagePosts.length === 0) {
        hasMore = false;
      } else {
        posts.push(...pagePosts);
        page++;
      }
    }
    
    console.log(`✓ Scraped ${posts.length} posts from HTML\n`);
    return posts;
    
  } catch (error) {
    console.error('❌ HTML scraping failed:', error.message);
    return [];
  }
}

function cleanHTML(html) {
  const $ = cheerio.load(html);
  return $.text().trim();
}

function parseBlogDate(dateStr) {
  if (!dateStr) return new Date();
  
  // Try parsing various date formats
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? new Date() : date;
}

async function importToDB(posts) {
  try {
    console.log('📦 Importing posts to MongoDB...\n');
    
    const db = await connectDB();
    let imported = 0;
    let skipped = 0;
    
    for (const post of posts) {
      // Check if post already exists (by title)
      const existing = await db.collection('posts').findOne({ 
        heading: post.title 
      });
      
      if (existing) {
        console.log(`  ⊘ Skipped (duplicate): "${post.title.substring(0, 50)}..."`);
        skipped++;
        continue;
      }
      
      const newPost = {
        heading: post.title,
        text: post.content,
        imageId: null, // Blogspot images not imported yet
        publishedDate: post.publishedDate,
        createdAt: post.publishedDate, // Use published date as created date
        source: 'blogspot',
        sourceUrl: post.url,
        author: post.author
      };
      
      await db.collection('posts').insertOne(newPost);
      console.log(`  ✓ Imported: "${post.title.substring(0, 50)}..."`);
      imported++;
    }
    
    console.log(`\n✅ Import complete!`);
    console.log(`   Imported: ${imported} posts`);
    console.log(`   Skipped: ${skipped} duplicates`);
    
    await closeDB();
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting Blogspot import...\n');
    console.log(`Blog URL: ${BLOGSPOT_URL}\n`);
    
    // Scrape posts
    const posts = await scrapeBlogspotFeed();
    
    if (posts.length === 0) {
      console.log('❌ No posts found. Exiting.');
      process.exit(1);
    }
    
    // Show preview
    console.log('📝 Preview of first post:');
    console.log(`   Title: ${posts[0].title}`);
    console.log(`   Date: ${posts[0].publishedDate.toLocaleDateString()}`);
    console.log(`   Content: ${posts[0].content.substring(0, 100)}...`);
    console.log('');
    
    // Import to MongoDB
    await importToDB(posts);
    
    console.log('\n✨ All done! Check your blog at /Blog.html');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

main();
