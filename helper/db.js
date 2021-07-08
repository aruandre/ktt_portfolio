const mongoose = require('mongoose');
const config = require('../config/database');


function dbConn(){
    //db connection
    mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true });
    let db = mongoose.connection;
    
    //check connection
    db.once('open', () => {
        console.log('Connected to MongoDB');
    });
    
    //check for db errors
    db.on('error', (err) => {
        console.log(err);
    });
}

module.exports.dbConn = dbConn;