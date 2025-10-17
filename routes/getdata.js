const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer'); // 1. Import multer here
const router = express.Router();

// 2. Configure multer inside the file that uses it
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Go up one directory from 'routes' to find the 'photos' folder
        cb(null, path.join(__dirname, '..', 'photos')); 
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

router.get('/getData', (req, res) => {
  // Correct path
const filePath = path.join(__dirname, '..', 'blg.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading blg.json:', err);
      return res.status(500).json({ error: 'Error reading data file' });
    }
    try {
      const json = data ? JSON.parse(data) : [];
      res.json(json);
    } catch (parseErr) {
      console.error('Error parsing blg.json:', parseErr);
      res.status(500).json({ error: 'Invalid data format' });
    }
  });
});
router.post('/saveData', upload.single('blogImage'), (req, res) => {
   const newData = {
        ...req.body,
        image: req.file ? `/photos/${req.file.filename}` : null // Save the image path
    };
    const filePath = path.join(__dirname, '..', 'blg.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).send('Error reading data file.');
        }
        const jsonData = data ? JSON.parse(data) : [];
        jsonData.unshift(newData);
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                return res.status(500).send('Error saving data.');
            }
            // It's better to redirect after a form submission
            res.redirect('/entry'); 
        });
    });
});

module.exports = router;