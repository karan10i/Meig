const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'photos')); // Save images in 'photos' directory
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName); // Ensure unique filenames
    }
});
// Route to handle random image fetch
router.get('/getRandomImage', (req, res) => {
    const photosDir = path.join(__dirname,'..', 'photos');
    fs.readdir(photosDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'cannot read photos dir' });
    if (!files || files.length === 0) return res.status(404).json({ error: 'no images' });
        const randomIndex = Math.floor(Math.random() * files.length);
        const randomImage = files[randomIndex];
        console.log('GET /getRandomImage ->', randomImage);
        res.json({ image: `/${path.join('photos', randomImage)}` });
    });
});

module.exports = router;
