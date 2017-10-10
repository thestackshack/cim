'use strict';

const express = require('express');

// Constants
const PORT = 8000;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/*', (req, res) => {
    res.send('Thanks for using CIM!  '+req.path+'\n');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);