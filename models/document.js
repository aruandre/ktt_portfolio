let mongoose = require('mongoose');

//document schema
let documentSchema = mongoose.Schema({
    document_type:{
        type: String,
        //required: true
    },
    title:{
        type: String,
        //required: true
    },
    author:[{
        type: String,
        trim: true
        //required: true
    }],
    created_at:{
        type: Date
    },
    description:{
        type: String
    },
    tag:{
        type: Array
    },
    status:{
        type: Boolean,
        default: false,
        //required: true
    },
    path:{
        type: String,
        required: false
    },
    timestamp:{
        type: Date,
        default: Date.now
    }
});

let Document = module.exports = mongoose.model('Document', documentSchema);