const express = require('express');
const path = require('path');
const bodyparser=require('body-parser');
const fs = require('fs');
const multer = require('multer'); // For handling file uploads
const img_up = require('./routes/imageroutes');
const dataRoutes = require('./routes/getdata');
const app = express();
const imageroutes = require('./routes/imageroutes');

app.use('/api', imageroutes);
app.use(express.json());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use('/photos', express.static(path.join(__dirname, 'photos')));
app.use(express.static(path.join(__dirname, 'public')));  
app.get('/entry', (req, res) => {
    res.sendFile(path.join(__dirname, 'server-side.html')); 
});

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

app.use('/api', img_up);
app.use('/api', dataRoutes);
app.listen(3000,()=>{
    console.log("server running");
})
