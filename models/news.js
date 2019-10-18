let mongoose = require('mongoose');

//news schema
let newsSchema = mongoose.Schema({
    title:{
        type: String,
        //required: true
    },
    date:{
        type: Date
    },
    description:{
        type: String
    }
});

let News = module.exports = mongoose.model('News', newsSchema);