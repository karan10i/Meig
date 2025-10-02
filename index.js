const express = require('express');
const path = require('path');
const bodyparser=require('body-parser');
const fs = require('fs');
const multer = require('multer'); // For handling file uploads
const app = express();
app.use(express.json());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use('/photos', express.static(path.join(__dirname, 'photos')));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/entry',(req,res)=>{
 res.sendFile(path.join(__dirname,'server-side.html'));   
})

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'photos')); // Save images in 'photos' directory
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName); // Ensure unique filenames
    }
});
const upload = multer({ storage });

// Route to handle image and data upload
app.get('/getRandomImage', (req, res) => {
    const photosDir = path.join(__dirname, 'photos');
    fs.readdir(photosDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'cannot read photos dir' });
    if (!files || files.length === 0) return res.status(404).json({ error: 'no images' });
        const randomIndex = Math.floor(Math.random() * files.length);
        const randomImage = files[randomIndex];
        console.log('GET /getRandomImage ->', randomImage);
        res.json({ image: `/${path.join('photos', randomImage)}` });
    });
});
app.post('/saveData', (req, res) => {
    const newData = req.body;
    const filePath = 'blg.json';

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading data file.');
        }
        let jsonData = [];
        if (data) jsonData = JSON.parse(data);
        jsonData.unshift(newData); 
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error('Error writing file:', writeErr);
                return res.status(500).send('Error saving data.');
            }
            res.status(200).send('Data successfully added to JSON file.');
        });
    });

})
app.get('/getData', (req, res) => {
  const filePath = path.join(__dirname, 'blg.json');
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

app.listen(3000,()=>{
    console.log("server running");
})
