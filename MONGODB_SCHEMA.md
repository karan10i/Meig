# MongoDB Schema Documentation

## Database Structure

### Database Name
`blogDB`

---

## Collections

### 1. `posts` Collection

Stores all blog post metadata and references to images.

**Schema:**
```javascript
{
  _id: ObjectId,              // Auto-generated MongoDB ID
  heading: String,            // Blog post title
  text: String,               // Blog post content/body
  imageId: ObjectId | null,   // Reference to image in GridFS (null if no image)
  createdAt: Date             // Timestamp when post was created
}
```

**Example Document:**
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "heading": "My First Blog Post",
  "text": "This is the content of my blog post...",
  "imageId": ObjectId("507f1f77bcf86cd799439012"),
  "createdAt": ISODate("2025-11-12T10:30:00Z")
}
```

**Indexes:**
- `createdAt: -1` (descending) - for sorting posts by newest first

---

### 2. GridFS Collections (for Image Storage)

MongoDB GridFS automatically creates two collections for file storage:

#### `images.files`
Stores file metadata.

**Schema:**
```javascript
{
  _id: ObjectId,              // File ID (referenced by posts.imageId)
  length: Number,             // File size in bytes
  chunkSize: Number,          // Size of each chunk (usually 255KB)
  uploadDate: Date,           // When file was uploaded
  filename: String,           // Original filename
  contentType: String,        // MIME type (e.g., "image/jpeg")
  metadata: {                 // Custom metadata
    uploadedAt: Date,
    originalName: String,
    migratedFrom: String      // Optional: tracking migration source
  }
}
```

#### `images.chunks`
Stores the actual file data in chunks.

**Schema:**
```javascript
{
  _id: ObjectId,              // Chunk ID
  files_id: ObjectId,         // Reference to images.files._id
  n: Number,                  // Chunk sequence number (0, 1, 2, ...)
  data: Binary                // Actual binary data of the chunk
}
```

---

## API Endpoints

### GET `/api/getData`
**Description:** Fetch all blog posts (sorted by newest first)

**Response:**
```javascript
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "Heading": "My Blog Post",
    "Text": "Content here...",
    "image": "/api/image/507f1f77bcf86cd799439012",  // URL to image
    "createdAt": "2025-11-12T10:30:00.000Z"
  }
]
```

### GET `/api/image/:id`
**Description:** Serve image file from GridFS

**Parameters:**
- `id`: ObjectId of the image

**Response:** Binary image data with appropriate Content-Type header

### POST `/api/saveData`
**Description:** Create new blog post with optional image

**Request:** `multipart/form-data`
- `Heading`: string (required)
- `Text`: string (required)
- `blogImage` or `image`: file (optional)

**Process:**
1. Upload image to GridFS (if provided)
2. Get imageId from GridFS
3. Save post document with imageId reference
4. Redirect to `/entry`

---

## Data Flow

### Creating a New Post

```
User fills form (/entry)
    ↓
POST /api/saveData (multipart/form-data)
    ↓
1. Extract text fields (Heading, Text)
2. Extract image file (if any)
    ↓
3. Upload image to GridFS
   - Creates chunks in images.chunks
   - Creates metadata in images.files
   - Returns imageId
    ↓
4. Insert post document in posts collection
   - References imageId
    ↓
5. Redirect to /entry
```

### Displaying Posts

```
User visits Blog.html
    ↓
GET /api/getData
    ↓
1. Query posts collection (sorted by createdAt DESC)
2. For each post with imageId:
   - Generate image URL: /api/image/{imageId}
3. Return JSON array
    ↓
Frontend receives posts
    ↓
For each post with image URL:
    ↓
Browser requests GET /api/image/{imageId}
    ↓
1. Query GridFS for image
2. Stream binary data to browser
3. Set Content-Type header
    ↓
Image displays in browser
```

---

## Advantages of This Schema

✅ **All data in MongoDB** - No file system dependencies  
✅ **Persistent on cloud** - Works perfectly on Render/Heroku  
✅ **Scalable** - GridFS handles large files efficiently  
✅ **Atomic operations** - Image and post saved together  
✅ **Easy backups** - Single database backup includes everything  
✅ **No broken links** - Images referenced by ID, not file paths  

---

## Migration

To migrate existing JSON data and photos to MongoDB:

```bash
node migrate-to-mongodb.js
```

This will:
1. Read `blg.json`
2. Upload images from `photos/` folder to GridFS
3. Create post documents with image references
4. Clear old data (optional)

---

## Storage Limits

**MongoDB Atlas Free Tier:**
- 512 MB total storage
- Includes both documents and GridFS files

**GridFS File Size:**
- Max file size: 16 MB per file (MongoDB document limit)
- For larger files, GridFS automatically chunks them

**Recommended Image Sizes:**
- Max upload: 10 MB (set in multer config)
- Recommended: < 2 MB per image for better performance

---

## Troubleshooting

**Images not displaying:**
- Check if imageId exists in post document
- Verify image exists in GridFS: `db.images.files.find()`
- Check browser network tab for 404 errors on `/api/image/:id`

**Upload fails:**
- Check multer limits (currently 10 MB)
- Verify MongoDB connection is active
- Check GridFS bucket name matches ('images')

**Migration fails:**
- Ensure photos exist in `photos/` folder
- Check file permissions
- Verify MongoDB connection string in `.env`
