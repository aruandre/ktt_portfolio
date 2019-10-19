let mongoose = require('mongoose');

//news schema
let servicesSchema = mongoose.Schema({
    title:{
        type: String,
        //required: true
    },
    description:{
        type: String
    }
});

let Services = module.exports = mongoose.model('Services', servicesSchema);