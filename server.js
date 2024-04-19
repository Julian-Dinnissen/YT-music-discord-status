const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000; // Change this to the desired port number

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// GET request handler
app.get('/file', (req, res) => {
    // Read and serve the file
    fs.readFile('C:/Users/Julian/OneDrive - Quadraam/Documenten/Github/YT-music-discord-status/song.json', (err, data) => {
        if (err) {
            res.status(500).send('Error reading the file');
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

// POST request handler
app.post('/file', (req, res) => {
    // Handle POST request data
    console.log('Received POST request:', req.body);
    res.send('POST request received');
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
