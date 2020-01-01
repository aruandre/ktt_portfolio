let mongoose = require('mongoose');

//news schema
let servicesSchema = mongoose.Schema({
    title:{
        type: String,
    },
    description:{
        type: String
    }
});

servicesSchema.set('timestamps', true);
let Services = module.exports = mongoose.model('Services', servicesSchema);