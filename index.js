const express = require('express');
const path = require('path');
const bodyparser=require('body-parser');
const app = express();
const imageroutes = require('./routes/imageroutes');
const dataRoutes = require('./routes/getdata');
// Middleware setup
app.use(express.json());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use('/photos', express.static(path.join(__dirname, 'photos')));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', imageroutes);
app.use('/api', dataRoutes);

app.get('/entry', (req, res) => {
    res.sendFile(path.join(__dirname, 'server-side.html')); 
});
app.listen(3000,()=>{
    console.log("server running");
})
