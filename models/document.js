let mongoose = require('mongoose');

//document schema
let documentSchema = mongoose.Schema({
    document_type:{
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    author:{
        type: String,
        required: true
    },
    created_at:{
        type: Date,
        required: false
    },
    description:{
        type: String,
        required: false
    },
    tag:{
        type: String,
        required: false
    }
});

let Document = module.exports = mongoose.model('Document', documentSchema);