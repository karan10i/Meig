# Personal Blog Platform

A modern, full-stack personal blogging platform built with Node.js, Express, and MongoDB. Features include blog post creation with image uploads, pagination, GridFS storage, and Blogspot import capabilities.

## 🌟 Features

- **Create & Manage Blog Posts**: Write and publish blog posts with rich text and images
- **MongoDB Atlas Storage**: Cloud-based persistent storage for all data
- **GridFS Image Storage**: Binary image files stored in MongoDB (no filesystem dependency)
- **Pagination**: Browse posts efficiently with 10 posts per page
- **Blogspot Import**: Migrate existing posts from Blogspot with original dates
- **Chronological Sorting**: Newest posts displayed first automatically
- **Responsive Design**: Clean, modern UI optimized for all devices
- **Dynamic Profile Images**: Random profile image rotation on page navigation

## 📁 Project Structure

```
Blog/
├── index.js                           # Express server entry point
├── package.json                       # Dependencies and scripts
├── .env                              # Environment variables (gitignored)
├── .gitignore                        # Git ignore rules
├── LICENSE                           # ISC License
├── README.md                         # This file
├── MONGODB_SCHEMA.md                 # Database schema documentation
├── BLOGSPOT_MIGRATION.md             # Blogspot import guide
│
├── routes/                           # Backend API routes
│   ├── db.js                        # MongoDB connection module
│   ├── getdata.js                   # Blog CRUD operations
│   └── imageroutes.js               # Random image endpoint
│
├── views/                            # HTML templates
│   └── entry.html                   # Blog post creation form
│
├── public/                           # Frontend static files
│   ├── Blog.html                    # Main blog display page
│   ├── cons.html                    # Console/admin page
│   ├── contact.html                 # Contact page
│   ├── style.css                    # Main stylesheet
│   ├── server-side.css              # Entry form styles
│   └── scripts/
│       ├── blog.js                  # Blog display & pagination
│       └── cons.js                  # Console functionality
│
├── photos/                           # Profile images (gitignored)
│
└── scripts/                          # Utility scripts
    ├── migration/
    │   ├── migrate-to-mongodb.js    # JSON to MongoDB migration
    │   ├── import-blogspot.js       # Blogspot post importer
    │   └── fix-migrated-dates.js    # Date correction script
    ├── check-dates.js               # Date verification utility
    ├── analyze-manual-posts.js      # Post analysis tool
    ├── fix-dates.js                 # Date updater
    └── test-mongodb.js              # DB connection test
```

## 🚀 Quick Start

### Prerequisites

- Node.js v14+ 
- MongoDB Atlas account (free tier works)
- npm package manager

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/karan10i/Meig.git
   cd Blog
   npm install
   ```

2. **Configure environment**
   
   Create `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/blogDB?retryWrites=true&w=majority
   ```

3. **Start the server**
   ```bash
   node index.js
   ```
   
   Server runs at `http://localhost:3000`

## 📖 Usage

### Creating Posts

1. Navigate to `http://localhost:3000/entry`
2. Fill in the form:
   - **Heading**: Post title
   - **Text**: Post content (supports line breaks)
   - **Blog Image**: Upload image (optional)
3. Click "Post" to publish

### Viewing Posts

- Visit `http://localhost:3000/Blog.html`
- Browse with Previous/Next pagination controls
- Latest posts appear first

### Importing from Blogspot

```bash
node scripts/migration/import-blogspot.js
```

Features:
- Fetches from Blogspot Atom feed API
- Preserves original publication dates
- Avoids duplicates (checks by title)
- Marks posts with `source: 'blogspot'`

## 🗄️ Database Schema

### Posts Collection

```javascript
{
  _id: ObjectId,
  heading: String,           // Post title
  text: String,             // Post content
  imageId: ObjectId,        // GridFS image reference
  publishedDate: Date,      // Publication date (for sorting)
  createdAt: Date,          // Creation timestamp
  source: String,           // 'manual' | 'blogspot'
  sourceUrl: String         // Original URL (if imported)
}
```

### GridFS Collections

- `images.files`: Image metadata (filename, contentType, size)
- `images.chunks`: Binary data in 255KB chunks

See [MONGODB_SCHEMA.md](MONGODB_SCHEMA.md) for detailed documentation.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/getData?page=1&limit=10` | Paginated posts |
| POST | `/api/saveData` | Create post (multipart/form-data) |
| GET | `/api/image/:id` | Stream image from GridFS |
| GET | `/api/getRandomImage` | Random profile image URL |
| GET | `/entry` | Blog entry form |

## 🛠️ Utility Scripts

### Migration
```bash
# Migrate from old JSON file to MongoDB
node scripts/migration/migrate-to-mongodb.js

# Import Blogspot posts
node scripts/migration/import-blogspot.js

# Fix post dates
node scripts/migration/fix-migrated-dates.js
```

### Maintenance
```bash
# Check post dates
node scripts/check-dates.js

# Test MongoDB connection
node scripts/test-mongodb.js
```

## 📦 Tech Stack

**Backend:**
- Express 5.1.0 - Web framework
- MongoDB 6.20.0 - Database driver
- Multer 2.0.2 - File upload handling
- Dotenv 17.2.3 - Environment config

**Scraping:**
- Axios 1.13.2 - HTTP client
- Cheerio 1.1.2 - HTML parsing

**Frontend:**
- Vanilla JavaScript (ES6+)
- CSS3 with Flexbox/Grid
- Fetch API for AJAX

## 🚢 Deployment (Render)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy blog platform"
   git push origin main
   ```

2. **Configure Render**
   - Create new Web Service
   - Connect GitHub repository `karan10i/Meig`
   - Build Command: `npm install`
   - Start Command: `node index.js`

3. **Set Environment Variables**
   - Add `MONGODB_URI` in Render dashboard
   - Ensure MongoDB Atlas allows Render IPs (0.0.0.0/0 for simplicity)

4. **Deploy**
   - Render auto-deploys on git push
   - Check logs for "✓ Connected successfully to MongoDB"

## 🔒 Security Notes

- `.env` file is gitignored (never commit credentials)
- MongoDB Atlas: Use strong passwords with URL encoding for special chars
- GridFS: Images stored in database (no public file access)
- CORS enabled for local development

## 📝 License

ISC License - See [LICENSE](LICENSE) file

## 🤝 Contributing

Personal project, but feedback welcome! Open an issue for suggestions.

## 📧 Support

Questions? Visit `/contact.html` or open a GitHub issue.

---

**Built with ❤️ by [Karan Gupta](https://github.com/karan10i)**  
*Powered by Node.js, Express, and MongoDB Atlas*
