const express = require('express');
const controller = require('../controllers/books.controller');
const middleware = require('../middlewares/rateLimiter');
const app = express();

app.route('/books').get(middleware.customRedisRateLimiter, controller.fetchSampleData);
// app.route('/books').get(customRedisRateLimiter, controller.fetchSampleData);

module.exports = app;