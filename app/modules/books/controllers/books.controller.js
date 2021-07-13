const fs = require('fs');
const path = require('path');
// const pathToDataFile = '../data/books.json';
const pathToDataFile = path.join(__dirname, '../data/books.json');
exports.fetchSampleData = async function(req, res) {
    try {
        let rawdata = fs.readFileSync(pathToDataFile);
        let books = JSON.parse(rawdata);
        res.status(200).json({ 
            status: true,
            msg: 'success', 
            data: books
        });   
    } catch (error) {
        res.status(500).json({ 
            status: false, 
            msg: error, 
            data: [] 
        });
    }
};
