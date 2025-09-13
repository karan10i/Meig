const express = require('express');
const path = require('path');
const bodyparser=require('body-parser');
const fs = require('fs');
const multer = require('multer'); // For handling file uploads
const app = express();
app.use(express.json());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public')));
app.get('/',(req,res)=>{
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
app.post('/saveData', upload.single('image'), (req, res) => {
    const newData = req.body;
    const filePath = 'blg.json';

    // Add image path to the blog data
    if (req.file) {
        newData.image = `photos/${req.file.filename}`;
    }

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



app.listen(3000,()=>{
    console.log("server running");
})
