let mongoose = require('mongoose');

//document schema
let uploadSchema = mongoose.Schema({
    path:{
        type: String
    }
});

let Upload = module.exports = mongoose.model('Upload', uploadSchema);