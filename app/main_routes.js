const express = require('express');
const app = express();

const booksAPI = require('./modules/books/books_main_routes');
app.use('/booksAPI', booksAPI);


module.exports = app;