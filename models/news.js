let mongoose = require('mongoose');
let moment = require('moment');

//news schema
let newsSchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    date:{
        type: String,
        default: () => moment().format('dd.MM.YYYY')
    },
    description:{
        type: String
    }
});

let News = module.exports = mongoose.model('News', newsSchema);