let mongoose = require('mongoose');
let moment = require('moment');
require('moment/locale/et');

//news schema
let newsSchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    date:{
        type: String,
        default: () => moment().locale('et').format("dd.MM.YYYY")
    },
    time:{
        type: String,
        default: () => moment().locale('et').format("hh:mm")
    },
    description:{
        type: String
    }
});

let News = module.exports = mongoose.model('News', newsSchema);