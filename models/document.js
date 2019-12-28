let mongoose = require('mongoose');
let moment = require('moment');
require('moment/locale/et');

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
    author:[{
        type: String,
        trim: true,
        required: true
    }],
    documentCreated_at:{
        type: String,
        default: () => moment().locale('et').format("dd.MM.YYYY")
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

documentSchema.set('timestamps', true);

let Document = module.exports = mongoose.model('Document', documentSchema);