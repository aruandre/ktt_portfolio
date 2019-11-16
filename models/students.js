const mongoose = require('mongoose');

const StudentsSchema = mongoose.Schema({
    firstname:{
        type: String,
        required: true
    },
    lastname:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: false
    },
    portfolio_link:{
        type: String,
        required: false
    }
});

const Students = module.exports = mongoose.model('Students', StudentsSchema);