# Personal Blog Platform

A modern, full-stack blog application built with Node.js, Express, and MongoDB. Features persistent storage with GridFS for images and a clean, responsive UI.

## 🚀 Features

- ✅ Create and publish blog posts with rich text content
- ✅ Upload and store images with GridFS (MongoDB)
- ✅ Persistent cloud storage - works on Render/Heroku
- ✅ Responsive design for mobile and desktop
- ✅ Random profile photo display
- ✅ Blog post preview with expand functionality
- ✅ Secure authentication-ready architecture
- ✅ RESTful API endpoints

## 📦 Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB with GridFS
- Multer (file uploads)

**Frontend:**
- Vanilla JavaScript
- HTML5/CSS3
- Responsive design

**Deployment:**
- Render (hosting)
- MongoDB Atlas (database)

## 🛠️ Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (free tier works)
- Git

### Local Setup

1. **Clone the repository:**
```bash
git clone https://github.com/karan10i/Meig.git
cd Meig
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Create a `.env` file in the root directory:
```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/blogDB?retryWrites=true&w=majority
```

Replace `<username>`, `<password>`, and `<cluster>` with your MongoDB Atlas credentials.

4. **Migrate existing data (optional):**

If you have existing blog data in `blg.json`:
```bash
node migrate-to-mongodb.js
```

5. **Start the server:**
```bash
node index.js
```

Server will run on `http://localhost:3000`

## 📁 Project Structure

```
Blog/
├── routes/
│   ├── db.js              # MongoDB connection module
│   ├── getdata.js         # Blog posts API routes
│   └── imageroutes.js     # Random image routes
├── public/
│   ├── Blog.html          # Main blog display page
│   ├── contact.html       # Contact page
│   ├── cons.html          # Conspire page
│   ├── style.css          # Main styles
│   ├── server-side.css    # Entry form styles
│   └── scripts/
│       ├── blog.js        # Blog display logic
│       └── cons.js        # Conspire page logic
├── photos/                # Local photos (legacy)
├── index.js               # Express server entry point
├── server-side.html       # Blog entry form
├── migrate-to-mongodb.js  # Migration script
├── MONGODB_SCHEMA.md      # Database schema documentation
├── package.json           # Dependencies
├── .env                   # Environment variables (not tracked)
└── .gitignore             # Git ignore rules
```

## 🔌 API Endpoints

### Blog Posts

#### `GET /api/getData`
Fetch all blog posts (sorted by newest first)

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "Heading": "Blog Title",
    "Text": "Blog content...",
    "image": "/api/image/507f1f77bcf86cd799439012",
    "createdAt": "2025-11-12T10:30:00.000Z"
  }
]
```

#### `POST /api/saveData`
Create a new blog post with optional image

**Request:** `multipart/form-data`
- `Heading` (required): Blog title
- `Text` (required): Blog content
- `blogImage` or `image` (optional): Image file

**Response:** Redirects to `/entry`

#### `GET /api/image/:id`
Retrieve image from MongoDB GridFS

**Parameters:**
- `id`: MongoDB ObjectId of the image

**Response:** Binary image data with appropriate Content-Type

### Random Images

#### `GET /api/getRandomImage`
Get a random profile photo from the photos directory

**Response:**
```json
{
  "image": "/photos/image.jpg"
}
```

## 🗄️ Database Schema

### Posts Collection
```javascript
{
  _id: ObjectId,
  heading: String,
  text: String,
  imageId: ObjectId | null,  // Reference to GridFS image
  createdAt: Date
}
```

### Images (GridFS)
- **images.files** - Image metadata
- **images.chunks** - Binary data chunks

See [MONGODB_SCHEMA.md](MONGODB_SCHEMA.md) for detailed schema documentation.

## 🚀 Deployment

### Deploy to Render

1. **Push code to GitHub:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Create a new Web Service on Render:**
   - Connect your GitHub repository
   - Build Command: `npm install`
   - Start Command: `node index.js`

3. **Add Environment Variables:**
   - Go to Environment tab
   - Add `MONGODB_URI` with your MongoDB Atlas connection string

4. **Deploy:**
   - Render will automatically deploy on every push to main

### MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user with read/write permissions
3. Whitelist IP addresses:
   - For development: Your local IP
   - For production: `0.0.0.0/0` (all IPs) or Render's IPs
4. Get your connection string and add to `.env`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |

### File Upload Limits

- Max file size: 10 MB (configured in `routes/getdata.js`)
- Supported formats: All image types (JPG, PNG, GIF, WebP, etc.)

## 📝 Usage

### Create a New Blog Post

1. Navigate to `http://localhost:3000/entry`
2. Fill in the blog title and content
3. Optionally upload an image
4. Click "Submit"
5. Post will appear on the main blog page

### View Blog Posts

1. Navigate to `http://localhost:3000/Blog.html`
2. Click on any blog heading to expand and read the full content
3. Click "Home" to return to the list view

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Karan Gupta**
- GitHub: [@karan10i](https://github.com/karan10i)
- LinkedIn: [Karan Gupta](https://www.linkedin.com/in/karan-gupta-50a298251/)
- Blog: [Philiphia](https://philiphia.blogspot.com)

## 🙏 Acknowledgments

- MongoDB Atlas for free cloud database hosting
- Render for free web service hosting
- Express.js community for excellent documentation

## 📚 Additional Documentation

- [MongoDB Schema Details](MONGODB_SCHEMA.md) - Complete database schema and API documentation
- [Migration Guide](migrate-to-mongodb.js) - Script for migrating from JSON to MongoDB

## 🐛 Troubleshooting

**Server won't start:**
- Check that MongoDB URI in `.env` is correct
- Verify MongoDB Atlas IP whitelist includes your IP
- Ensure Node.js version is 14 or higher

**Images not displaying:**
- Check if images were uploaded to GridFS
- Verify image route `/api/image/:id` is accessible
- Check browser console for 404 errors

**Posts not saving:**
- Verify form has `enctype="multipart/form-data"`
- Check server logs for errors
- Ensure MongoDB connection is active

**Migration fails:**
- Ensure `blg.json` exists and is valid JSON
- Check that photos exist in `photos/` directory
- Verify MongoDB connection string

## 🔮 Future Enhancements

- [ ] User authentication with Auth0
- [ ] Post categories and tags
- [ ] Search functionality
- [ ] Comment system
- [ ] Rich text editor
- [ ] Draft posts
- [ ] Post analytics
- [ ] Social media sharing

---

Made with ❤️ by Karan Gupta
