const express = require('express');
const cors = require('cors');
const config = require('./config');
const app = express();

app.use(cors());
app.use(express.urlencoded({
    extended: true
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

const server = require('http').createServer(app);
server.listen(config.app.port, () => {
    console.log(`Server listening on port ${config.app.port}`);
});

const mainRoutes = require('./app/main_routes');
app.use('/api', mainRoutes);

module.exports = app;