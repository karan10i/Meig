const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer'); 
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'photos')); 
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });
const uploadFields = upload.fields([
  { name: 'blogImage', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);

router.get('/getData', (req, res) => {
  const filePath = path.join(__dirname, '..', 'blg.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.warn('blg.json not found, returning empty array');
        return res.json([]);
      }
      console.error('Error reading blg.json:', err);
      return res.status(500).json({ error: 'Error reading data file' });
    }

    try {
      const trimmed = data && data.trim();
      const json = trimmed ? JSON.parse(trimmed) : [];
      return res.json(json);
    } catch (parseErr) {
      console.error('Error parsing blg.json:', parseErr);
      // Attempt to repair: replace literal newlines inside JSON string literals with escaped \n
      try {
        const repairedText = sanitizeJsonStringLiterals(data);
        const json = JSON.parse(repairedText);
        // backup original file and write repaired content
        const bakPath = filePath + '.bak';
        fs.copyFile(filePath, bakPath, (copyErr) => {
          if (copyErr) console.warn('Could not create backup of blg.json:', copyErr);
          fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', (writeErr) => {
            if (writeErr) console.error('Failed to write repaired blg.json:', writeErr);
            else console.info('Repaired blg.json written; backup at', bakPath);
          });
        });
        return res.json(json);
      } catch (repairErr) {
        console.error('Failed to auto-repair blg.json:', repairErr);
        return res.status(500).json({ error: 'Invalid data format' });
      }
    }
  });
});

// Replace literal CR/LF characters inside JSON string literals with escaped \n so JSON.parse will succeed.
function sanitizeJsonStringLiterals(raw) {
  let out = '';
  let inString = false;
  let escape = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (!inString) {
      if (ch === '"') {
        inString = true;
        out += ch;
        escape = false;
        continue;
      }
      out += ch;
    } else {
      // in string
      if (escape) {
        // previous was backslash, preserve escape and current char
        out += ch;
        escape = false;
        continue;
      }
      if (ch === '\\') {
        out += ch;
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
        out += ch;
        continue;
      }
      // replace raw newlines/carriage returns with escaped \n
      if (ch === '\n') {
        out += '\\n';
        continue;
      }
      if (ch === '\r') {
        // skip CR (it will be followed by LF) but ensure \n present
        // peek next char
        const next = raw[i+1];
        if (next === '\n') {
          // consume CR; the following LF will be handled in its iteration
          continue;
        }
        out += '\\n';
        continue;
      }
      out += ch;
    }
  }
  return out;
}

router.post('/saveData', uploadFields, (req, res) => {
  // Debug logs to trace incoming payloads
  console.log('POST /api/saveData Content-Type:', req.headers['content-type']);
  console.log('Fields:', req.body);
  const file = (req.files && req.files.blogImage && req.files.blogImage[0]) ||
         (req.files && req.files.image && req.files.image[0]) || null;

  // Basic validation to prevent empty entries
  const { Heading, Text } = req.body || {};
  if (!Heading || !Text) {
    return res.status(400).json({ error: 'Heading and Text are required.' });
  }

  const newData = {
    Heading,
    Text,
    image: file ? `/photos/${file.filename}` : null // Save the image path
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