// const express = require('express');
import express from 'express';
import routes from './routes/index';
// const router = require('./routes/index');

const app = express();
const port = process.env.PORT || 5000;

// Load routes from routes/index.js
// const routes = require('./routes/index');
app.use('/', routes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
